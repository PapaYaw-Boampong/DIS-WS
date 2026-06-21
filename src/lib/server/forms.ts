import "server-only";

import { randomUUID } from "node:crypto";

type FormField = {
  label: string;
  value: string;
};

type SendFormEmailInput = {
  type: "admissions" | "contact";
  subject: string;
  replyTo: string;
  fields: readonly FormField[];
};

const resendApiUrl = "https://api.resend.com";
const rateLimitWindowMs = 10 * 60 * 1000;
const rateLimitMaxRequests = 5;
const rateLimits = new Map<string, number[]>();

function getResendApiKey() {
  return process.env.RESEND_API_KEY?.trim();
}

function getFormsToEmail() {
  return (
    process.env.FORMS_TO_EMAIL?.trim() ??
    "info@divineschool.edu.gh"
  );
}

function getFormsFromEmail() {
  return process.env.FORMS_FROM_EMAIL?.trim();
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function requireResendConfig() {
  const apiKey = getResendApiKey();
  const from = getFormsFromEmail();

  if (!apiKey || !from) {
    throw new Error("FORM_DELIVERY_NOT_CONFIGURED");
  }

  return { apiKey, from };
}

async function resendRequest(
  path: string,
  body: Record<string, unknown>,
  idempotencyKey?: string,
) {
  const apiKey = getResendApiKey();

  if (!apiKey) {
    throw new Error("FORM_DELIVERY_NOT_CONFIGURED");
  }
  const response = await fetch(`${resendApiUrl}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(idempotencyKey
        ? { "Idempotency-Key": idempotencyKey }
        : {}),
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`RESEND_REQUEST_FAILED:${response.status}:${detail}`);
  }

  return response.json() as Promise<Record<string, unknown>>;
}

export function getClientAddress(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() || "unknown";
}

export function isRateLimited(key: string) {
  const now = Date.now();
  const active = (rateLimits.get(key) ?? []).filter(
    (timestamp) => now - timestamp < rateLimitWindowMs,
  );

  if (active.length >= rateLimitMaxRequests) {
    rateLimits.set(key, active);
    return true;
  }

  active.push(now);
  rateLimits.set(key, active);
  return false;
}

export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function cleanText(
  value: unknown,
  maximumLength: number,
) {
  return typeof value === "string"
    ? value.trim().slice(0, maximumLength)
    : "";
}

export async function readJsonObject(request: Request) {
  try {
    const body = (await request.json()) as unknown;

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return null;
    }

    return body as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function sendFormEmail({
  type,
  subject,
  replyTo,
  fields,
}: SendFormEmailInput) {
  const { from } = requireResendConfig();
  const rows = fields
    .map(
      ({ label, value }) =>
        `<tr><th align="left" style="padding:8px 12px;border-bottom:1px solid #e8ded0">${escapeHtml(label)}</th><td style="padding:8px 12px;border-bottom:1px solid #e8ded0">${escapeHtml(value || "Not provided")}</td></tr>`,
    )
    .join("");
  const text = fields
    .map(({ label, value }) => `${label}: ${value || "Not provided"}`)
    .join("\n");

  return resendRequest(
    "/emails",
    {
      from,
      to: [getFormsToEmail()],
      reply_to: replyTo,
      subject,
      html: `<h1>${escapeHtml(subject)}</h1><table style="border-collapse:collapse">${rows}</table>`,
      text: `${subject}\n\n${text}`,
      tags: [{ name: "form_type", value: type }],
    },
    `${type}-${randomUUID()}`,
  );
}

export async function subscribeContact({
  email,
  firstName,
}: {
  email: string;
  firstName: string;
}) {
  const segmentId =
    process.env.RESEND_NEWSLETTER_SEGMENT_ID?.trim();

  try {
    return await resendRequest("/contacts", {
      email,
      first_name: firstName || undefined,
      unsubscribed: false,
      ...(segmentId ? { segments: [{ id: segmentId }] } : {}),
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.startsWith("RESEND_REQUEST_FAILED:409:")
    ) {
      return { existing: true };
    }

    throw error;
  }
}

export function formErrorResponse(error: unknown) {
  if (
    error instanceof Error &&
    error.message === "FORM_DELIVERY_NOT_CONFIGURED"
  ) {
    return Response.json(
      {
        message:
          "Online delivery is not configured yet. Please contact the school directly.",
      },
      { status: 503 },
    );
  }

  console.error("Form delivery failed", error);
  return Response.json(
    {
      message:
        "We could not submit your request right now. Please try again or contact the school directly.",
    },
    { status: 502 },
  );
}
