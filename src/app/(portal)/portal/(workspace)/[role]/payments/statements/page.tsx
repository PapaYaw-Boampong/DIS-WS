import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FileSpreadsheet } from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { StatementUploadForm } from "@/components/portal/StatementUploadForm";
import { listStatementImports } from "@/lib/portal/data/statements";
import { formatPortalDate } from "@/lib/portal/format";
import { getMockRoleSession } from "@/lib/portal/mock-role";
import { portalRoutes } from "@/lib/portal/routes";
import { isPortalRole } from "@/lib/portal/roles";

export const metadata: Metadata = {
  title: "Statement Reconciliation",
};

type StatementsPageProps = {
  readonly params: Promise<{ role: string }>;
};

export default async function StatementsPage({
  params,
}: StatementsPageProps) {
  const { role } = await params;

  if (!isPortalRole(role) || (role !== "accounts" && role !== "admin")) {
    notFound();
  }
  if (!(await getMockRoleSession(role))) {
    notFound();
  }

  const imports = await listStatementImports();

  return (
    <>
      <DashboardHeader
        eyebrow="Accounts control"
        title="Statement reconciliation"
        description="Upload a MoMo or bank statement export. Each row is matched against pending payments by exact reference, or by amount, date and depositor name."
        badge="Live reconciliation"
      />

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <DashboardCard
          title="Import a statement"
          description="CSV only for now — export the statement from MoMo or the bank as CSV before uploading."
        >
          <StatementUploadForm />
        </DashboardCard>

        <DashboardCard
          title="Recent imports"
          description="Open an import to review matched and unmatched rows."
        >
          {imports.length === 0 ? (
            <p className="text-sm text-muted-grey">
              No statements have been imported yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {imports.map((item) => (
                <li key={item.id}>
                  <Link
                    href={portalRoutes.paymentStatementDetail(role, item.id)}
                    className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-white p-4 transition-colors hover:border-curry-orange/40"
                  >
                    <div className="flex items-start gap-3">
                      <FileSpreadsheet
                        aria-hidden="true"
                        className="mt-0.5 size-5 shrink-0 text-curry-orange"
                      />
                      <div>
                        <p className="font-bold text-charcoal">
                          {item.fileName}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-muted-grey uppercase">
                          {item.method} · {item.rowCount} row(s) ·{" "}
                          {item.matchedCount} matched
                        </p>
                      </div>
                    </div>
                    <p className="shrink-0 text-xs font-semibold text-muted-grey">
                      {formatPortalDate(item.importedAt.slice(0, 10))}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </DashboardCard>
      </div>
    </>
  );
}
