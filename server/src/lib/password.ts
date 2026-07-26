import { randomInt } from "node:crypto";

import { hash, verify } from "@node-rs/argon2";

export function hashPassword(plain: string): Promise<string> {
  return hash(plain);
}

// A readable temporary password an admin can relay to a user: two blocks of
// unambiguous characters (no 0/O/1/l/I) plus a symbol, e.g. "Dvhk7-Rmp9x".
export function generateTempPassword(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const pick = (length: number) =>
    Array.from({ length }, () => alphabet[randomInt(alphabet.length)]).join("");
  return `${pick(5)}-${pick(5)}`;
}

export async function verifyPassword(
  hashed: string,
  plain: string,
): Promise<boolean> {
  try {
    return await verify(hashed, plain);
  } catch {
    return false;
  }
}
