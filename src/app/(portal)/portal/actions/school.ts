"use server";

import { revalidatePath } from "next/cache";

import type { PortalCapability } from "@/lib/portal/capabilities";
import { portalApiPost, useRealPortalAuth } from "@/lib/portal/data/api";
import { getCapableSession } from "@/lib/portal/permissions";

// School setup writes that used to be browser-only previews: classes, the fee
// catalogue, invoice assignment, and transport trip status.

export type SchoolActionResult = {
  readonly ok: boolean;
  readonly message: string;
};

async function submit(
  capability: PortalCapability,
  path: string,
  payload: unknown,
  successMessage: string,
  previewMessage: string,
): Promise<SchoolActionResult> {
  if (!(await getCapableSession(capability))) {
    return {
      ok: false,
      message: "Your role does not currently have permission for this action.",
    };
  }

  if (!useRealPortalAuth) {
    return { ok: true, message: previewMessage };
  }

  const result = await portalApiPost(path, payload);

  if (!result.ok) {
    return {
      ok: false,
      message:
        result.status === 403
          ? "Your account is not allowed to make this change."
          : "The school database rejected the change. Check the details and try again.",
    };
  }

  revalidatePath("/portal", "layout");

  return { ok: true, message: successMessage };
}

export async function createClass(input: {
  readonly name: string;
  readonly level: string;
  readonly classTeacher: string;
}): Promise<SchoolActionResult> {
  if (!input.name.trim()) {
    return { ok: false, message: "Enter a class name." };
  }

  return submit(
    "classes.manage",
    "/classes",
    {
      name: input.name.trim(),
      level: input.level,
      classTeacher: input.classTeacher.trim(),
    },
    `${input.name.trim()} was created${input.classTeacher.trim() ? ` with ${input.classTeacher.trim()} as class teacher` : ""}.`,
    `${input.name.trim()} was captured. Creating the class needs the school database, which is not connected yet.`,
  );
}

export async function createFeeItem(input: {
  readonly title: string;
  readonly category: string;
  readonly amount: number;
  readonly term: string;
  readonly academicYear: string;
  readonly dueDate: string;
}): Promise<SchoolActionResult> {
  if (!input.title.trim()) {
    return { ok: false, message: "Enter a fee title." };
  }
  if (!Number.isInteger(input.amount) || input.amount <= 0) {
    return { ok: false, message: "Enter a valid whole-cedi amount above zero." };
  }

  const amountLabel = `GHS ${input.amount.toLocaleString("en-GH")}`;

  return submit(
    "finance.manage",
    "/fee-items",
    {
      title: input.title.trim(),
      category: input.category,
      amount: input.amount,
      term: input.term,
      academicYear: input.academicYear,
      dueDate: input.dueDate,
    },
    `"${input.title.trim()}" (${amountLabel}) was added to the fee catalogue. It does not bill anyone until it is put on an invoice.`,
    `"${input.title.trim()}" (${amountLabel}) was captured. Saving the fee item needs the school database, which is not connected yet.`,
  );
}

export async function createInvoice(input: {
  readonly studentId: string;
  readonly feeItemIds: readonly string[];
  readonly dueDate: string;
}): Promise<SchoolActionResult> {
  if (!input.studentId) {
    return { ok: false, message: "Choose a learner." };
  }
  if (input.feeItemIds.length === 0) {
    return { ok: false, message: "Choose at least one fee item." };
  }

  return submit(
    "finance.manage",
    "/invoices",
    {
      studentId: input.studentId,
      feeItemIds: input.feeItemIds,
      dueDate: input.dueDate,
    },
    `Invoice raised with ${input.feeItemIds.length} fee item${input.feeItemIds.length === 1 ? "" : "s"}. The total is calculated from the fee catalogue.`,
    `Invoice captured with ${input.feeItemIds.length} fee item${input.feeItemIds.length === 1 ? "" : "s"}. Raising it needs the school database, which is not connected yet.`,
  );
}

export async function updateTripStatus(input: {
  readonly routeId: string;
  readonly status: string;
  readonly nextStop: string;
  readonly notifyParents: boolean;
}): Promise<SchoolActionResult> {
  if (!input.routeId) {
    return { ok: false, message: "Choose a route." };
  }

  return submit(
    "transport.manage",
    "/transport/trips",
    input,
    input.notifyParents
      ? `Trip status saved as "${input.status}". Families on this route have been notified.`
      : `Trip status saved as "${input.status}".`,
    `Trip status "${input.status}" captured. Saving it needs the school database, which is not connected yet.`,
  );
}
