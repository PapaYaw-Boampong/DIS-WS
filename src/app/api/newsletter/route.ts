import {
  cleanText,
  formErrorResponse,
  getClientAddress,
  isEmail,
  isRateLimited,
  readJsonObject,
  subscribeContact,
} from "@/lib/server/forms";

export async function POST(request: Request) {
  const address = getClientAddress(request);

  if (isRateLimited(`newsletter:${address}`)) {
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

  const firstName = cleanText(body.firstName, 80);
  const email = cleanText(body.email, 200).toLowerCase();
  const consent = body.consent === true;

  if (!isEmail(email) || !consent) {
    return Response.json(
      {
        message:
          "Enter a valid email address and confirm your subscription.",
      },
      { status: 400 },
    );
  }

  try {
    await subscribeContact({ email, firstName });
    return Response.json({ ok: true });
  } catch (error) {
    return formErrorResponse(error);
  }
}
