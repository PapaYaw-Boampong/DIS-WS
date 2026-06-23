"use client";

import { useState } from "react";
import { Download } from "lucide-react";

type ReceiptPlaceholderButtonProps = {
  readonly reference: string;
};

export function ReceiptPlaceholderButton({
  reference,
}: ReceiptPlaceholderButtonProps) {
  const [messageVisible, setMessageVisible] = useState(false);

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
