// Login throttling.
//
// Two independent counters, because they stop different attacks:
//   - per ACCOUNT: someone guessing one user's password, from anywhere.
//   - per IP: someone spraying one common password across many accounts.
// Tripping either one locks that key out for the cooldown.
//
// State is in-process. That is honest for the current single-instance Render
// service and it fails closed on restart (counters reset, which only ever
// helps a legitimate user). If the API is ever scaled to multiple instances,
// this must move to Postgres or Redis or it becomes trivially bypassable by
// spreading attempts across instances.

type Bucket = {
  failures: number;
  firstFailureAt: number;
  lockedUntil: number;
};

const WINDOW_MS = 15 * 60 * 1000;
const LOCKOUT_MS = 15 * 60 * 1000;
const MAX_FAILURES_PER_ACCOUNT = 5;
const MAX_FAILURES_PER_IP = 20;

const buckets = new Map<string, Bucket>();

// Bound the map so a spray across millions of fabricated addresses cannot grow
// it without limit. Expired entries are dropped first; only if everything is
// still live does it evict the oldest.
const MAX_TRACKED_KEYS = 10_000;

function sweep(now: number): void {
  for (const [key, bucket] of buckets) {
    const expired =
      bucket.lockedUntil < now && now - bucket.firstFailureAt > WINDOW_MS;
    if (expired) buckets.delete(key);
  }

  if (buckets.size <= MAX_TRACKED_KEYS) return;

  const oldest = [...buckets.entries()]
    .sort((a, b) => a[1].firstFailureAt - b[1].firstFailureAt)
    .slice(0, buckets.size - MAX_TRACKED_KEYS);
  for (const [key] of oldest) buckets.delete(key);
}

export type RateLimitCheck =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };

function checkKey(key: string, now: number): RateLimitCheck {
  const bucket = buckets.get(key);
  if (!bucket) return { allowed: true };

  if (bucket.lockedUntil > now) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((bucket.lockedUntil - now) / 1000),
    };
  }

  // Lock expired, or the window rolled over — start clean.
  if (now - bucket.firstFailureAt > WINDOW_MS) {
    buckets.delete(key);
  }

  return { allowed: true };
}

/**
 * Called BEFORE the password is checked. Returns the lockout state for this
 * account and this client address.
 */
export function checkLoginAllowed(
  email: string,
  ip: string,
): RateLimitCheck {
  const now = Date.now();
  sweep(now);

  const account = checkKey(`account:${email}`, now);
  if (!account.allowed) return account;

  return checkKey(`ip:${ip}`, now);
}

function recordFailure(key: string, max: number, now: number): void {
  const bucket = buckets.get(key);

  if (!bucket || now - bucket.firstFailureAt > WINDOW_MS) {
    buckets.set(key, { failures: 1, firstFailureAt: now, lockedUntil: 0 });
    return;
  }

  bucket.failures += 1;
  if (bucket.failures >= max) {
    bucket.lockedUntil = now + LOCKOUT_MS;
  }
}

/** Called after a failed password check. */
export function recordLoginFailure(email: string, ip: string): void {
  const now = Date.now();
  recordFailure(`account:${email}`, MAX_FAILURES_PER_ACCOUNT, now);
  recordFailure(`ip:${ip}`, MAX_FAILURES_PER_IP, now);
}

/**
 * Called after a successful login. Clears the account counter only — the IP
 * counter survives, so one correct password among many wrong ones does not
 * reset an attacker's budget.
 */
export function clearLoginFailures(email: string): void {
  buckets.delete(`account:${email}`);
}

// Test/ops seam.
export function resetLoginThrottle(): void {
  buckets.clear();
}

export const loginThrottleConfig = {
  windowMs: WINDOW_MS,
  lockoutMs: LOCKOUT_MS,
  maxFailuresPerAccount: MAX_FAILURES_PER_ACCOUNT,
  maxFailuresPerIp: MAX_FAILURES_PER_IP,
} as const;
