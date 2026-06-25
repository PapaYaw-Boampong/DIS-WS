import type { PortalRole } from "@/types/portal";

export type PortalStoragePolicyStatus =
  | "ready"
  | "designed"
  | "planned"
  | "needs_decision";

export type PortalStorageProviderKind =
  | "s3_compatible"
  | "managed_storage"
  | "private_bucket"
  | "local_dev_only";

export type PortalFileCategory =
  | "course_material"
  | "assignment_submission"
  | "report_card"
  | "receipt"
  | "finance_export"
  | "admin_document"
  | "transport_document";

export type PortalStorageProviderSpec = {
  readonly id: string;
  readonly name: string;
  readonly kind: PortalStorageProviderKind;
  readonly roleInFlow: string;
  readonly secretTypes: readonly string[];
  readonly status: PortalStoragePolicyStatus;
  readonly notes: string;
};

export type PortalFileCategorySpec = {
  readonly category: PortalFileCategory;
  readonly label: string;
  readonly createdBy: readonly PortalRole[];
  readonly visibleTo: readonly PortalRole[];
  readonly maxSizeMb: number;
  readonly allowedTypes: readonly string[];
  readonly retention: string;
  readonly auditRequired: boolean;
  readonly status: PortalStoragePolicyStatus;
};

export type PortalStorageFlowStep = {
  readonly step: number;
  readonly name: string;
  readonly actor: PortalRole | "backend" | "storage_provider" | "scanner";
  readonly purpose: string;
  readonly auditRequired: boolean;
  readonly status: PortalStoragePolicyStatus;
};

export type PortalStorageAccessRule = {
  readonly rule: string;
  readonly appliesTo: readonly PortalFileCategory[];
  readonly enforcement: string;
  readonly status: PortalStoragePolicyStatus;
};

export type PortalStorageSecurityControl = {
  readonly control: string;
  readonly rule: string;
  readonly failureMode: string;
  readonly status: PortalStoragePolicyStatus;
};

export type PortalStorageReadinessCheck = {
  readonly area: string;
  readonly status: PortalStoragePolicyStatus;
  readonly detail: string;
};
