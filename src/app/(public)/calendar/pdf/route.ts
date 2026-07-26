import { NextResponse } from "next/server";

const apiUrl = process.env.PORTAL_API_URL ?? "http://localhost:4000";

// Same-origin proxy for the published school-calendar PDF so PDF.js can load it
// without cross-origin concerns. The backend endpoint is public (published
// document only); this route just streams the bytes through.
export async function GET() {
  const response = await fetch(`${apiUrl}/public/calendar/pdf`, {
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const bytes = await response.arrayBuffer();
  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "content-type": "application/pdf",
      "cache-control": "public, max-age=60",
    },
  });
}
