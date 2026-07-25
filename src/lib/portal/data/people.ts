import "server-only";

import { mockClasses } from "@/data/portal/academics";
import { mockParents } from "@/data/portal/parents";
import { mockStaff } from "@/data/portal/staff";
import { portalApiGet, useRealPortalAuth } from "@/lib/portal/data/api";
import type {
  ClassSummary,
  ParentProfile,
  StaffProfile,
} from "@/types/portal";

export async function listParents(): Promise<readonly ParentProfile[]> {
  if (!useRealPortalAuth) return mockParents;
  const data = await portalApiGet<{ parents?: ParentProfile[] }>(
    "/parents",
    {},
  );
  return data.parents ?? [];
}

export async function listStaff(): Promise<readonly StaffProfile[]> {
  if (!useRealPortalAuth) return mockStaff;
  const data = await portalApiGet<{ staff?: StaffProfile[] }>("/staff", {});
  return data.staff ?? [];
}

export async function listClasses(): Promise<readonly ClassSummary[]> {
  if (!useRealPortalAuth) return mockClasses;
  const data = await portalApiGet<{ classes?: ClassSummary[] }>(
    "/classes",
    {},
  );
  return data.classes ?? [];
}
