import { Bus, CalendarDays, Database, ShieldCheck } from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { MetricCard } from "@/components/portal/MetricCard";
import { QuickActionCard } from "@/components/portal/QuickActionCard";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { portalNavigation } from "@/lib/portal/navigation";
import { portalRoleDescriptions, portalRoleLabels } from "@/lib/portal/roles";
import type { PortalRole } from "@/types/portal";

type FoundationDashboardProps = {
  readonly role: PortalRole;
};

export function FoundationDashboard({ role }: FoundationDashboardProps) {
  const upcomingItems = portalNavigation[role]
    .filter((item) => !item.href)
    .slice(0, 3);

  return (
    <>
      <DashboardHeader
        eyebrow="Future portal area"
        title={`${portalRoleLabels[role]} dashboard foundation`}
        description={`${portalRoleDescriptions[role]}. Detailed role functionality is scheduled for a later implementation phase.`}
        badge="Foundation only"
      />

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          label="Access"
          value="Protected"
          detail="Mock role guard active"
          icon={<ShieldCheck aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Data source"
          value="Mock"
          detail="No operational backend"
          icon={<Database aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Delivery phase"
          value={role === "transport" ? "Phase 4" : "Planned"}
          detail="Detailed interface not started"
          icon={<CalendarDays aria-hidden="true" className="size-5" />}
        />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.75fr]">
        <DashboardCard
          title="Planned capabilities"
          description="Navigation slots are visible but do not expose unfinished routes."
        >
          <div className="grid gap-4 md:grid-cols-2">
            {upcomingItems.map((item) => (
              <QuickActionCard
                key={item.label}
                title={item.label}
                description="This capability will be implemented in its assigned portal phase."
                icon={<Bus aria-hidden="true" className="size-5" />}
                phase={item.phase}
              />
            ))}
          </div>
        </DashboardCard>

        <DashboardCard title="Current boundary">
          <div className="space-y-4 text-sm leading-6 text-muted-grey">
            <p>
              <StatusBadge variant="success">Ready</StatusBadge>
            </p>
            <p>
              Login, session handling, role protection and the shared portal
              layout are active.
            </p>
            <p>
              Operational records, updates and controls remain disconnected
              until the appropriate implementation phase.
            </p>
          </div>
        </DashboardCard>
      </div>
    </>
  );
}
