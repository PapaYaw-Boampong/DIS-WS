"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import {
  defaultCapabilityMatrix,
  isPortalCapability,
  serializeCapabilityMatrix,
  type PortalCapability,
} from "@/lib/portal/capabilities";
import { portalApiPost, useRealPortalAuth } from "@/lib/portal/data/api";
import { getMockPortalSession } from "@/lib/portal/mock-session";
import { CAPABILITY_COOKIE } from "@/lib/portal/permissions";
import { portalRoles } from "@/types/portal";

export type PermissionActionResult = {
  readonly ok: boolean;
  readonly message: string;
};

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

// Only the developer portal may change what a role can do. The backend
// enforces this too — this check is the fast path, not the guarantee.
async function requireDeveloper() {
  const session = await getMockPortalSession();
  return session?.user.role === "developer" ? session : null;
}

export async function saveCapabilityMatrix(
  input: Record<string, readonly string[]>,
): Promise<PermissionActionResult> {
  if (!(await requireDeveloper())) {
    return { ok: false, message: "Only the developer portal can change role permissions." };
  }

  const matrix = { ...defaultCapabilityMatrix };

  for (const role of portalRoles) {
    matrix[role] = (input[role] ?? []).filter(
      (value): value is PortalCapability => isPortalCapability(value),
    );
  }

  if (useRealPortalAuth) {
    const result = await portalApiPost("/permissions", { matrix });

    if (!result.ok) {
      return {
        ok: false,
        message:
          result.status === 403
            ? "Your account is not allowed to change role permissions."
            : "Role permissions could not be saved. Please try again.",
      };
    }

    revalidatePath("/portal", "layout");

    return {
      ok: true,
      message:
        "Role permissions saved for the whole school. Navigation, page access and the backend all update immediately.",
    };
  }

  // No backend: keep the edited matrix in a cookie so it at least survives
  // navigation for this browser. It is not school-wide and it is not enforced.
  const cookieStore = await cookies();
  cookieStore.set(CAPABILITY_COOKIE, serializeCapabilityMatrix(matrix), {
    httpOnly: true,
    maxAge: COOKIE_MAX_AGE,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  revalidatePath("/portal", "layout");

  return {
    ok: true,
    message:
      "Role permissions saved for this browser. Saving them for the whole school needs the school database.",
  };
}

export async function resetCapabilityMatrix(): Promise<PermissionActionResult> {
  if (!(await requireDeveloper())) {
    return { ok: false, message: "Only the developer portal can change role permissions." };
  }

  if (useRealPortalAuth) {
    const result = await portalApiPost("/permissions/reset");

    if (!result.ok) {
      return { ok: false, message: "Role permissions could not be reset. Please try again." };
    }

    revalidatePath("/portal", "layout");

    return { ok: true, message: "Role permissions restored to the shipped defaults." };
  }

  const cookieStore = await cookies();
  cookieStore.set(CAPABILITY_COOKIE, serializeCapabilityMatrix(defaultCapabilityMatrix), {
    httpOnly: true,
    maxAge: COOKIE_MAX_AGE,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  revalidatePath("/portal", "layout");

  return { ok: true, message: "Role permissions restored to the shipped defaults." };
}
