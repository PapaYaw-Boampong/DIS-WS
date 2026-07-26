"use client";

import Link from "next/link";
import { useState } from "react";
import { Download, FileCheck } from "lucide-react";

type ReceiptPlaceholderButtonProps = {
  readonly reference: string;
  // When set (a verified payment in real mode), renders a real link to the
  // parent Documents page instead of the placeholder explanation.
  readonly receiptHref?: string;
};

export function ReceiptPlaceholderButton({
  reference,
  receiptHref,
}: ReceiptPlaceholderButtonProps) {
  const [messageVisible, setMessageVisible] = useState(false);

  if (receiptHref) {
    return (
      <Link
        href={receiptHref}
        className="inline-flex min-h-9 items-center gap-2 rounded-full border border-curry-orange px-3 text-xs font-bold text-deep-orange transition-colors hover:bg-soft-cream"
      >
        <FileCheck aria-hidden="true" className="size-3.5" />
        View receipt
      </Link>
    );
  }

  return (
    <div className="min-w-36">
      <button
        type="button"
        onClick={() => setMessageVisible(true)}
        className="inline-flex min-h-9 items-center gap-2 rounded-full border border-curry-orange px-3 text-xs font-bold text-deep-orange transition-colors hover:bg-soft-cream"
        aria-describedby={
          messageVisible ? `receipt-message-${reference}` : undefined
        }
      >
        <Download aria-hidden="true" className="size-3.5" />
        Receipt
      </button>
      {messageVisible ? (
        <p
          id={`receipt-message-${reference}`}
          role="status"
          className="mt-2 text-xs leading-5 text-muted-grey"
        >
          Download becomes available after backend receipt generation.
        </p>
      ) : null}
    </div>
  );
}
