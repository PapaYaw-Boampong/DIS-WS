import Link from "next/link";
import {
  CircleCheckBig,
  Clock3,
  FileSpreadsheet,
  Image as ImageIcon,
  ReceiptText,
  TriangleAlert,
} from "lucide-react";

import { CashPaymentForm } from "@/components/portal/CashPaymentForm";
import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { DataTable, type DataTableRow } from "@/components/portal/DataTable";
import { FinancialStatusBadge } from "@/components/portal/FinancialStatusBadge";
import { MetricCard } from "@/components/portal/MetricCard";
import { PaymentRowActions } from "@/components/portal/PaymentRowActions";
import { listInvoices, listPayments } from "@/lib/portal/data/finance";
import { listStudents } from "@/lib/portal/data/students";
import {
  formatFeeCategory,
  formatPaymentMethod,
  formatPortalCurrency,
  formatPortalDate,
} from "@/lib/portal/format";
import { portalRoutes } from "@/lib/portal/routes";
import type { PortalRole } from "@/types/portal";

type AccountsPaymentsViewProps = {
  readonly role: PortalRole;
  readonly statusFilter?: string;
};

const statusTabs: readonly { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "verified", label: "Verified" },
  { value: "rejected", label: "Rejected" },
];

export async function AccountsPaymentsView({
  role,
  statusFilter,
}: AccountsPaymentsViewProps) {
  const [mockPayments, mockStudents, mockInvoices] = await Promise.all([
    listPayments(),
    listStudents(),
    listInvoices(),
  ]);

  const activeStatus =
    statusFilter && statusTabs.some((tab) => tab.value === statusFilter)
      ? statusFilter
      : "all";
  const visiblePayments =
    activeStatus === "all"
      ? mockPayments
      : mockPayments.filter((payment) => payment.status === activeStatus);

  const rows: readonly DataTableRow[] = visiblePayments
    .toSorted((a, b) => b.paidAt.localeCompare(a.paidAt))
    .map((payment) => {
      const student = mockStudents.find(
        (item) => item.id === payment.studentId,
      );

      return {
        id: payment.id,
        cells: [
          payment.reference,
          student?.fullName ?? "Student",
          formatFeeCategory(payment.category),
          formatPaymentMethod(payment.method),
          formatPortalDate(payment.paidAt.slice(0, 10)),
          formatPortalCurrency(payment.amount),
          <FinancialStatusBadge key={payment.id} status={payment.status} />,
          payment.status === "pending" ? (
            <PaymentRowActions key={payment.id} paymentId={payment.id} />
          ) : payment.status === "rejected" ? (
            <span key={payment.id} className="text-xs text-muted-grey">
              {payment.rejectionReason ?? "Not verified"}
            </span>
          ) : (
            <span key={payment.id} className="text-xs text-muted-grey">
              —
            </span>
          ),
          payment.hasAttachment ? (
            <Link
              key={payment.id}
              href={portalRoutes.paymentAttachment(role, payment.id)}
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-deep-orange hover:underline"
            >
              <ImageIcon aria-hidden="true" className="size-3.5" />
              View
            </Link>
          ) : (
            <span key={payment.id} className="text-xs text-muted-grey">
              —
            </span>
          ),
        ],
      };
    });

  const verified = mockPayments.filter(
    (payment) => payment.status === "verified",
  );

  return (
    <>
      <DashboardHeader
        eyebrow="Accounts control"
        title="Payment management"
        description="Verify Mobile Money and bank deposits against statements, record cash payments, and review rejected submissions."
        badge="Verification workflow"
        action={
          <Link
            href={portalRoutes.paymentsStatements(role)}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-curry-orange px-5 text-sm font-bold text-white transition-colors hover:bg-deep-orange"
          >
            <FileSpreadsheet aria-hidden="true" className="size-4" />
            Statement reconciliation
          </Link>
        }
      />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Transactions" value={String(mockPayments.length)} detail="All records" icon={<ReceiptText aria-hidden="true" className="size-5" />} />
        <MetricCard label="Verified" value={String(verified.length)} detail={formatPortalCurrency(verified.reduce((total, item) => total + item.amount, 0))} icon={<CircleCheckBig aria-hidden="true" className="size-5" />} />
        <MetricCard label="Pending" value={String(mockPayments.filter((item) => item.status === "pending").length)} detail="Awaiting verification" icon={<Clock3 aria-hidden="true" className="size-5" />} />
        <MetricCard label="Rejected" value={String(mockPayments.filter((item) => item.status === "rejected").length)} detail="Needs follow-up" icon={<TriangleAlert aria-hidden="true" className="size-5" />} />
      </div>
      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(22rem,0.65fr)]">
        <DashboardCard title="Payment transactions" description="MoMo and bank rows are matched via statement reconciliation; cash is verified instantly.">
          <div className="mb-5 flex flex-wrap gap-2">
            {statusTabs.map((tab) => (
              <Link
                key={tab.value}
                href={
                  tab.value === "all"
                    ? portalRoutes.accountsPayments
                    : `${role === "admin" ? portalRoutes.adminPayments : portalRoutes.accountsPayments}?status=${tab.value}`
                }
                className={
                  activeStatus === tab.value
                    ? "inline-flex min-h-9 items-center rounded-full bg-curry-orange px-4 text-xs font-bold text-white"
                    : "inline-flex min-h-9 items-center rounded-full border border-border px-4 text-xs font-bold text-charcoal transition-colors hover:bg-soft-white"
                }
              >
                {tab.label}
              </Link>
            ))}
          </div>
          <DataTable
            caption="Accounts payment records"
            columns={["Reference", "Student", "Category", "Method", "Date", "Amount", "Status", "Actions", "Attachment"]}
            rows={rows}
          />
        </DashboardCard>
        <DashboardCard title="Record cash payment" description="Cash is verified immediately." className="h-fit">
          <CashPaymentForm
            students={mockStudents.map((student) => ({ id: student.id, name: student.fullName }))}
            invoices={mockInvoices.map((invoice) => ({ id: invoice.id, studentId: invoice.studentId, balance: invoice.balance }))}
          />
        </DashboardCard>
      </div>
    </>
  );
}
