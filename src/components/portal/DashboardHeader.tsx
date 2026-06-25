import { StatusBadge } from "@/components/portal/StatusBadge";

type DashboardHeaderProps = {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly badge?: string;
};

export function DashboardHeader({
  eyebrow,
  title,
  description,
  badge = "Mock data",
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-bold tracking-[0.14em] text-curry-orange uppercase">
          {eyebrow}
        </p>
        <h1 className="portal-title-bounce mt-2 text-3xl font-extrabold tracking-[-0.04em] text-charcoal sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl leading-7 text-muted-grey">
          {description}
        </p>
      </div>
      <StatusBadge variant="info">{badge}</StatusBadge>
    </div>
  );
}
