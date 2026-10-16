import "server-only";

// When true, the portal authenticates against the real backend service; when
// false (default), it uses the in-memory mock cookie session. This lets the app
// run with no backend and flips to real auth once the API + database are up.
export const useRealPortalAuth = process.env.USE_REAL_PORTAL_AUTH === "true";

/**
 * Whether the passwordless demo login may run at all.
 *
 * The mock login hands out a session for any role with no credential. That is
 * fine locally and in a demo, and catastrophic on a public deployment: anyone
 * who finds /portal could pick "Administrator". Forgetting to set
 * USE_REAL_PORTAL_AUTH must not be enough to expose the school's data, so the
 * demo login is refused outright in production regardless of the flag.
 */
export const mockPortalAuthAllowed =
  !useRealPortalAuth && process.env.NODE_ENV !== "production";

// True when the portal cannot authenticate anyone: a production build with no
// real backend configured. The sign-in page says so instead of offering a door
// that should not exist.
export const portalAuthUnavailable = !useRealPortalAuth && !mockPortalAuthAllowed;

export const portalApiUrl =
  process.env.PORTAL_API_URL ?? "http://localhost:4000";

// First-party httpOnly cookie holding the backend session token (BFF pattern).
export const REAL_PORTAL_SESSION_COOKIE = "dis_portal_session";

export const PORTAL_SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours

// Holds the outstanding two-factor challenge between the password step and the
// code step. Short-lived and httpOnly — it is not a session and cannot be used
// as one, but it must not leak into a URL or a log either.
export const MFA_CHALLENGE_COOKIE = "dis_portal_mfa_challenge";
