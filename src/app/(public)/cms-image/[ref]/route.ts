import { NextResponse } from "next/server";

const apiUrl = process.env.PORTAL_API_URL ?? "http://localhost:4000";

type RouteContext = {
  readonly params: Promise<{ ref: string }>;
};

// Same-origin proxy for admin-uploaded CMS images (news/event photos). The
// backend endpoint only resolves the fixed `cms-images/` prefix, so this can't
// be used to read other objects.
export async function GET(_request: Request, { params }: RouteContext) {
  const { ref } = await params;
  const response = await fetch(
    `${apiUrl}/public/cms-image/${encodeURIComponent(ref)}`,
    { cache: "no-store" },
  );
  if (!response.ok) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const bytes = await response.arrayBuffer();
  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "content-type":
        response.headers.get("content-type") ?? "application/octet-stream",
      "cache-control": "public, max-age=86400",
    },
  });
}
