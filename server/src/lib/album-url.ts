// Validation for externally hosted photo-album links.
//
// An admin pastes a share URL and the school then publishes it on its public
// website, so the link carries the school's implied endorsement. A typo, a
// copied tracking link, or a pasted phishing address must not be publishable —
// so the host is checked against an allowlist rather than merely requiring
// "some https URL".

const ALLOWED_HOSTS: Record<string, string> = {
  "photos.app.goo.gl": "google_photos",
  "photos.google.com": "google_photos",
  "goo.gl": "google_photos",
};

export type AlbumUrlResult =
  | { ok: true; url: string; provider: string }
  | { ok: false; error: "invalid_url" | "insecure_url" | "host_not_allowed" };

export function validateAlbumUrl(raw: string): AlbumUrlResult {
  let parsed: URL;
  try {
    parsed = new URL(raw.trim());
  } catch {
    return { ok: false, error: "invalid_url" };
  }

  // http:// would send families to an unencrypted page from the school site.
  if (parsed.protocol !== "https:") {
    return { ok: false, error: "insecure_url" };
  }

  const host = parsed.hostname.toLowerCase();
  const provider = ALLOWED_HOSTS[host];
  if (!provider) {
    return { ok: false, error: "host_not_allowed" };
  }

  // Rebuilt from the parsed URL rather than echoed back, so credentials or a
  // stray fragment cannot ride along into the published link.
  const clean = new URL(`${parsed.origin}${parsed.pathname}${parsed.search}`);
  return { ok: true, url: clean.toString(), provider };
}

export const allowedAlbumHosts = Object.keys(ALLOWED_HOSTS);
