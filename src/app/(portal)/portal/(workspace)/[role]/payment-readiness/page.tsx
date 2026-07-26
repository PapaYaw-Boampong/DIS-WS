import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  BadgeDollarSign,
  Banknote,
  ClipboardCheck,
  ReceiptText,
  RefreshCcw,
  ShieldCheck,
  Webhook,
} from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { DataTable, type DataTableRow } from "@/components/portal/DataTable";
import { MetricCard } from "@/components/portal/MetricCard";
import { StatusBadge } from "@/components/portal/StatusBadge";
import {
  portalPaymentFlowSteps,
  portalPaymentLedgerRules,
  portalPaymentProviders,
  portalPaymentReadinessChecks,
  portalPaymentReceiptRules,
  portalPaymentReconciliationControls,
  portalPaymentWebhookRules,
} from "@/data/portal/payment-contract";
import { isPortalRole } from "@/lib/portal/roles";

export const metadata: Metadata = {
  title: "Payment Readiness",
};

type PaymentReadinessPageProps = {
  readonly params: Promise<{
    role: string;
  }>;
};

function paymentStatusBadge(status: string) {
  if (status === "ready") {
    return <StatusBadge variant="success">Ready</StatusBadge>;
  }

  if (status === "designed") {
    return <StatusBadge variant="info">Designed</StatusBadge>;
  }

  if (status === "needs_decision") {
    return <StatusBadge variant="warning">Needs decision</StatusBadge>;
  }

  return <StatusBadge>Planned</StatusBadge>;
}

export default async function PaymentReadinessPage({
  params,
}: PaymentReadinessPageProps) {
  const { role } = await params;

  if (!isPortalRole(role) || (role !== "admin" && role !== "accounts")) {
    notFound();
  }

  const candidateProviders = portalPaymentProviders.filter(
    (provider) => provider.decisionStatus === "needs_decision",
  );
  const auditedFlowSteps = portalPaymentFlowSteps.filter(
    (step) => step.auditRequired,
  );
  const plannedWebhookRules = portalPaymentWebhookRules.filter(
    (rule) => rule.status === "planned",
  );
  const readyChecks = portalPaymentReadinessChecks.filter(
    (check) => check.status === "ready",
  );

  const providerRows: readonly DataTableRow[] = portalPaymentProviders.map(
    (provider) => ({
      id: provider.id,
      cells: [
        provider.name,
        provider.supportedMethods.join(", "),
        provider.roleInFlow,
        provider.secretTypes.length ? provider.secretTypes.join(", ") : "None",
        paymentStatusBadge(provider.decisionStatus),
      ],
    }),
  );

  const flowRows: readonly DataTableRow[] = portalPaymentFlowSteps.map(
    (step) => ({
      id: String(step.step),
      cells: [
        String(step.step),
        step.name,
        step.actor,
        step.purpose,
        step.auditRequired ? "Yes" : "No",
        paymentStatusBadge(step.status),
      ],
    }),
  );

  const ledgerRows: readonly DataTableRow[] = portalPaymentLedgerRules.map(
    (rule) => ({
      id: rule.rule,
      cells: [
        rule.rule,
        rule.affectedTables.join(", "),
        rule.reason,
        paymentStatusBadge(rule.status),
      ],
    }),
  );

  const reconciliationRows: readonly DataTableRow[] =
    portalPaymentReconciliationControls.map((control) => ({
      id: control.control,
      cells: [
        control.control,
        control.owner,
        control.rule,
        control.failureMode,
        paymentStatusBadge(control.status),
      ],
    }));

  const webhookRows: readonly DataTableRow[] = portalPaymentWebhookRules.map(
    (rule) => ({
      id: rule.event,
      cells: [
        rule.event,
        rule.backendAction,
        rule.idempotencyKey,
        rule.auditRequired ? "Yes" : "No",
        paymentStatusBadge(rule.status),
      ],
    }),
  );

  const receiptRows: readonly DataTableRow[] = portalPaymentReceiptRules.map(
    (rule) => ({
      id: rule.receiptType,
      cells: [
        rule.receiptType,
        rule.generatedBy,
        rule.availableTo.join(", "),
        rule.rule,
        paymentStatusBadge(rule.status),
      ],
    }),
  );

  const readinessRows: readonly DataTableRow[] =
    portalPaymentReadinessChecks.map((check) => ({
      id: check.area,
      cells: [check.area, paymentStatusBadge(check.status), check.detail],
    }));

  return (
    <>
      <DashboardHeader
        eyebrow="Phase 11"
        title="Payment readiness"
        description="Review provider candidates, payment flow, webhook verification, ledger rules, receipts, and reconciliation controls before any live payment integration."
        badge="Provider not connected"
      />

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Provider candidates"
          value={String(candidateProviders.length)}
          detail="Need school decision"
          icon={<Banknote aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Audited steps"
          value={String(auditedFlowSteps.length)}
          detail="Backend audit required"
          icon={<ShieldCheck aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Webhook events"
          value={String(plannedWebhookRules.length)}
          detail="Provider callbacks planned"
          icon={<Webhook aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Ready checks"
          value={String(readyChecks.length)}
          detail="Frontend mock UI only"
          icon={<ClipboardCheck aria-hidden="true" className="size-5" />}
        />
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(22rem,0.65fr)]">
        <div className="space-y-8">
          <DashboardCard
            title="Provider candidates"
            description="Candidates only. No provider package, script, key, or checkout integration is connected."
          >
            <DataTable
              caption="Portal payment provider candidates"
              columns={["Provider", "Methods", "Role", "Secret types", "Status"]}
              rows={providerRows}
            />
          </DashboardCard>

          <DashboardCard
            title="Production payment flow"
            description="The backend must verify ownership, provider state, and ledger updates before receipts are issued."
          >
            <DataTable
              caption="Portal production payment flow"
              columns={["Step", "Name", "Actor", "Purpose", "Audit", "Status"]}
              rows={flowRows}
            />
          </DashboardCard>

          <DashboardCard
            title="Ledger rules"
            description="Financial records should be append-only and transaction-safe."
          >
            <DataTable
              caption="Portal payment ledger rules"
              columns={["Rule", "Tables", "Reason", "Status"]}
              rows={ledgerRows}
            />
          </DashboardCard>

          <DashboardCard
            title="Webhook rules"
            description="Provider callbacks must be verified and idempotent before balances change."
          >
            <DataTable
              caption="Portal payment webhook rules"
              columns={[
                "Event",
                "Backend action",
                "Idempotency",
                "Audit",
                "Status",
              ]}
              rows={webhookRows}
            />
          </DashboardCard>
        </div>

        <div className="space-y-8">
          <DashboardCard
            title="Reconciliation controls"
            description="Accounts needs controls for settlement, manual entry, duplicates, provider outages, and reversals."
          >
            <DataTable
              caption="Portal payment reconciliation controls"
              columns={["Control", "Owner", "Rule", "Failure mode", "Status"]}
              rows={reconciliationRows}
            />
          </DashboardCard>

          <DashboardCard
            title="Receipt rules"
            description="Receipts become available after backend verification or approved accounts entry."
          >
            <DataTable
              caption="Portal payment receipt rules"
              columns={["Receipt", "Generated by", "Available to", "Rule", "Status"]}
              rows={receiptRows}
            />
          </DashboardCard>

          <DashboardCard
            title="Readiness checks"
            description="What is ready now versus what needs provider, backend, or policy decisions."
          >
            <DataTable
              caption="Portal payment readiness checks"
              columns={["Area", "Status", "Detail"]}
              rows={readinessRows}
            />
          </DashboardCard>

          <DashboardCard
            title="Implementation boundary"
            description="This phase is a payment policy map only."
          >
            <ul className="space-y-3 text-sm leading-6 text-muted-grey">
              <li className="flex gap-3">
                <BadgeDollarSign
                  aria-hidden="true"
                  className="mt-0.5 size-5 shrink-0 text-curry-orange"
                />
                No provider SDK, checkout script, key, webhook secret, or live
                transaction was added.
              </li>
              <li className="flex gap-3">
                <ReceiptText
                  aria-hidden="true"
                  className="mt-0.5 size-5 shrink-0 text-curry-orange"
                />
                Receipts should wait for backend verification or approved manual
                payment entry.
              </li>
              <li className="flex gap-3">
                <RefreshCcw
                  aria-hidden="true"
                  className="mt-0.5 size-5 shrink-0 text-curry-orange"
                />
                Refunds and reversals should be linked ledger adjustments, not
                edits to original payment records.
              </li>
            </ul>
          </DashboardCard>
        </div>
      </div>
    </>
  );
}
