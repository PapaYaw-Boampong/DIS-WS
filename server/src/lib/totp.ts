import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

// TOTP (RFC 6238) over HMAC-SHA1, 6 digits, 30-second steps — the parameters
// every authenticator app (Google Authenticator, Authy, 1Password, Microsoft
// Authenticator) assumes by default. Implemented here rather than pulled in as
// a dependency: it is ~60 lines of well-specified arithmetic, and a second-
// factor implementation is not somewhere to inherit an unaudited transitive
// dependency tree.

const DIGITS = 6;
const STEP_SECONDS = 30;
// Accept the neighbouring steps so a phone clock that is up to 30s out still
// works. Wider than ±1 starts meaningfully extending an intercepted code's
// life; narrower generates support calls.
const WINDOW = 1;

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function generateSecret(bytes = 20): string {
  return base32Encode(randomBytes(bytes));
}

export function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = "";

  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
}

export function base32Decode(input: string): Buffer {
  const clean = input.toUpperCase().replace(/=+$/, "").replace(/\s/g, "");
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (const char of clean) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index === -1) throw new Error("invalid base32");
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

function codeForCounter(secret: string, counter: number): string {
  const key = base32Decode(secret);

  // 8-byte big-endian counter.
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64BE(BigInt(counter));

  const digest = createHmac("sha1", key).update(buffer).digest();

  // Dynamic truncation (RFC 4226 §5.3): the low nibble of the last byte picks
  // where in the 20-byte digest to read the 4-byte value from. SHA-1 always
  // gives 20 bytes and the offset is at most 15, so these reads are always in
  // range — `readUInt32BE` states that to the compiler without a cast.
  const offset = digest.readUInt8(digest.length - 1) & 0x0f;
  const binary = digest.readUInt32BE(offset) & 0x7fffffff;

  return String(binary % 10 ** DIGITS).padStart(DIGITS, "0");
}

export function generateCode(secret: string, at: Date = new Date()): string {
  return codeForCounter(secret, Math.floor(at.getTime() / 1000 / STEP_SECONDS));
}

/**
 * Verify a submitted code. Returns the matched counter (so the caller can
 * reject replays of an already-used step) or null.
 *
 * Comparison is timing-safe: a leaky compare on a 6-digit code is a real
 * oracle when an attacker can submit freely.
 */
export function verifyCode(
  secret: string,
  submitted: string,
  at: Date = new Date(),
): number | null {
  const clean = submitted.replace(/\s/g, "");
  if (!/^\d{6}$/.test(clean)) return null;

  const current = Math.floor(at.getTime() / 1000 / STEP_SECONDS);

  for (let drift = -WINDOW; drift <= WINDOW; drift += 1) {
    const counter = current + drift;
    const expected = Buffer.from(codeForCounter(secret, counter), "utf8");
    const provided = Buffer.from(clean, "utf8");
    if (
      expected.length === provided.length &&
      timingSafeEqual(expected, provided)
    ) {
      return counter;
    }
  }

  return null;
}

/**
 * The provisioning URI an authenticator app scans. The issuer appears twice by
 * design — the label prefix is what older apps display, the parameter is what
 * newer ones read.
 */
export function otpauthUri(input: {
  secret: string;
  accountName: string;
  issuer: string;
}): string {
  const label = encodeURIComponent(`${input.issuer}:${input.accountName}`);
  const params = new URLSearchParams({
    secret: input.secret,
    issuer: input.issuer,
    algorithm: "SHA1",
    digits: String(DIGITS),
    period: String(STEP_SECONDS),
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}

// Backup codes for a lost phone. Returned once at enrolment, stored hashed.
export function generateBackupCodes(count = 10): string[] {
  return Array.from({ length: count }, () => {
    const raw = randomBytes(5).toString("hex").toUpperCase();
    return `${raw.slice(0, 5)}-${raw.slice(5)}`;
  });
}

export const totpConfig = { digits: DIGITS, stepSeconds: STEP_SECONDS, window: WINDOW } as const;
