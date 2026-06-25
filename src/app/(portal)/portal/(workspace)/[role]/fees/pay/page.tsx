import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CircleDollarSign,
  CreditCard,
} from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { MetricCard } from "@/components/portal/MetricCard";
import { MockPaymentForm } from "@/components/portal/MockPaymentForm";
import { WardFilterSelect } from "@/components/portal/WardFilterSelect";
import { mockInvoices } from "@/data/portal/fees";
import {
  formatPortalCurrency,
} from "@/lib/portal/format";
import { getMockParentPortalContext } from "@/lib/portal/mock-parent";
import { portalRoutes } from "@/lib/portal/routes";

export const metadata: Metadata = {
  title: "Pay Now",
};

type PayNowPageProps = {
  readonly searchParams?: Promise<{ ward?: string }>;
};

export default async function PayNowPage({ searchParams }: PayNowPageProps) {
  const context = await getMockParentPortalContext();

  if (!context) {
    notFound();
  }

  const query = await searchParams;
  const requestedWard = query?.ward;
  const selectedWard =
    requestedWard && context.parent.childIds.includes(requestedWard)
      ? requestedWard
      : "all";
  const selectedStudentIds =
    selectedWard === "all" ? context.parent.childIds : [selectedWard];
  const selectedStudents = context.students.filter((student) =>
    selectedStudentIds.includes(student.id),
  );
  const invoices = mockInvoices.filter((invoice) =>
    selectedStudentIds.includes(invoice.studentId),
  );
  const outstanding = invoices.reduce(
    (total, invoice) => total + invoice.balance,
    0,
  );
  return (
    <>
      <DashboardHeader
        eyebrow="Parent finances"
        title="Pay now"
        description="Choose a ward, category and amount. The checkout action is ready for the future backend but cannot charge or record payments from the frontend."
        badge="Backend checkout required"
      />

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <MetricCard
          label="Outstanding"
          value={formatPortalCurrency(outstanding)}
          detail="Filtered balance"
          icon={<CircleDollarSign aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Checkout"
          value="Pending"
          detail="Needs Render API"
          icon={<CreditCard aria-hidden="true" className="size-5" />}
        />
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]">
        <div className="space-y-8">
          <DashboardCard
            title="Start secure payment"
            description="This is the primary payment area. It prepares a payment request but does not call a provider, create a transaction, or update balances."
          >
            <MockPaymentForm
              students={selectedStudents.map((student) => ({
                id: student.id,
                name: student.fullName,
              }))}
              categories={[
                { value: "school_fees", label: "School Fees" },
                { value: "feeding", label: "Feeding Advance" },
                { value: "transport", label: "Transport Advance" },
              ]}
              notice="Secure payment is backend-gated. The future Render API must validate access, initialize the provider transaction, verify the callback, and reconcile the ledger before any balance changes."
              submitLabel="Start secure payment"
            />
          </DashboardCard>

          <DashboardCard
            title="What happens after backend integration"
            description="The frontend will hand off to a backend-created checkout intent when the payment provider is selected."
          >
            <ol className="space-y-4 text-sm leading-6 text-muted-grey">
              {[
                "Parent selects ward, category, amount and method.",
                "Render API verifies parent-child access and invoice state.",
                "Backend initializes the payment provider with server-only credentials.",
                "Provider callback is verified and reconciled before balances change.",
                "Receipt becomes available after backend confirmation.",
              ].map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-soft-cream text-xs font-extrabold text-deep-orange">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </DashboardCard>
        </div>

        <div className="space-y-8">
          <DashboardCard
            title="Ward focus"
            description="Limit the payment form to one linked child when needed."
          >
            <WardFilterSelect
              selectedWard={selectedWard}
              students={context.students.map((student) => ({
                id: student.id,
                name: student.fullName,
              }))}
            />
          </DashboardCard>

          <DashboardCard
            title="Related finance tabs"
            description="Payment history and feeding wallet remain under the Fees group."
          >
            <div className="flex flex-col gap-3">
              <Link
                href={portalRoutes.parentPayments}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-border px-5 text-sm font-bold text-charcoal transition-colors hover:bg-soft-white"
              >
                Payment history
              </Link>
              <Link
                href={portalRoutes.parentFeeding}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-border px-5 text-sm font-bold text-charcoal transition-colors hover:bg-soft-white"
              >
                Feeding wallet
              </Link>
              <Link
                href={portalRoutes.parentTransportWallet}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-border px-5 text-sm font-bold text-charcoal transition-colors hover:bg-soft-white"
              >
                Transport wallet
              </Link>
              <Link
                href={portalRoutes.parentFees}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-curry-orange px-5 text-sm font-bold text-deep-orange transition-colors hover:bg-soft-cream"
              >
                Fees overview
              </Link>
            </div>
          </DashboardCard>
        </div>
      </div>
    </>
  );
}
