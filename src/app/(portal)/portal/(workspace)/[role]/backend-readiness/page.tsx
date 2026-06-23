import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Database,
  KeyRound,
  LockKeyhole,
  Route,
  ServerCog,
  ShieldCheck,
} from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { DataTable, type DataTableRow } from "@/components/portal/DataTable";
import { MetricCard } from "@/components/portal/MetricCard";
import { StatusBadge } from "@/components/portal/StatusBadge";
import {
  portalApiEndpoints,
  portalBackendServices,
  portalDataEntities,
  portalReadinessChecks,
} from "@/data/portal/api-contract";
import { isPortalRole } from "@/lib/portal/roles";

export const metadata: Metadata = {
  title: "Backend Readiness",
};

type BackendReadinessPageProps = {
  readonly params: Promise<{
    role: string;
  }>;
};

function contractStatusBadge(status: string) {
  if (status === "contracted") {
    return <StatusBadge variant="success">Contracted</StatusBadge>;
  }

  if (status === "mocked") {
    return <StatusBadge variant="info">Mocked</StatusBadge>;
  }

  if (status === "blocked") {
    return <StatusBadge variant="danger">Blocked</StatusBadge>;
  }

  return <StatusBadge variant="warning">Planned</StatusBadge>;
}

function readinessBadge(status: string) {
  if (status === "ready") {
    return <StatusBadge variant="success">Ready</StatusBadge>;
  }

  if (status === "needs_decision") {
    return <StatusBadge variant="warning">Needs decision</StatusBadge>;
  }

  return <StatusBadge variant="info">Needs backend</StatusBadge>;
}

export default async function BackendReadinessPage({
  params,
}: BackendReadinessPageProps) {
  const { role } = await params;

  if (!isPortalRole(role) || role !== "admin") {
    notFound();
  }

  const contractedEndpoints = portalApiEndpoints.filter(
    (endpoint) => endpoint.status === "contracted",
  );
  const plannedEndpoints = portalApiEndpoints.filter(
    (endpoint) => endpoint.status === "planned",
  );
  const auditEndpoints = portalApiEndpoints.filter(
    (endpoint) => endpoint.auditRequired,
  );

  const serviceRows: readonly DataTableRow[] = portalBackendServices.map(
    (service) => ({
      id: service.id,
      cells: [
        service.name,
        service.plannedHost,
        service.responsibility,
        service.requiredSecretTypes.length
          ? service.requiredSecretTypes.join(", ")
          : "None",
        contractStatusBadge(service.status),
      ],
    }),
  );

  const endpointRows: readonly DataTableRow[] = portalApiEndpoints.map(
    (endpoint) => ({
      id: endpoint.id,
      cells: [
        endpoint.method,
        endpoint.path,
        endpoint.summary,
        endpoint.roles.join(", "),
        endpoint.auditRequired ? "Yes" : "No",
        contractStatusBadge(endpoint.status),
      ],
    }),
  );

  const dataRows: readonly DataTableRow[] = portalDataEntities.map((entity) => ({
    id: entity.entity,
    cells: [
      entity.entity,
      entity.plannedStore,
      entity.currentMockSource,
      entity.containsSensitiveData ? "Yes" : "No",
      entity.auditRequired ? "Yes" : "No",
    ],
  }));

  const readinessRows: readonly DataTableRow[] = portalReadinessChecks.map(
    (check) => ({
      id: check.id,
      cells: [check.area, readinessBadge(check.status), check.detail],
    }),
  );

  return (
    <>
      <DashboardHeader
        eyebrow="Phase 8"
        title="Backend readiness"
        description="Review the planned Render API boundary, protected data stores, endpoint contracts, and decisions needed before replacing mock portal data."
        badge="Contract only"
      />

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="API endpoints"
          value={String(portalApiEndpoints.length)}
          detail={`${contractedEndpoints.length} contracted, ${plannedEndpoints.length} planned`}
          icon={<Route aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Backend services"
          value={String(portalBackendServices.length)}
          detail="No live service connected"
          icon={<ServerCog aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Audited writes"
          value={String(auditEndpoints.length)}
          detail="Require immutable audit records"
          icon={<ShieldCheck aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Secrets in frontend"
          value="0"
          detail="Secrets stay backend-only"
          icon={<LockKeyhole aria-hidden="true" className="size-5" />}
        />
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.3fr)_minmax(22rem,0.7fr)]">
        <div className="space-y-8">
          <DashboardCard
            title="Endpoint contract"
            description="The frontend can be wired to these routes later after the backend, authentication, and authorization layers exist."
          >
            <DataTable
              caption="Portal API endpoint contract"
              columns={[
                "Method",
                "Path",
                "Purpose",
                "Roles",
                "Audit",
                "Status",
              ]}
              rows={endpointRows}
            />
          </DashboardCard>

          <DashboardCard
            title="Data ownership"
            description="Current mock sources are mapped to future stores so backend implementation can replace them deliberately."
          >
            <DataTable
              caption="Portal backend data ownership"
              columns={[
                "Entity",
                "Planned store",
                "Current source",
                "Sensitive",
                "Audit",
              ]}
              rows={dataRows}
            />
          </DashboardCard>
        </div>

        <div className="space-y-8">
          <DashboardCard
            title="Service boundary"
            description="Planned systems and secret categories. No concrete secret values belong in this frontend repo."
          >
            <DataTable
              caption="Portal backend service boundary"
              columns={[
                "Service",
                "Host",
                "Responsibility",
                "Secret types",
                "Status",
              ]}
              rows={serviceRows}
            />
          </DashboardCard>

          <DashboardCard
            title="Readiness checks"
            description="What is ready now versus what needs backend implementation or school decision."
          >
            <DataTable
              caption="Portal backend readiness checks"
              columns={["Area", "Status", "Detail"]}
              rows={readinessRows}
            />
          </DashboardCard>

          <DashboardCard
            title="Security boundary"
            description="Non-negotiable rules before live portal data is introduced."
          >
            <ul className="space-y-3 text-sm leading-6 text-muted-grey">
              <li className="flex gap-3">
                <KeyRound
                  aria-hidden="true"
                  className="mt-0.5 size-5 shrink-0 text-curry-orange"
                />
                Admin-issued accounts only. No public sign-up endpoint.
              </li>
              <li className="flex gap-3">
                <Database
                  aria-hidden="true"
                  className="mt-0.5 size-5 shrink-0 text-curry-orange"
                />
                PostgreSQL writes must be role-checked and audit logged.
              </li>
              <li className="flex gap-3">
                <LockKeyhole
                  aria-hidden="true"
                  className="mt-0.5 size-5 shrink-0 text-curry-orange"
                />
                Payment, storage, auth, and notification secrets remain
                server-side only.
              </li>
            </ul>
          </DashboardCard>
        </div>
      </div>
    </>
  );
}
