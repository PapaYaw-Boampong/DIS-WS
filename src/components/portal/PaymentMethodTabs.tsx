"use client";

import { useState, type ReactNode } from "react";
import { CreditCard, Landmark, Smartphone } from "lucide-react";

import { cn } from "@/lib/utils";

export type PaymentLane = "paystack" | "momo" | "bank";

type PaymentMethodTabsProps = {
  readonly momoPanel: ReactNode;
  readonly bankPanel: ReactNode;
  // Rendered only when the backend reports the Paystack lane is open. The
  // frontend never decides this for itself — a public flag would drift from
  // backend reality and could show parents a checkout button that 500s.
  readonly paystackPanel?: ReactNode;
};

const laneMeta: Record<
  PaymentLane,
  { label: string; icon: typeof Smartphone }
> = {
  paystack: { label: "Pay Online", icon: CreditCard },
  momo: { label: "Mobile Money", icon: Smartphone },
  bank: { label: "Bank Deposit", icon: Landmark },
};

export function PaymentMethodTabs({
  momoPanel,
  bankPanel,
  paystackPanel,
}: PaymentMethodTabsProps) {
  // Paystack goes first when it is available — it is the fastest path for the
  // parent, and it credits the invoice without anyone at the school acting.
  const lanes: readonly PaymentLane[] = paystackPanel
    ? ["paystack", "momo", "bank"]
    : ["momo", "bank"];

  const [active, setActive] = useState<PaymentLane>(lanes[0]);

  const panels: Record<PaymentLane, ReactNode> = {
    paystack: paystackPanel,
    momo: momoPanel,
    bank: bankPanel,
  };

  const tabClass = (isActive: boolean) =>
    cn(
      "inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full px-4 text-sm font-bold transition-colors sm:flex-none",
      isActive
        ? "bg-curry-orange text-white"
        : "border border-border text-charcoal hover:bg-soft-white",
    );

  return (
    <div>
      <div
        role="tablist"
        aria-label="Payment method"
        className="flex flex-wrap gap-2"
      >
        {lanes.map((lane) => {
          const { label, icon: Icon } = laneMeta[lane];

          return (
            <button
              key={lane}
              type="button"
              role="tab"
              aria-selected={active === lane}
              onClick={() => setActive(lane)}
              className={tabClass(active === lane)}
            >
              <Icon aria-hidden="true" className="size-4" />
              {label}
            </button>
          );
        })}
      </div>

      <div className="mt-6">{panels[active]}</div>
    </div>
  );
}
