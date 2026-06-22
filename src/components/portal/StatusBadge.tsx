import { cn } from "@/lib/utils";

type StatusBadgeVariant =
  | "success"
  | "warning"
  | "neutral"
  | "info"
  | "danger";

type StatusBadgeProps = {
  readonly children: string;
  readonly variant?: StatusBadgeVariant;
};

const variantClasses: Record<StatusBadgeVariant, string> = {
  success: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  warning: "bg-amber-50 text-amber-800 ring-amber-600/20",
  neutral: "bg-slate-100 text-slate-700 ring-slate-600/15",
  info: "bg-blue-50 text-blue-700 ring-blue-600/15",
  danger: "bg-red-50 text-red-700 ring-red-600/15",
};

export function StatusBadge({
  children,
  variant = "neutral",
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset",
        variantClasses[variant],
      )}
    >
      {children}
    </span>
  );
}
