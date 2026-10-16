import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { PaystackConfirmPoller } from "@/components/portal/PaystackConfirmPoller";
import { getPaystackPaymentState } from "@/app/(portal)/portal/actions/paystack-status";
import { getMockParentPortalContext } from "@/lib/portal/mock-parent";

export const metadata: Metadata = {
  title: "Payment Confirmation",
};

type ConfirmPageProps = {
  readonly params: Promise<{ role: string }>;
  readonly searchParams?: Promise<{ reference?: string }>;
};

/**
 * Where Paystack returns the parent after checkout.
 *
 * The redirect itself proves nothing — this page asks our own backend for the
 * payment's real state, which re-verifies against Paystack before reporting
 * anything as paid.
 */
export default async function PaystackConfirmPage({
  params,
  searchParams,
}: ConfirmPageProps) {
  const context = await getMockParentPortalContext();

  if (!context) {
    notFound();
  }

  const { role } = await params;
  const reference = (await searchParams)?.reference?.trim();

  if (!reference) {
    notFound();
  }

  const initialState = await getPaystackPaymentState(reference);

  return (
    <>
      <DashboardHeader
        eyebrow="Parent finances"
        title="Payment confirmation"
        description="Checking this payment with Paystack. Nothing is marked paid until the provider confirms it."
        badge="Online payment"
      />

      <div className="mt-8 max-w-2xl">
        <DashboardCard
          title="Payment status"
          description="This page checks with the school's payment provider — it does not assume the payment worked just because you were sent back here."
        >
          <PaystackConfirmPoller
            reference={reference}
            role={role}
            initialState={initialState}
          />
        </DashboardCard>
      </div>
    </>
  );
}
