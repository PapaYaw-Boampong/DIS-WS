import { StatusBadge } from "@/components/portal/StatusBadge";
import type {
  FeedingBalance,
  InvoiceStatus,
  PaymentStatus,
} from "@/types/portal";

type FinancialStatus =
  | InvoiceStatus
  | PaymentStatus
  | FeedingBalance["status"];

type FinancialStatusBadgeProps = {
  readonly status: FinancialStatus;
};

const statusConfig: Record<
  FinancialStatus,
  {
    label: string;
    variant: "success" | "warning" | "neutral" | "info" | "danger";
  }
> = {
  unpaid: { label: "Unpaid", variant: "danger" },
  partially_paid: { label: "Partially paid", variant: "warning" },
  paid: { label: "Paid", variant: "success" },
  overpaid: { label: "Overpaid", variant: "info" },
  pending: { label: "Pending", variant: "warning" },
  // An online checkout that was opened but never paid. Deliberately neutral,
  // not "pending" — there is nothing for the office to verify.
  initiated: { label: "Awaiting payment", variant: "neutral" },
  verified: { label: "Verified", variant: "success" },
  rejected: { label: "Rejected", variant: "danger" },
  failed: { label: "Not completed", variant: "danger" },
  abandoned: { label: "Abandoned", variant: "neutral" },
  active: { label: "Active", variant: "success" },
  low_balance: { label: "Low balance", variant: "warning" },
  empty: { label: "Empty", variant: "danger" },
};

export function FinancialStatusBadge({
  status,
}: FinancialStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <StatusBadge variant={config.variant}>{config.label}</StatusBadge>
  );
}
