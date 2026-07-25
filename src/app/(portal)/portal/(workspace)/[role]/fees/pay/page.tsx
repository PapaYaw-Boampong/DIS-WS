import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CircleDollarSign } from "lucide-react";

import { BankDepositForm } from "@/components/portal/BankDepositForm";
import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { MetricCard } from "@/components/portal/MetricCard";
import { MomoPaymentForm } from "@/components/portal/MomoPaymentForm";
import { PaymentMethodTabs } from "@/components/portal/PaymentMethodTabs";
import { WardFilterSelect } from "@/components/portal/WardFilterSelect";
import { getParentInvoices } from "@/lib/portal/data/parent";
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
  const invoices = (await getParentInvoices()).filter((invoice) =>
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
        description="Pay by Mobile Money or bank deposit, then submit the details below. The school verifies each payment against the MoMo or bank statement before it counts toward a balance."
        badge="Verification required"
      />

      <div className="mt-8 max-w-sm">
        <MetricCard
          label="Outstanding"
          value={formatPortalCurrency(outstanding)}
          detail="Filtered balance"
          icon={<CircleDollarSign aria-hidden="true" className="size-5" />}
        />
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]">
        <div className="space-y-8">
          <DashboardCard
            title="Submit a payment"
            description="Choose how you paid, then submit the transaction details for the school to verify. Nothing is marked paid until verified."
          >
            <PaymentMethodTabs
              momoPanel={
                <MomoPaymentForm
                  students={selectedStudents.map((student) => ({
                    id: student.id,
                    name: student.fullName,
                  }))}
                  invoices={invoices.map((invoice) => ({
                    id: invoice.id,
                    studentId: invoice.studentId,
                    balance: invoice.balance,
                  }))}
                  categories={[
                    { value: "school_fees", label: "School Fees" },
                    { value: "feeding", label: "Feeding" },
                    { value: "transport", label: "Transport" },
                    { value: "admission", label: "Admission" },
                    { value: "miscellaneous", label: "Miscellaneous" },
                  ]}
                />
              }
              bankPanel={
                <BankDepositForm
                  students={selectedStudents.map((student) => ({
                    id: student.id,
                    name: student.fullName,
                  }))}
                  invoices={invoices.map((invoice) => ({
                    id: invoice.id,
                    studentId: invoice.studentId,
                    balance: invoice.balance,
                  }))}
                  categories={[
                    { value: "school_fees", label: "School Fees" },
                    { value: "feeding", label: "Feeding" },
                    { value: "transport", label: "Transport" },
                    { value: "admission", label: "Admission" },
                    { value: "miscellaneous", label: "Miscellaneous" },
                  ]}
                />
              }
            />
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
