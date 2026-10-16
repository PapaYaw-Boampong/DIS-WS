import { generateCode } from "../src/lib/totp";

// End-to-end check of the second-factor sign-in flow and the GPS ingestion
// seam, against a running server. Run with: npx tsx scripts/mfa-e2e.ts

const BASE = process.env.API_BASE ?? "http://localhost:4000";
const PASSWORD = "PortalDev123!";

let failures = 0;
function check(label: string, ok: boolean, detail?: unknown): void {
  if (!ok) failures += 1;
  console.log(`${ok ? "PASS" : "FAIL"} ${label}${ok || detail === undefined ? "" : ` — ${JSON.stringify(detail)}`}`);
}

type Res = { status: number; body: Record<string, unknown> };

async function call(
  method: string,
  path: string,
  opts: { token?: string; body?: unknown } = {},
): Promise<Res> {
  const headers: Record<string, string> = {};
  if (opts.token) headers.authorization = `Bearer ${opts.token}`;
  if (opts.body !== undefined) headers["content-type"] = "application/json";

  const response = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
  });

  let body: Record<string, unknown> = {};
  try {
    body = (await response.json()) as Record<string, unknown>;
  } catch {
    /* empty body */
  }
  return { status: response.status, body };
}

const login = (email: string, password = PASSWORD) =>
  call("POST", "/auth/login", { body: { email, password } });

// A TOTP code is only usable once. Enrolling consumes the current window's
// code, so a sign-in in that same window is a genuine replay and is correctly
// refused — the test has to step into the next window rather than assert the
// replay guard away.
async function nextTotpWindow(): Promise<void> {
  const msIntoStep = (Date.now() / 1000) % 30;
  const wait = (30 - msIntoStep + 1) * 1000;
  console.log(`  (waiting ${Math.round(wait / 1000)}s for the next TOTP window)`);
  await new Promise((resolve) => setTimeout(resolve, wait));
}

async function main(): Promise<void> {
  console.log("--- MFA ENROLMENT ---");
  const first = await login("admin@dis.local");
  check("password login works before MFA", first.status === 200 && typeof first.body.token === "string");
  const token = first.body.token as string;

  const status0 = await call("GET", "/auth/mfa", { token });
  check("MFA reports off initially", status0.body.enabled === false);

  const setup = await call("POST", "/auth/mfa/setup", { token });
  const secret = setup.body.secret as string;
  check("setup returns a base32 secret", /^[A-Z2-7]{32}$/.test(secret ?? ""));
  check(
    "setup returns a scannable otpauth URI",
    String(setup.body.otpauthUri ?? "").startsWith("otpauth://totp/"),
  );

  const stillOff = await call("GET", "/auth/mfa", { token });
  check("MFA still OFF after setup (secret alone must not lock the account)", stillOff.body.enabled === false);

  const badEnable = await call("POST", "/auth/mfa/enable", { token, body: { code: "000000" } });
  check("enable rejects a wrong code", badEnable.status === 400);

  const enable = await call("POST", "/auth/mfa/enable", {
    token,
    body: { code: generateCode(secret) },
  });
  const backupCodes = (enable.body.backupCodes as string[]) ?? [];
  check("enable succeeds with a real code", enable.status === 200 && enable.body.enabled === true);
  check("enable issues 10 backup codes", backupCodes.length === 10, backupCodes.length);

  console.log("\n--- TWO-FACTOR LOGIN ---");
  await nextTotpWindow();
  const challenged = await login("admin@dis.local");
  check("login now returns a challenge, not a session", challenged.body.mfaRequired === true);
  check("login returns NO session token", challenged.body.token === undefined);
  const challengeToken = challenged.body.challengeToken as string;

  const wrongCode = await call("POST", "/auth/mfa/verify", {
    body: { challengeToken, code: "000000" },
  });
  check("verify rejects a wrong code", wrongCode.status === 401);

  const verified = await call("POST", "/auth/mfa/verify", {
    body: { challengeToken, code: generateCode(secret) },
  });
  check(
    "verify exchanges the challenge for a session",
    verified.status === 200 && typeof verified.body.token === "string",
    verified,
  );
  const mfaToken = verified.body.token as string;

  // The challenge was consumed by the successful verify above, so this proves
  // the challenge is single-use rather than merely re-detecting a used code.
  const replay = await call("POST", "/auth/mfa/verify", {
    body: { challengeToken, code: generateCode(secret) },
  });
  check(
    "the same challenge cannot be redeemed twice",
    replay.status !== 200 && replay.body.error === "invalid_challenge",
    replay,
  );

  const forged = await call("POST", "/auth/mfa/verify", {
    body: { challengeToken: "0".repeat(64), code: generateCode(secret) },
  });
  check("a forged challenge token is rejected", forged.status !== 200);

  console.log("\n--- CODE REPLAY ---");
  const c2 = await login("admin@dis.local");
  const sameCode = generateCode(secret);
  const replayCode = await call("POST", "/auth/mfa/verify", {
    body: { challengeToken: c2.body.challengeToken, code: sameCode },
  });
  check(
    "a TOTP code already used cannot be replayed in its own window",
    replayCode.status === 401,
    replayCode.status,
  );

  console.log("\n--- BACKUP CODES ---");
  const c3 = await login("admin@dis.local");
  const usedBackup = await call("POST", "/auth/mfa/verify", {
    body: { challengeToken: c3.body.challengeToken, code: backupCodes[0] },
  });
  check("a backup code signs in", usedBackup.status === 200, usedBackup);

  const c4 = await login("admin@dis.local");
  const reusedBackup = await call("POST", "/auth/mfa/verify", {
    body: { challengeToken: c4.body.challengeToken, code: backupCodes[0] },
  });
  check("the same backup code cannot be used twice", reusedBackup.status === 401);

  const remaining = await call("GET", "/auth/mfa", { token: mfaToken });
  check("one backup code is now spent (9 left)", remaining.body.backupCodesRemaining === 9, remaining.body.backupCodesRemaining);

  console.log("\n--- DISABLE GUARDS ---");
  const noPassword = await call("POST", "/auth/mfa/disable", {
    token: mfaToken,
    body: { password: "wrong-password", code: generateCode(secret) },
  });
  check("disable refuses a wrong password", noPassword.status === 401);

  const noCode = await call("POST", "/auth/mfa/disable", {
    token: mfaToken,
    body: { password: PASSWORD, code: "000000" },
  });
  check("disable refuses a wrong code", noCode.status === 400, noCode);

  console.log("\n--- ADMIN LOCKOUT RECOVERY ---");
  const devToken = (await login("developer@dis.local")).body.token as string;
  const users = await call("GET", "/admin/users", { token: devToken });
  const adminUser = (users.body.users as { id: string; email: string }[]).find(
    (u) => u.email === "admin@dis.local",
  );

  const parentToken = (await login("parent@dis.local")).body.token as string;
  const parentAttempt = await call("POST", `/admin/users/${adminUser?.id}/reset-mfa`, {
    token: parentToken,
  });
  check("a parent cannot reset someone's MFA", parentAttempt.status === 403);

  const reset = await call("POST", `/admin/users/${adminUser?.id}/reset-mfa`, {
    token: devToken,
  });
  check("an account manager can reset MFA for a locked-out user", reset.status === 200);

  const afterReset = await login("admin@dis.local");
  check("that user can sign in with the password alone again", afterReset.status === 200 && typeof afterReset.body.token === "string");

  console.log("\n--- GPS TRACKERS ---");
  const adminToken = afterReset.body.token as string;
  const routes = await call("GET", "/transport/routes", { token: adminToken });
  const routeId = (routes.body.routes as { id: string }[])[0]?.id;

  const noDeviceAuth = await call("POST", "/transport/position", {
    body: { latitude: 5.6, longitude: -0.18 },
  });
  check("position rejects an unauthenticated tracker", noDeviceAuth.status === 401);

  const parentDevice = await call("POST", "/transport/devices", {
    token: parentToken,
    body: { routeId, label: "Nope" },
  });
  check("a parent cannot register a tracker", parentDevice.status === 403);

  const device = await call("POST", "/transport/devices", {
    token: adminToken,
    body: { routeId, label: "Bus 1 tracker" },
  });
  const deviceToken = device.body.token as string;
  check("a tracker can be registered and returns its token once", device.status === 201 && typeof deviceToken === "string");

  const listed = await call("GET", "/transport/devices", { token: adminToken });
  const listedDevices = listed.body.devices as Record<string, unknown>[];
  check("listing devices never returns the token", listedDevices.every((d) => !("tokenHash" in d) && !("token" in d)));

  const badCoords = await call("POST", "/transport/position", {
    token: deviceToken,
    body: { latitude: 999, longitude: -0.18 },
  });
  check("impossible coordinates are rejected", badCoords.status === 400);

  const position = await call("POST", "/transport/position", {
    token: deviceToken,
    body: { latitude: 5.6037, longitude: -0.187, speedKph: 32 },
  });
  check("a tracker can report a position", position.status === 200);

  const trips = await call("GET", "/transport/trips", { token: adminToken });
  const trip = (trips.body.trips as Record<string, unknown>[]).find(
    (t) => t.routeId === routeId && t.latitude !== null,
  );
  check("the position is stored on the trip", trip?.latitude === 5.6037 && trip?.longitude === -0.187, trip);

  const revoked = await call("POST", `/transport/devices/${device.body.device && (device.body.device as { id: string }).id}/revoke`, {
    token: adminToken,
  });
  check("a tracker can be revoked", revoked.status === 200);

  const afterRevoke = await call("POST", "/transport/position", {
    token: deviceToken,
    body: { latitude: 5.61, longitude: -0.19 },
  });
  check("a revoked tracker is refused", afterRevoke.status === 401);

  console.log(failures === 0 ? "\nAll checks passed." : `\n${failures} check(s) failed.`);
  process.exitCode = failures === 0 ? 0 : 1;
}

void main();
