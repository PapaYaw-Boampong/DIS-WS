import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  portalApiUrl,
  REAL_PORTAL_SESSION_COOKIE,
} from "@/lib/portal/auth-config";

type RouteContext = {
  readonly params: Promise<{ role: string; docId: string }>;
};

// Same-origin proxy: the browser can't attach the backend Bearer token to a
// cross-origin download, so this route forwards the authenticated request
// server-side. The backend enforces the audience/role + downloadable checks.
export async function GET(_request: Request, { params }: RouteContext) {
  const { docId } = await params;
  const token = (await cookies()).get(REAL_PORTAL_SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const response = await fetch(
    `${portalApiUrl}/documents/${encodeURIComponent(docId)}/download`,
    { headers: { authorization: `Bearer ${token}` }, cache: "no-store" },
  );
  if (!response.ok) {
    return NextResponse.json(
      { error: "unavailable" },
      { status: response.status },
    );
  }

  const bytes = await response.arrayBuffer();
  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "content-type":
        response.headers.get("content-type") ?? "application/octet-stream",
      ...(response.headers.get("content-disposition")
        ? {
            "content-disposition":
              response.headers.get("content-disposition") ?? "",
          }
        : {}),
      "cache-control": "private, no-store",
    },
  });
}
