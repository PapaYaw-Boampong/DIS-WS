import "server-only";

// When true, the portal authenticates against the real backend service; when
// false (default), it uses the in-memory mock cookie session. This lets the app
// run with no backend and flips to real auth once the API + database are up.
export const useRealPortalAuth = process.env.USE_REAL_PORTAL_AUTH === "true";

export const portalApiUrl =
  process.env.PORTAL_API_URL ?? "http://localhost:4000";

// First-party httpOnly cookie holding the backend session token (BFF pattern).
export const REAL_PORTAL_SESSION_COOKIE = "dis_portal_session";

export const PORTAL_SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours
