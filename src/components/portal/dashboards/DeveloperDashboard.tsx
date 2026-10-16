import Link from "next/link";
import {
  Database,
  KeyRound,
  ServerCog,
  ShieldCheck,
  Users,
} from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { MetricCard } from "@/components/portal/MetricCard";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { portalReadinessChecks } from "@/data/portal/api-contract";
import { portalAuthReadinessChecks } from "@/data/portal/auth-contract";
import { portalPaymentReadinessChecks } from "@/data/portal/payment-contract";
import { portalStorageReadinessChecks } from "@/data/portal/storage-contract";
import { portalSchemaTables } from "@/data/portal/schema-contract";
import { useRealPortalAuth } from "@/lib/portal/data/api";
import { listUserAccounts } from "@/lib/portal/data/accounts";
import { getMockPortalSession } from "@/lib/portal/mock-session";
import { portalRoutes } from "@/lib/portal/routes";

type ReadinessArea = {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly checks: readonly { readonly status: string }[];
};

function readinessBadge(ready: number, total: number) {
  if (total > 0 && ready === total) {
    return <StatusBadge variant="success">All checks ready</StatusBadge>;
  }

  if (ready === 0) {
    return <StatusBadge variant="warning">Not started</StatusBadge>;
  }

  return <StatusBadge variant="info">{`${ready}/${total} ready`}</StatusBadge>;
}

export async function DeveloperDashboard() {
  const session = await getMockPortalSession();
  const userName = session?.user.name ?? "Developer";
  const accounts = await listUserAccounts();

  const areas: readonly ReadinessArea[] = [
    {
      id: "backend",
      label: "Backend",
      href: portalRoutes.developerBackendReadiness,
      checks: portalReadinessChecks,
    },
    {
      id: "auth",
      label: "Authentication",
      href: portalRoutes.developerAuthReadiness,
      checks: portalAuthReadinessChecks,
    },
    {
      id: "payments",
      label: "Payments",
      href: portalRoutes.developerPaymentReadiness,
      checks: portalPaymentReadinessChecks,
    },
    {
      id: "storage",
      label: "Storage",
      href: portalRoutes.developerStorageReadiness,
      checks: portalStorageReadinessChecks,
    },
  ];

  const allChecks = areas.flatMap((area) => area.checks);
  const readyChecks = allChecks.filter(
    (check) => check.status === "ready",
  ).length;
  const designedTables = portalSchemaTables.filter(
    (table) => table.status === "designed",
  ).length;
  const pendingResets = accounts.filter(
    (account) => account.mustChangePassword,
  ).length;

  return (
    <>
      <DashboardHeader
        eyebrow="Platform administration"
        title={`Welcome back, ${userName.split(" ")[0]}`}
        description="Portal accounts, integration readiness and the data contracts behind the school portal."
        badge="Developer tools"
      />

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Portal accounts"
          value={String(accounts.length)}
          detail={
            accounts.length
              ? `${pendingResets} awaiting password reset`
              : "Connect the backend to list accounts"
          }
          icon={<Users aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Readiness checks"
          value={`${readyChecks}/${allChecks.length}`}
          detail="Marked ready across all areas"
          icon={<ShieldCheck aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Schema tables"
          value={String(portalSchemaTables.length)}
          detail={`${designedTables} designed`}
          icon={<Database aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Auth mode"
          value={useRealPortalAuth ? "Backend" : "Mock"}
          detail={
            useRealPortalAuth
              ? "Sessions verified by the portal API"
              : "USE_REAL_PORTAL_AUTH is off"
          }
          icon={<KeyRound aria-hidden="true" className="size-5" />}
        />
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]">
        <DashboardCard
          title="Integration readiness"
          description="Each area tracks what is already in place and what still needs a decision before go-live."
        >
          <ul className="space-y-3">
            {areas.map((area) => {
              const ready = area.checks.filter(
                (check) => check.status === "ready",
              ).length;

              return (
                <li key={area.id}>
                  <Link
                    href={area.href}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-soft-white p-4 transition-colors hover:border-curry-orange/40"
                  >
                    <span className="flex items-center gap-3">
                      <ServerCog
                        aria-hidden="true"
                        className="size-5 text-curry-orange"
                      />
                      <span>
                        <span className="block font-bold text-charcoal">
                          {area.label}
                        </span>
                        <span className="mt-0.5 block text-sm text-muted-grey">
                          {area.checks.length} check
                          {area.checks.length === 1 ? "" : "s"}
                        </span>
                      </span>
                    </span>
                    {readinessBadge(ready, area.checks.length)}
                  </Link>
                </li>
              );
            })}
            <li>
              <Link
                href={portalRoutes.developerDatabaseReadiness}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-soft-white p-4 transition-colors hover:border-curry-orange/40"
              >
                <span className="flex items-center gap-3">
                  <Database
                    aria-hidden="true"
                    className="size-5 text-curry-orange"
                  />
                  <span>
                    <span className="block font-bold text-charcoal">
                      Database schema
                    </span>
                    <span className="mt-0.5 block text-sm text-muted-grey">
                      {portalSchemaTables.length} tables contracted
                    </span>
                  </span>
                </span>
                <StatusBadge variant="info">Open schema</StatusBadge>
              </Link>
            </li>
          </ul>
        </DashboardCard>

        <div className="space-y-8">
          <DashboardCard
            title="Account administration"
            description="Issue, suspend and reset the accounts that sign in to the portal."
          >
            <p className="text-sm leading-6 text-muted-grey">
              There is no public sign-up. Every account is created here and the
              user is forced to set their own password on first sign-in.
            </p>
            <Link
              href={portalRoutes.developerAccounts}
              className="mt-5 inline-flex min-h-10 items-center rounded-full bg-curry-orange px-4 text-sm font-bold text-white transition-colors hover:bg-deep-orange"
            >
              Manage user accounts
            </Link>
          </DashboardCard>

          <DashboardCard title="Environment">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-grey">Session source</dt>
                <dd className="font-semibold text-charcoal">
                  {useRealPortalAuth ? "Portal API" : "Mock cookie"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-grey">Accounts endpoint</dt>
                <dd className="font-semibold text-charcoal">
                  {accounts.length ? "Responding" : "No data"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-grey">Contracted tables</dt>
                <dd className="font-semibold text-charcoal">
                  {portalSchemaTables.length}
                </dd>
              </div>
            </dl>
          </DashboardCard>
        </div>
      </div>
    </>
  );
}
