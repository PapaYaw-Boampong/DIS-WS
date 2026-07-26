import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  portalApiUrl,
  REAL_PORTAL_SESSION_COOKIE,
} from "@/lib/portal/auth-config";

type RouteContext = {
  readonly params: Promise<{
    role: string;
    courseId: string;
    assignmentId: string;
    submissionId: string;
  }>;
};

// Same-origin proxy for a submission download (browsers can't attach the
// backend's Bearer token to a cross-origin request) — mirrors the payment
// attachment and course-material download routes.
export async function GET(_request: Request, { params }: RouteContext) {
  const { submissionId } = await params;
  const token = (await cookies()).get(REAL_PORTAL_SESSION_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const response = await fetch(
    `${portalApiUrl}/submissions/${encodeURIComponent(submissionId)}/download`,
    { headers: { authorization: `Bearer ${token}` }, cache: "no-store" },
  );

  if (!response.ok) {
    return NextResponse.json(
      { error: "not_found" },
      { status: response.status },
    );
  }

  const contentType =
    response.headers.get("content-type") ?? "application/octet-stream";
  const contentDisposition = response.headers.get("content-disposition");
  const bytes = await response.arrayBuffer();

  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "content-type": contentType,
      ...(contentDisposition
        ? { "content-disposition": contentDisposition }
        : {}),
      "cache-control": "private, no-store",
    },
  });
}
