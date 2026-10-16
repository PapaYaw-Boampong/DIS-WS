"use server";

import { revalidatePath } from "next/cache";

import { portalApiGet, portalApiPost, useRealPortalAuth } from "@/lib/portal/data/api";

// Second-factor enrolment for the signed-in user. Every one of these is the
// account holder acting on their own account — there is no path here for one
// user to change another's second factor.

export type MfaStatus = {
  readonly enabled: boolean;
  readonly backupCodesRemaining: number;
  readonly available: boolean;
};

export async function getMfaStatus(): Promise<MfaStatus> {
  if (!useRealPortalAuth) {
    return { enabled: false, backupCodesRemaining: 0, available: false };
  }

  const data = await portalApiGet<{
    enabled?: boolean;
    backupCodesRemaining?: number;
  }>("/auth/mfa", {});

  return {
    enabled: data.enabled === true,
    backupCodesRemaining: data.backupCodesRemaining ?? 0,
    available: true,
  };
}

export type MfaSetupResult =
  | { ok: true; secret: string; otpauthUri: string }
  | { ok: false; message: string };

export async function startMfaSetup(): Promise<MfaSetupResult> {
  if (!useRealPortalAuth) {
    return {
      ok: false,
      message:
        "Two-step sign-in needs the school database, which is not connected yet.",
    };
  }

  const result = await portalApiPost<{ secret?: string; otpauthUri?: string }>(
    "/auth/mfa/setup",
  );

  if (!result.ok || !result.data?.secret || !result.data.otpauthUri) {
    return {
      ok: false,
      message:
        result.status === 409
          ? "Two-step sign-in is already switched on for this account."
          : "Could not start setup. Please try again.",
    };
  }

  return {
    ok: true,
    secret: result.data.secret,
    otpauthUri: result.data.otpauthUri,
  };
}

export type MfaCodesResult =
  | { ok: true; backupCodes: readonly string[] }
  | { ok: false; message: string };

export async function confirmMfaSetup(code: string): Promise<MfaCodesResult> {
  if (!useRealPortalAuth) {
    return { ok: false, message: "Not available without the school database." };
  }

  const result = await portalApiPost<{ backupCodes?: string[] }>(
    "/auth/mfa/enable",
    { code: code.trim() },
  );

  if (!result.ok) {
    return {
      ok: false,
      message:
        result.status === 400
          ? "That code was not accepted. Check your authenticator app and try the current code."
          : "Could not switch on two-step sign-in. Please try again.",
    };
  }

  revalidatePath("/portal", "layout");
  return { ok: true, backupCodes: result.data?.backupCodes ?? [] };
}

export async function regenerateBackupCodes(
  code: string,
): Promise<MfaCodesResult> {
  if (!useRealPortalAuth) {
    return { ok: false, message: "Not available without the school database." };
  }

  const result = await portalApiPost<{ backupCodes?: string[] }>(
    "/auth/mfa/backup-codes",
    { code: code.trim() },
  );

  if (!result.ok) {
    return {
      ok: false,
      message: "That code was not accepted. Enter the current code from your app.",
    };
  }

  revalidatePath("/portal", "layout");
  return { ok: true, backupCodes: result.data?.backupCodes ?? [] };
}

export type MfaActionResult = { readonly ok: boolean; readonly message: string };

export async function disableMfa(
  password: string,
  code: string,
): Promise<MfaActionResult> {
  if (!useRealPortalAuth) {
    return { ok: false, message: "Not available without the school database." };
  }

  const result = await portalApiPost("/auth/mfa/disable", {
    password,
    code: code.trim(),
  });

  if (!result.ok) {
    return {
      ok: false,
      message:
        result.status === 401
          ? "That password was not correct."
          : "That code was not accepted. Enter the current code from your app.",
    };
  }

  revalidatePath("/portal", "layout");
  return {
    ok: true,
    message:
      "Two-step sign-in is off. Your account is now protected by its password alone.",
  };
}
