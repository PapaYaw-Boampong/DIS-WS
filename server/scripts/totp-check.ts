import {
  base32Encode,
  generateCode,
  generateSecret,
  verifyCode,
} from "../src/lib/totp";

// Validates the TOTP implementation against the RFC 6238 Appendix B test
// vectors (SHA-1 rows). Run with: npx tsx scripts/totp-check.ts

const secret = base32Encode(Buffer.from("12345678901234567890", "ascii"));

const vectors: readonly [number, string][] = [
  [59, "287082"],
  [1111111109, "081804"],
  [1111111111, "050471"],
  [1234567890, "005924"],
  [2000000000, "279037"],
  [20000000000, "353130"],
];

let failures = 0;

for (const [seconds, expected] of vectors) {
  const got = generateCode(secret, new Date(seconds * 1000));
  const ok = got === expected;
  if (!ok) failures += 1;
  console.log(`${ok ? "PASS" : "FAIL"} T=${seconds} expected ${expected} got ${got}`);
}

const fresh = generateSecret();
const now = new Date();

const cases: readonly [string, boolean][] = [
  ["verifies its own current code", verifyCode(fresh, generateCode(fresh, now), now) !== null],
  ["rejects a non-numeric code", verifyCode(fresh, "abcdef", now) === null],
  ["rejects a short code", verifyCode(fresh, "12345", now) === null],
  [
    "accepts a code 30s old (clock drift)",
    verifyCode(fresh, generateCode(fresh, new Date(now.getTime() - 30_000)), now) !== null,
  ],
  [
    "rejects a code 90s old (outside the window)",
    verifyCode(fresh, generateCode(fresh, new Date(now.getTime() - 90_000)), now) === null,
  ],
  [
    "different secrets produce different codes",
    generateCode(fresh, now) !== generateCode(generateSecret(), now),
  ],
];

for (const [label, ok] of cases) {
  if (!ok) failures += 1;
  console.log(`${ok ? "PASS" : "FAIL"} ${label}`);
}

console.log(failures === 0 ? "\nAll TOTP checks passed." : `\n${failures} check(s) failed.`);
process.exitCode = failures === 0 ? 0 : 1;
