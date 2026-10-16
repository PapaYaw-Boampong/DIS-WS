import Link from "next/link";
import { ArrowRight, Wallet } from "lucide-react";

type WalletTopUpLinkProps = {
  readonly role: string;
  readonly category: "feeding" | "transport";
  readonly studentId?: string;
  readonly label: string;
  readonly description: string;
};

/**
 * A wallet top-up is a payment, so it goes through Pay Now like every other
 * one — same Mobile Money / bank / Paystack lanes, same verification, same
 * receipt. Once a top-up payment is verified the wallet balance and its ledger
 * move automatically, which is why there is no separate top-up form here.
 */
export function WalletTopUpLink({
  role,
  category,
  studentId,
  label,
  description,
}: WalletTopUpLinkProps) {
  const params = new URLSearchParams({ category });
  if (studentId) params.set("student", studentId);

  return (
    <div>
      <p className="rounded-2xl border border-border bg-soft-white p-4 text-sm leading-6 text-muted-grey">
        {description}
      </p>

      <Link
        href={`/portal/${role}/fees/pay?${params.toString()}`}
        className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-curry-orange px-6 font-bold text-white transition-colors hover:bg-deep-orange"
      >
        <Wallet aria-hidden="true" className="size-5" />
        {label}
        <ArrowRight aria-hidden="true" className="size-4" />
      </Link>
    </div>
  );
}
