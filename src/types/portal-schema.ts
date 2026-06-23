export type PortalSchemaDomain =
  | "identity"
  | "academics"
  | "courses"
  | "finance"
  | "transport"
  | "files"
  | "notifications"
  | "audit"
  | "system";

export type PortalSchemaSensitivity =
  | "internal"
  | "student_record"
  | "financial"
  | "credential"
  | "operational";

export type PortalSchemaAuditLevel =
  | "none"
  | "read"
  | "write"
  | "immutable";

export type PortalSchemaStatus = "designed" | "planned" | "blocked";

export type PortalSchemaTableSpec = {
  readonly name: string;
  readonly domain: PortalSchemaDomain;
  readonly purpose: string;
  readonly primaryKey: string;
  readonly keyFields: readonly string[];
  readonly currentMockSources: readonly string[];
  readonly sensitivity: PortalSchemaSensitivity;
  readonly auditLevel: PortalSchemaAuditLevel;
  readonly migrationGroup: number;
  readonly status: PortalSchemaStatus;
  readonly notes?: string;
};

export type PortalSchemaRelationshipType =
  | "one_to_one"
  | "one_to_many"
  | "many_to_many";

export type PortalSchemaRelationshipSpec = {
  readonly id: string;
  readonly fromTable: string;
  readonly toTable: string;
  readonly type: PortalSchemaRelationshipType;
  readonly rule: string;
  readonly required: boolean;
};

export type PortalSchemaIndexSpec = {
  readonly table: string;
  readonly fields: readonly string[];
  readonly unique: boolean;
  readonly purpose: string;
};

export type PortalSchemaMigrationStep = {
  readonly group: number;
  readonly title: string;
  readonly objective: string;
  readonly tables: readonly string[];
  readonly guardrails: readonly string[];
};

export type PortalSchemaRetentionRule = {
  readonly entity: string;
  readonly retention: string;
  readonly reason: string;
};
