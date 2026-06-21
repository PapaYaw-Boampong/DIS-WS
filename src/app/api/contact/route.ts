import {
  cleanText,
  formErrorResponse,
  getClientAddress,
  isEmail,
  isRateLimited,
  readJsonObject,
  sendFormEmail,
} from "@/lib/server/forms";

const contactReasons = new Set([
  "admissions",
  "academics",
  "portal-support",
  "location",
  "general",
]);

export async function POST(request: Request) {
  const address = getClientAddress(request);

  if (isRateLimited(`contact:${address}`)) {
    return Response.json(
      { message: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  const body = await readJsonObject(request);

  if (!body) {
    return Response.json(
      { message: "Submit a valid form request." },
      { status: 400 },
    );
  }

  const website = cleanText(body.website, 200);

  if (website) {
    return Response.json({ ok: true });
  }

  const name = cleanText(body.name, 100);
  const email = cleanText(body.email, 200).toLowerCase();
  const phone = cleanText(body.phone, 50);
  const reason = cleanText(body.reason, 80);
  const message = cleanText(body.message, 2_000);

  if (
    !name ||
    !isEmail(email) ||
    !contactReasons.has(reason) ||
    !message
  ) {
    return Response.json(
      { message: "Review the required fields and try again." },
      { status: 400 },
    );
  }

  try {
    await sendFormEmail({
      type: "contact",
      subject: `Website contact enquiry: ${reason}`,
      replyTo: email,
      fields: [
        { label: "Name", value: name },
        { label: "Email", value: email },
        { label: "Phone", value: phone },
        { label: "Reason", value: reason },
        { label: "Message", value: message },
      ],
    });

    return Response.json({ ok: true });
  } catch (error) {
    return formErrorResponse(error);
  }
}
