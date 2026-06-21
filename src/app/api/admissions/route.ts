import {
  cleanText,
  formErrorResponse,
  getClientAddress,
  isEmail,
  isRateLimited,
  readJsonObject,
  sendFormEmail,
} from "@/lib/server/forms";

const academicLevels = new Set([
  "early-years",
  "primary",
  "junior-high",
  "not-sure",
]);

export async function POST(request: Request) {
  const address = getClientAddress(request);

  if (isRateLimited(`admissions:${address}`)) {
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

  const guardianName = cleanText(body.guardianName, 100);
  const email = cleanText(body.email, 200).toLowerCase();
  const phone = cleanText(body.phone, 50);
  const learnerName = cleanText(body.learnerName, 100);
  const academicLevel = cleanText(body.academicLevel, 80);
  const message = cleanText(body.message, 2_000);

  if (
    !guardianName ||
    !isEmail(email) ||
    !phone ||
    !learnerName ||
    !academicLevels.has(academicLevel)
  ) {
    return Response.json(
      { message: "Review the required fields and try again." },
      { status: 400 },
    );
  }

  try {
    await sendFormEmail({
      type: "admissions",
      subject: `Admissions enquiry: ${learnerName}`,
      replyTo: email,
      fields: [
        { label: "Parent or guardian", value: guardianName },
        { label: "Email", value: email },
        { label: "Phone", value: phone },
        { label: "Learner", value: learnerName },
        { label: "Academic level", value: academicLevel },
        { label: "Message", value: message },
      ],
    });

    return Response.json({ ok: true });
  } catch (error) {
    return formErrorResponse(error);
  }
}
