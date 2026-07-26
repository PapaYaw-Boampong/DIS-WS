import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { DataTable, type DataTableRow } from "@/components/portal/DataTable";
import { StatementTransactionMatcher } from "@/components/portal/StatementTransactionMatcher";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { listPayments } from "@/lib/portal/data/finance";
import { getStatementImport } from "@/lib/portal/data/statements";
import { listStudents } from "@/lib/portal/data/students";
import { formatPortalCurrency, formatPortalDate } from "@/lib/portal/format";
import { getMockRoleSession } from "@/lib/portal/mock-role";
import { isPortalRole } from "@/lib/portal/roles";
import { portalRoutes } from "@/lib/portal/routes";

export const metadata: Metadata = {
  title: "Statement Import",
};

type StatementDetailPageProps = {
  readonly params: Promise<{ role: string; importId: string }>;
};

function matchLabel(matchType: string | null | undefined) {
  if (matchType === "reference") {
    return <StatusBadge variant="success">Reference match</StatusBadge>;
  }
  if (matchType === "amount_date_name") {
    return <StatusBadge variant="success">Amount + date + name</StatusBadge>;
  }
  if (matchType === "manual") {
    return <StatusBadge variant="info">Manually matched</StatusBadge>;
  }
  return <StatusBadge variant="warning">Unmatched</StatusBadge>;
}

export default async function StatementDetailPage({
  params,
}: StatementDetailPageProps) {
  const { role, importId } = await params;

  if (!isPortalRole(role) || (role !== "accounts" && role !== "admin")) {
    notFound();
  }
  if (!(await getMockRoleSession(role))) {
    notFound();
  }

  const statementImport = await getStatementImport(importId);
  if (!statementImport) {
    notFound();
  }

  const [allPayments, allStudents] = await Promise.all([
    listPayments(),
    listStudents(),
  ]);
  const candidatePayments = allPayments
    .filter(
      (payment) =>
        payment.method === statementImport.method &&
        payment.status === "pending",
    )
    .map((payment) => ({
      id: payment.id,
      reference: payment.reference,
      studentName:
        allStudents.find((student) => student.id === payment.studentId)
          ?.fullName ?? "Student",
      amount: payment.amount,
    }));

  const rows: readonly DataTableRow[] = (
    statementImport.transactions ?? []
  ).map((transaction) => {
    const matchedPayment = transaction.matchedPaymentId
      ? allPayments.find((item) => item.id === transaction.matchedPaymentId)
      : undefined;

    return {
      id: transaction.id,
      cells: [
        formatPortalDate(transaction.date),
        formatPortalCurrency(transaction.amount),
        transaction.reference ?? "—",
        transaction.counterpartyName ?? "—",
        matchLabel(transaction.matchType),
        matchedPayment ? (
          <span key={transaction.id} className="text-xs font-semibold text-charcoal">
            {matchedPayment.reference}
            {transaction.matchConfidence != null
              ? ` (${transaction.matchConfidence}%)`
              : ""}
          </span>
        ) : (
          <StatementTransactionMatcher
            key={transaction.id}
            transactionId={transaction.id}
            candidates={candidatePayments}
          />
        ),
      ],
    };
  });

  return (
    <>
      <Link
        href={portalRoutes.paymentsStatements(role)}
        className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-deep-orange transition-colors hover:text-curry-orange"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Statement reconciliation
      </Link>

      <DashboardHeader
        eyebrow={`${statementImport.method.toUpperCase()} statement`}
        title={statementImport.fileName}
        description={`${statementImport.rowCount} row(s) imported on ${formatPortalDate(statementImport.importedAt.slice(0, 10))} — ${statementImport.matchedCount} matched and verified.`}
        badge="Live reconciliation"
      />

      <DashboardCard
        title="Statement rows"
        description="Unmatched rows can be linked to a pending payment by hand."
        className="mt-8"
      >
        <DataTable
          caption="Statement transactions"
          columns={["Date", "Amount", "Reference", "Depositor", "Match", "Linked payment"]}
          rows={rows}
        />
      </DashboardCard>
    </>
  );
}
