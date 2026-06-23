import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Fingerprint,
  KeyRound,
  LockKeyhole,
  Route,
  ShieldCheck,
  UserCog,
} from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { DataTable, type DataTableRow } from "@/components/portal/DataTable";
import { MetricCard } from "@/components/portal/MetricCard";
import { StatusBadge } from "@/components/portal/StatusBadge";
import {
  portalAccountLifecycleSteps,
  portalAuthReadinessChecks,
  portalPasswordResetRules,
  portalRolePermissions,
  portalRouteAccessPolicies,
  portalSessionControls,
} from "@/data/portal/auth-contract";
import { isPortalRole } from "@/lib/portal/roles";

export const metadata: Metadata = {
  title: "Auth Readiness",
};

type AuthReadinessPageProps = {
  readonly params: Promise<{
    role: string;
  }>;
};

function policyStatusBadge(status: string) {
  if (status === "ready") {
    return <StatusBadge variant="success">Ready</StatusBadge>;
  }

  if (status === "designed") {
    return <StatusBadge variant="info">Designed</StatusBadge>;
  }

  if (status === "needs_decision") {
    return <StatusBadge variant="warning">Needs decision</StatusBadge>;
  }

  return <StatusBadge>Planned</StatusBadge>;
}

export default async function AuthReadinessPage({
  params,
}: AuthReadinessPageProps) {
  const { role } = await params;

  if (!isPortalRole(role) || role !== "admin") {
    notFound();
  }

  const readyChecks = portalAuthReadinessChecks.filter(
    (check) => check.status === "ready",
  );
  const decisionChecks = portalAuthReadinessChecks.filter(
    (check) => check.status === "needs_decision",
  );
  const auditedLifecycleSteps = portalAccountLifecycleSteps.filter(
    (step) => step.auditRequired,
  );

  const roleRows: readonly DataTableRow[] = portalRolePermissions.map(
    (permission) => ({
      id: permission.role,
      cells: [
        permission.label,
        permission.permissionLevel.replaceAll("_", " "),
        permission.accessSummary,
        permission.deniedSummary,
        policyStatusBadge(permission.status),
      ],
    }),
  );

  const routeRows: readonly DataTableRow[] = portalRouteAccessPolicies.map(
    (policy) => ({
      id: policy.routePattern,
      cells: [
        policy.routePattern,
        policy.owner,
        policy.allowedRoles.join(", "),
        policy.ownershipRule,
        policy.backendPolicy,
        policyStatusBadge(policy.status),
      ],
    }),
  );

  const lifecycleRows: readonly DataTableRow[] =
    portalAccountLifecycleSteps.map((step) => ({
      id: String(step.step),
      cells: [
        String(step.step),
        step.name,
        step.actor,
        step.purpose,
        step.auditRequired ? "Yes" : "No",
        policyStatusBadge(step.status),
      ],
    }));

  const sessionRows: readonly DataTableRow[] = portalSessionControls.map(
    (control) => ({
      id: control.control,
      cells: [
        control.control,
        control.rule,
        control.reason,
        policyStatusBadge(control.status),
      ],
    }),
  );

  const resetRows: readonly DataTableRow[] = portalPasswordResetRules.map(
    (rule) => ({
      id: `${rule.actor}-${rule.rule}`,
      cells: [
        rule.actor,
        rule.rule,
        rule.auditRequired ? "Yes" : "No",
        policyStatusBadge(rule.status),
      ],
    }),
  );

  const readinessRows: readonly DataTableRow[] =
    portalAuthReadinessChecks.map((check) => ({
      id: check.area,
      cells: [check.area, policyStatusBadge(check.status), check.detail],
    }));

  return (
    <>
      <DashboardHeader
        eyebrow="Phase 10"
        title="Auth readiness"
        description="Review the production authentication and authorization policy before any live portal records are connected."
        badge="Policy only"
      />

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Portal roles"
          value={String(portalRolePermissions.length)}
          detail="Role access levels mapped"
          icon={<UserCog aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Route policies"
          value={String(portalRouteAccessPolicies.length)}
          detail="Namespace and ownership checks"
          icon={<Route aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Audited lifecycle"
          value={String(auditedLifecycleSteps.length)}
          detail="Account events requiring audit"
          icon={<ShieldCheck aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Decisions left"
          value={String(decisionChecks.length)}
          detail={`${readyChecks.length} checks already ready`}
          icon={<LockKeyhole aria-hidden="true" className="size-5" />}
        />
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(22rem,0.65fr)]">
        <div className="space-y-8">
          <DashboardCard
            title="Role permission model"
            description="Production backend authorization should enforce these role scopes before returning live data."
          >
            <DataTable
              caption="Portal role permission model"
              columns={[
                "Role",
                "Permission level",
                "Allowed access",
                "Denied access",
                "Status",
              ]}
              rows={roleRows}
            />
          </DashboardCard>

          <DashboardCard
            title="Route and ownership policies"
            description="Frontend redirects improve UX, but backend route and record ownership checks are mandatory."
          >
            <DataTable
              caption="Portal route access policies"
              columns={[
                "Route",
                "Owner",
                "Allowed roles",
                "Ownership rule",
                "Backend policy",
                "Status",
              ]}
              rows={routeRows}
            />
          </DashboardCard>

          <DashboardCard
            title="Account lifecycle"
            description="No public sign-up exists. Accounts move through administrator-issued lifecycle steps."
          >
            <DataTable
              caption="Portal account lifecycle"
              columns={["Step", "Name", "Actor", "Purpose", "Audit", "Status"]}
              rows={lifecycleRows}
            />
          </DashboardCard>
        </div>

        <div className="space-y-8">
          <DashboardCard
            title="Session controls"
            description="Production sessions must be owned by the backend, not the client."
          >
            <DataTable
              caption="Portal session controls"
              columns={["Control", "Rule", "Reason", "Status"]}
              rows={sessionRows}
            />
          </DashboardCard>

          <DashboardCard
            title="Password reset policy"
            description="Reset flows should work only for existing approved accounts without exposing account existence."
          >
            <DataTable
              caption="Portal password reset policy"
              columns={["Actor", "Rule", "Audit", "Status"]}
              rows={resetRows}
            />
          </DashboardCard>

          <DashboardCard
            title="Readiness checks"
            description="What is already settled versus what still requires backend implementation or a school decision."
          >
            <DataTable
              caption="Portal auth readiness checks"
              columns={["Area", "Status", "Detail"]}
              rows={readinessRows}
            />
          </DashboardCard>

          <DashboardCard
            title="Implementation boundary"
            description="This phase is a production policy map only."
          >
            <ul className="space-y-3 text-sm leading-6 text-muted-grey">
              <li className="flex gap-3">
                <KeyRound
                  aria-hidden="true"
                  className="mt-0.5 size-5 shrink-0 text-curry-orange"
                />
                No real credentials, password hashing, reset tokens, or auth
                provider integration were added.
              </li>
              <li className="flex gap-3">
                <Fingerprint
                  aria-hidden="true"
                  className="mt-0.5 size-5 shrink-0 text-curry-orange"
                />
                The current portal still uses mock sessions until the backend
                owns production session checks.
              </li>
              <li className="flex gap-3">
                <ShieldCheck
                  aria-hidden="true"
                  className="mt-0.5 size-5 shrink-0 text-curry-orange"
                />
                Live data should wait for backend role, route, record ownership,
                and audit-log enforcement.
              </li>
            </ul>
          </DashboardCard>
        </div>
      </div>
    </>
  );
}
