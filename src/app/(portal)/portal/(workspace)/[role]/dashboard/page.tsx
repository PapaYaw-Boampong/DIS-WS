import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Blocks,
  Database,
  KeyRound,
  Network,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DataTable, type DataTableRow } from "@/components/portal/DataTable";
import { MetricCard } from "@/components/portal/MetricCard";
import { QuickActionCard } from "@/components/portal/QuickActionCard";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { portalNavigation } from "@/lib/portal/navigation";
import {
  isPortalRole,
  portalRoleDescriptions,
  portalRoleLabels,
} from "@/lib/portal/roles";

export const metadata: Metadata = {
  title: "Dashboard",
};

type PortalDashboardPageProps = {
  readonly params: Promise<{
    role: string;
  }>;
};

const readinessRows: readonly DataTableRow[] = [
  {
    id: "authentication",
    cells: [
      "Authentication",
      "Cookie-backed mock session",
      <StatusBadge key="auth-status" variant="success">
        Ready
      </StatusBadge>,
    ],
  },
  {
    id: "navigation",
    cells: [
      "Navigation",
      "Role-specific configuration",
      <StatusBadge key="navigation-status" variant="success">
        Ready
      </StatusBadge>,
    ],
  },
  {
    id: "backend",
    cells: [
      "Backend API",
      "Separate Render service",
      <StatusBadge key="backend-status" variant="warning">
        Planned
      </StatusBadge>,
    ],
  },
  {
    id: "payments",
    cells: [
      "Payments",
      "No provider or secrets connected",
      <StatusBadge key="payments-status" variant="neutral">
        Not connected
      </StatusBadge>,
    ],
  },
];

export default async function PortalDashboardPage({
  params,
}: PortalDashboardPageProps) {
  const { role } = await params;

  if (!isPortalRole(role)) {
    notFound();
  }

  const upcomingItems = portalNavigation[role]
    .filter((item) => !item.href)
    .slice(0, 3);

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold tracking-[0.14em] text-curry-orange uppercase">
            Phase 1 foundation
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] text-charcoal sm:text-4xl">
            Welcome, {portalRoleLabels[role]}
          </h1>
          <p className="mt-3 max-w-2xl leading-7 text-muted-grey">
            {portalRoleDescriptions[role]}. This route currently demonstrates
            the shared protected shell; detailed role widgets begin in Phase 2.
          </p>
        </div>
        <StatusBadge variant="info">Mock data environment</StatusBadge>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          label="Access level"
          value={portalRoleLabels[role]}
          detail="Role guard active"
          icon={<ShieldCheck aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Session mode"
          value="Mock"
          detail="No production identity provider"
          icon={<KeyRound aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Backend status"
          value="Planned"
          detail="Frontend-only foundation"
          icon={<Database aria-hidden="true" className="size-5" />}
        />
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.25fr)_minmax(20rem,0.75fr)]">
        <DashboardCard
          title="Foundation readiness"
          description="The Phase 1 boundary is explicit: reusable frontend structure now, operational integrations later."
        >
          <DataTable
            caption="Portal foundation readiness"
            columns={["Area", "Implementation", "Status"]}
            rows={readinessRows}
          />
        </DashboardCard>

        <DashboardCard
          title="Architecture boundary"
          description="The portal is isolated from the public website while sharing the same Next.js project."
        >
          <ul className="space-y-5">
            <li className="flex gap-3">
              <Blocks
                aria-hidden="true"
                className="mt-0.5 size-5 shrink-0 text-curry-orange"
              />
              <div>
                <p className="font-bold text-charcoal">Separate route group</p>
                <p className="mt-1 text-sm leading-6 text-muted-grey">
                  Public and private layouts do not overlap.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <Network
                aria-hidden="true"
                className="mt-0.5 size-5 shrink-0 text-curry-orange"
              />
              <div>
                <p className="font-bold text-charcoal">API-ready boundary</p>
                <p className="mt-1 text-sm leading-6 text-muted-grey">
                  Mock data can later be replaced by a Render-hosted API.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <ShieldCheck
                aria-hidden="true"
                className="mt-0.5 size-5 shrink-0 text-curry-orange"
              />
              <div>
                <p className="font-bold text-charcoal">No sensitive data</p>
                <p className="mt-1 text-sm leading-6 text-muted-grey">
                  All current users and records are fictional.
                </p>
              </div>
            </li>
          </ul>
        </DashboardCard>
      </div>

      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold tracking-[0.12em] text-curry-orange uppercase">
              Next capabilities
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-charcoal">
              Role navigation is prepared
            </h2>
          </div>
          <Sparkles
            aria-hidden="true"
            className="hidden size-6 text-curry-orange sm:block"
          />
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {upcomingItems.map((item) => (
            <QuickActionCard
              key={item.label}
              title={item.label}
              description="The navigation slot is defined without exposing an unfinished route."
              icon={<Sparkles aria-hidden="true" className="size-5" />}
              phase={item.phase}
            />
          ))}
        </div>
      </section>
    </>
  );
}
