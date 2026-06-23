import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Database,
  GitBranch,
  KeySquare,
  ListTree,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { DataTable, type DataTableRow } from "@/components/portal/DataTable";
import { MetricCard } from "@/components/portal/MetricCard";
import { StatusBadge } from "@/components/portal/StatusBadge";
import {
  portalSchemaIndexes,
  portalSchemaMigrationSteps,
  portalSchemaRelationships,
  portalSchemaRetentionRules,
  portalSchemaTables,
} from "@/data/portal/schema-contract";
import { isPortalRole } from "@/lib/portal/roles";

export const metadata: Metadata = {
  title: "Database Readiness",
};

type DatabaseReadinessPageProps = {
  readonly params: Promise<{
    role: string;
  }>;
};

function schemaStatusBadge(status: string) {
  if (status === "designed") {
    return <StatusBadge variant="success">Designed</StatusBadge>;
  }

  if (status === "blocked") {
    return <StatusBadge variant="danger">Blocked</StatusBadge>;
  }

  return <StatusBadge variant="warning">Planned</StatusBadge>;
}

function auditBadge(level: string) {
  if (level === "immutable") {
    return <StatusBadge variant="danger">Immutable</StatusBadge>;
  }

  if (level === "write") {
    return <StatusBadge variant="warning">Writes</StatusBadge>;
  }

  if (level === "read") {
    return <StatusBadge variant="info">Reads</StatusBadge>;
  }

  return <StatusBadge>None</StatusBadge>;
}

export default async function DatabaseReadinessPage({
  params,
}: DatabaseReadinessPageProps) {
  const { role } = await params;

  if (!isPortalRole(role) || role !== "admin") {
    notFound();
  }

  const designedTables = portalSchemaTables.filter(
    (table) => table.status === "designed",
  );
  const plannedTables = portalSchemaTables.filter(
    (table) => table.status === "planned",
  );
  const immutableAuditTables = portalSchemaTables.filter(
    (table) => table.auditLevel === "immutable",
  );
  const financialTables = portalSchemaTables.filter(
    (table) => table.sensitivity === "financial",
  );

  const tableRows: readonly DataTableRow[] = portalSchemaTables.map((table) => ({
    id: table.name,
    cells: [
      table.name,
      table.domain,
      table.purpose,
      table.primaryKey,
      table.keyFields.join(", "),
      auditBadge(table.auditLevel),
      schemaStatusBadge(table.status),
    ],
  }));

  const relationshipRows: readonly DataTableRow[] =
    portalSchemaRelationships.map((relationship) => ({
      id: relationship.id,
      cells: [
        relationship.fromTable,
        relationship.toTable,
        relationship.type.replaceAll("_", " "),
        relationship.required ? "Required" : "Optional",
        relationship.rule,
      ],
    }));

  const indexRows: readonly DataTableRow[] = portalSchemaIndexes.map(
    (index) => ({
      id: `${index.table}-${index.fields.join("-")}`,
      cells: [
        index.table,
        index.fields.join(", "),
        index.unique ? "Unique" : "Non-unique",
        index.purpose,
      ],
    }),
  );

  const migrationRows: readonly DataTableRow[] =
    portalSchemaMigrationSteps.map((step) => ({
      id: String(step.group),
      cells: [
        String(step.group),
        step.title,
        step.objective,
        step.tables.join(", "),
        step.guardrails.join(" "),
      ],
    }));

  const retentionRows: readonly DataTableRow[] =
    portalSchemaRetentionRules.map((rule) => ({
      id: rule.entity,
      cells: [rule.entity, rule.retention, rule.reason],
    }));

  return (
    <>
      <DashboardHeader
        eyebrow="Phase 9"
        title="Database readiness"
        description="Review the planned PostgreSQL schema, relationships, indexes, migration order, and retention rules before a separate backend service is built."
        badge="Schema plan"
      />

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Tables"
          value={String(portalSchemaTables.length)}
          detail={`${designedTables.length} designed, ${plannedTables.length} planned`}
          icon={<Database aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Relationships"
          value={String(portalSchemaRelationships.length)}
          detail="Role and data ownership rules"
          icon={<GitBranch aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Immutable audit"
          value={String(immutableAuditTables.length)}
          detail="Sensitive write tables"
          icon={<ShieldCheck aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Financial tables"
          value={String(financialTables.length)}
          detail="Require accounts controls"
          icon={<LockKeyhole aria-hidden="true" className="size-5" />}
        />
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(22rem,0.65fr)]">
        <div className="space-y-8">
          <DashboardCard
            title="Planned PostgreSQL tables"
            description="These are schema design records only. No database or ORM is connected in this phase."
          >
            <DataTable
              caption="Portal planned database tables"
              columns={[
                "Table",
                "Domain",
                "Purpose",
                "PK",
                "Key fields",
                "Audit",
                "Status",
              ]}
              rows={tableRows}
            />
          </DashboardCard>

          <DashboardCard
            title="Relationships and access rules"
            description="These relationships define how role-based data ownership should be enforced server-side."
          >
            <DataTable
              caption="Portal schema relationships"
              columns={["From", "To", "Type", "Required", "Rule"]}
              rows={relationshipRows}
            />
          </DashboardCard>

          <DashboardCard
            title="Migration order"
            description="The database should be introduced in small groups instead of one large production switch."
          >
            <DataTable
              caption="Portal schema migration order"
              columns={["Group", "Title", "Objective", "Tables", "Guardrails"]}
              rows={migrationRows}
            />
          </DashboardCard>
        </div>

        <div className="space-y-8">
          <DashboardCard
            title="Indexes and constraints"
            description="Initial lookup and uniqueness requirements for common portal queries."
          >
            <DataTable
              caption="Portal schema indexes"
              columns={["Table", "Fields", "Constraint", "Purpose"]}
              rows={indexRows}
            />
          </DashboardCard>

          <DashboardCard
            title="Retention rules"
            description="Retention is a policy decision, but these areas need explicit school approval before live data is stored."
          >
            <DataTable
              caption="Portal retention planning"
              columns={["Entity", "Retention", "Reason"]}
              rows={retentionRows}
            />
          </DashboardCard>

          <DashboardCard
            title="Implementation boundary"
            description="What this phase does and does not do."
          >
            <ul className="space-y-3 text-sm leading-6 text-muted-grey">
              <li className="flex gap-3">
                <ListTree
                  aria-hidden="true"
                  className="mt-0.5 size-5 shrink-0 text-curry-orange"
                />
                Schema design only. No migration files or ORM package were
                added.
              </li>
              <li className="flex gap-3">
                <KeySquare
                  aria-hidden="true"
                  className="mt-0.5 size-5 shrink-0 text-curry-orange"
                />
                No database URL, credentials, secrets, or production records
                belong in the frontend.
              </li>
              <li className="flex gap-3">
                <ShieldCheck
                  aria-hidden="true"
                  className="mt-0.5 size-5 shrink-0 text-curry-orange"
                />
                Live writes should wait for backend authorization and immutable
                audit logging.
              </li>
            </ul>
          </DashboardCard>
        </div>
      </div>
    </>
  );
}
