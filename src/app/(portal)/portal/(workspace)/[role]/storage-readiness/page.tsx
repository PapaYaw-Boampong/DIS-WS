import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Archive,
  ClipboardCheck,
  Download,
  FileText,
  LockKeyhole,
  ShieldCheck,
  Upload,
} from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { DataTable, type DataTableRow } from "@/components/portal/DataTable";
import { MetricCard } from "@/components/portal/MetricCard";
import { StatusBadge } from "@/components/portal/StatusBadge";
import {
  portalFileCategories,
  portalStorageAccessRules,
  portalStorageFlowSteps,
  portalStorageProviders,
  portalStorageReadinessChecks,
  portalStorageSecurityControls,
} from "@/data/portal/storage-contract";
import { isPortalRole } from "@/lib/portal/roles";

export const metadata: Metadata = {
  title: "Storage Readiness",
};

type StorageReadinessPageProps = {
  readonly params: Promise<{
    role: string;
  }>;
};

function storageStatusBadge(status: string) {
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

export default async function StorageReadinessPage({
  params,
}: StorageReadinessPageProps) {
  const { role } = await params;

  if (!isPortalRole(role) || role !== "admin") {
    notFound();
  }

  const providerDecisions = portalStorageProviders.filter(
    (provider) => provider.status === "needs_decision",
  );
  const auditedCategories = portalFileCategories.filter(
    (category) => category.auditRequired,
  );
  const designedControls = portalStorageSecurityControls.filter(
    (control) => control.status === "designed",
  );
  const readyChecks = portalStorageReadinessChecks.filter(
    (check) => check.status === "ready",
  );

  const providerRows: readonly DataTableRow[] = portalStorageProviders.map(
    (provider) => ({
      id: provider.id,
      cells: [
        provider.name,
        provider.kind.replaceAll("_", " "),
        provider.roleInFlow,
        provider.secretTypes.length ? provider.secretTypes.join(", ") : "None",
        storageStatusBadge(provider.status),
      ],
    }),
  );

  const categoryRows: readonly DataTableRow[] = portalFileCategories.map(
    (category) => ({
      id: category.category,
      cells: [
        category.label,
        category.createdBy.join(", "),
        category.visibleTo.join(", "),
        `${category.maxSizeMb} MB`,
        category.allowedTypes.join(", "),
        category.retention,
        storageStatusBadge(category.status),
      ],
    }),
  );

  const flowRows: readonly DataTableRow[] = portalStorageFlowSteps.map(
    (step) => ({
      id: String(step.step),
      cells: [
        String(step.step),
        step.name,
        step.actor,
        step.purpose,
        step.auditRequired ? "Yes" : "No",
        storageStatusBadge(step.status),
      ],
    }),
  );

  const accessRows: readonly DataTableRow[] = portalStorageAccessRules.map(
    (rule) => ({
      id: rule.rule,
      cells: [
        rule.rule,
        rule.appliesTo.join(", "),
        rule.enforcement,
        storageStatusBadge(rule.status),
      ],
    }),
  );

  const controlRows: readonly DataTableRow[] =
    portalStorageSecurityControls.map((control) => ({
      id: control.control,
      cells: [
        control.control,
        control.rule,
        control.failureMode,
        storageStatusBadge(control.status),
      ],
    }));

  const readinessRows: readonly DataTableRow[] =
    portalStorageReadinessChecks.map((check) => ({
      id: check.area,
      cells: [check.area, storageStatusBadge(check.status), check.detail],
    }));

  return (
    <>
      <DashboardHeader
        eyebrow="Phase 12"
        title="Storage readiness"
        description="Review private file storage providers, file categories, upload/download flows, access rules, security controls, and retention decisions before live portal files are enabled."
        badge="Storage not connected"
      />

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Provider decisions"
          value={String(providerDecisions.length)}
          detail="Need storage choice"
          icon={<Archive aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="File categories"
          value={String(portalFileCategories.length)}
          detail={`${auditedCategories.length} require audit`}
          icon={<FileText aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Security controls"
          value={String(designedControls.length)}
          detail="Designed before provider setup"
          icon={<ShieldCheck aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Ready checks"
          value={String(readyChecks.length)}
          detail="Current frontend remains local"
          icon={<ClipboardCheck aria-hidden="true" className="size-5" />}
        />
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(22rem,0.65fr)]">
        <div className="space-y-8">
          <DashboardCard
            title="Storage provider options"
            description="Candidates only. No provider SDK, bucket, key, or storage endpoint is connected."
          >
            <DataTable
              caption="Portal storage provider options"
              columns={["Provider", "Kind", "Role", "Secret types", "Status"]}
              rows={providerRows}
            />
          </DashboardCard>

          <DashboardCard
            title="File categories"
            description="Each file type needs role visibility, limits, retention, and audit rules before live uploads."
          >
            <DataTable
              caption="Portal file categories"
              columns={[
                "Category",
                "Created by",
                "Visible to",
                "Max size",
                "Allowed types",
                "Retention",
                "Status",
              ]}
              rows={categoryRows}
            />
          </DashboardCard>

          <DashboardCard
            title="Upload and download flow"
            description="Signed URL flows should be backend-issued and short-lived."
          >
            <DataTable
              caption="Portal file upload and download flow"
              columns={["Step", "Name", "Actor", "Purpose", "Audit", "Status"]}
              rows={flowRows}
            />
          </DashboardCard>
        </div>

        <div className="space-y-8">
          <DashboardCard
            title="Access rules"
            description="The backend must verify role and record ownership before issuing download URLs."
          >
            <DataTable
              caption="Portal file access rules"
              columns={["Rule", "Applies to", "Enforcement", "Status"]}
              rows={accessRows}
            />
          </DashboardCard>

          <DashboardCard
            title="Security controls"
            description="Controls that must exist before live files are enabled."
          >
            <DataTable
              caption="Portal file security controls"
              columns={["Control", "Rule", "Failure mode", "Status"]}
              rows={controlRows}
            />
          </DashboardCard>

          <DashboardCard
            title="Readiness checks"
            description="What is ready now versus what needs provider or school policy decisions."
          >
            <DataTable
              caption="Portal storage readiness checks"
              columns={["Area", "Status", "Detail"]}
              rows={readinessRows}
            />
          </DashboardCard>

          <DashboardCard
            title="Implementation boundary"
            description="This phase is a storage policy map only."
          >
            <ul className="space-y-3 text-sm leading-6 text-muted-grey">
              <li className="flex gap-3">
                <Upload
                  aria-hidden="true"
                  className="mt-0.5 size-5 shrink-0 text-curry-orange"
                />
                No file upload endpoint, storage SDK, bucket key, or signed URL
                generation was added.
              </li>
              <li className="flex gap-3">
                <Download
                  aria-hidden="true"
                  className="mt-0.5 size-5 shrink-0 text-curry-orange"
                />
                Downloads should wait for backend authorization and short-lived
                signed URLs.
              </li>
              <li className="flex gap-3">
                <LockKeyhole
                  aria-hidden="true"
                  className="mt-0.5 size-5 shrink-0 text-curry-orange"
                />
                Storage credentials belong only in the future Render backend
                environment.
              </li>
            </ul>
          </DashboardCard>
        </div>
      </div>
    </>
  );
}
