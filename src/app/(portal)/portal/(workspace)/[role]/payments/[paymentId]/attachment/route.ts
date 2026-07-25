import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  portalApiUrl,
  REAL_PORTAL_SESSION_COOKIE,
} from "@/lib/portal/auth-config";

type RouteContext = {
  readonly params: Promise<{ role: string; paymentId: string }>;
};

// Browsers can't attach the backend's Bearer session token to a cross-origin
// <img>/<a> request, so this same-origin route proxies the authenticated
// fetch server-side and streams the bytes back.
export async function GET(_request: Request, { params }: RouteContext) {
  const { paymentId } = await params;
  const token = (await cookies()).get(REAL_PORTAL_SESSION_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const response = await fetch(
    `${portalApiUrl}/payments/${encodeURIComponent(paymentId)}/attachment`,
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
