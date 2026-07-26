"use client";

import { useState, type ReactNode } from "react";
import { Landmark, Smartphone } from "lucide-react";

import { cn } from "@/lib/utils";

type PaymentMethodTabsProps = {
  readonly momoPanel: ReactNode;
  readonly bankPanel: ReactNode;
};

export function PaymentMethodTabs({
  momoPanel,
  bankPanel,
}: PaymentMethodTabsProps) {
  const [active, setActive] = useState<"momo" | "bank">("momo");

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
        <button
          type="button"
          role="tab"
          aria-selected={active === "momo"}
          onClick={() => setActive("momo")}
          className={tabClass(active === "momo")}
        >
          <Smartphone aria-hidden="true" className="size-4" />
          Mobile Money
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={active === "bank"}
          onClick={() => setActive("bank")}
          className={tabClass(active === "bank")}
        >
          <Landmark aria-hidden="true" className="size-4" />
          Bank Deposit
        </button>
      </div>

      <div className="mt-6">{active === "momo" ? momoPanel : bankPanel}</div>
    </div>
  );
}
