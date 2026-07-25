import "server-only";

import { portalApiGet, useRealPortalAuth } from "@/lib/portal/data/api";
import type { StatementImport } from "@/types/portal";

// Statement reconciliation is a new real-only capability (there is no
// meaningful mock simulation for parsed bank/MoMo statements) — with the flag
// off there is simply nothing to show yet.

export async function listStatementImports(): Promise<
  readonly StatementImport[]
> {
  if (!useRealPortalAuth) return [];
  const data = await portalApiGet<{ imports?: StatementImport[] }>(
    "/statements",
    {},
  );
  return data.imports ?? [];
}

export async function getStatementImport(
  id: string,
): Promise<StatementImport | null> {
  if (!useRealPortalAuth) return null;
  const data = await portalApiGet<{ import?: StatementImport }>(
    `/statements/${encodeURIComponent(id)}`,
    {},
  );
  return data.import ?? null;
}
