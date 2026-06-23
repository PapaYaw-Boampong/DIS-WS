import { cn } from "@/lib/utils";

type ProgressMeterProps = {
  readonly label: string;
  readonly value: number;
  readonly detail?: string;
  readonly tone?: "orange" | "blue" | "green";
};

const toneClasses = {
  orange: "bg-curry-orange",
  blue: "bg-blue-600",
  green: "bg-emerald-600",
} as const;

export function ProgressMeter({
  label,
  value,
  detail,
  tone = "orange",
}: ProgressMeterProps) {
  const safeValue = Math.min(100, Math.max(0, value));

  return (
    <div>
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="font-semibold text-charcoal">{label}</span>
        <span className="font-bold text-charcoal">{safeValue}%</span>
      </div>
      <div
        className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={safeValue}
      >
        <div
          className={cn("h-full rounded-full", toneClasses[tone])}
          style={{ width: `${safeValue}%` }}
        />
      </div>
      {detail ? (
        <p className="mt-2 text-xs leading-5 text-muted-grey">{detail}</p>
      ) : null}
    </div>
  );
}
