import type {
  PortalFileCategorySpec,
  PortalStorageAccessRule,
  PortalStorageFlowStep,
  PortalStorageProviderSpec,
  PortalStorageReadinessCheck,
  PortalStorageSecurityControl,
} from "@/types/portal-storage";

export const portalStorageProviders = [
  {
    id: "s3-compatible",
    name: "S3-compatible private bucket",
    kind: "s3_compatible",
    roleInFlow:
      "Potential private object storage for course files, receipts, report cards, and exports.",
    secretTypes: [
      "access key id",
      "secret access key",
      "bucket name",
      "region/endpoint",
    ],
    status: "needs_decision",
    notes:
      "Candidate only. The frontend must never store bucket credentials or write directly to permanent storage.",
  },
  {
    id: "managed-storage",
    name: "Managed storage provider",
    kind: "managed_storage",
    roleInFlow:
      "Potential storage service with signed URL support and private object policies.",
    secretTypes: ["service role key", "bucket policy credentials"],
    status: "needs_decision",
    notes:
      "Provider must support private files, signed URLs, object metadata, and backend-only credentials.",
  },
  {
    id: "private-bucket",
    name: "School-owned private bucket",
    kind: "private_bucket",
    roleInFlow:
      "Long-term storage option controlled by school-approved cloud ownership and retention policy.",
    secretTypes: ["bucket credentials", "IAM policy credentials"],
    status: "planned",
    notes:
      "Requires operational ownership decision, backup policy, and retention approval.",
  },
  {
    id: "local-dev",
    name: "Local development storage",
    kind: "local_dev_only",
    roleInFlow:
      "Temporary development-only storage for backend engineers when testing upload flows locally.",
    secretTypes: [],
    status: "designed",
    notes:
      "Local files must not be treated as production storage or committed to the frontend repository.",
  },
] satisfies readonly PortalStorageProviderSpec[];

export const portalFileCategories = [
  {
    category: "course_material",
    label: "Course materials",
    createdBy: ["staff", "admin"],
    visibleTo: ["student", "parent", "staff", "admin"],
    maxSizeMb: 25,
    allowedTypes: ["pdf", "doc", "docx", "ppt", "pptx", "image", "link"],
    retention: "Keep while course is active; archive by academic year policy.",
    auditRequired: true,
    status: "designed",
  },
  {
    category: "assignment_submission",
    label: "Assignment submissions",
    createdBy: ["student"],
    visibleTo: ["student", "staff", "admin"],
    maxSizeMb: 25,
    allowedTypes: ["pdf", "doc", "docx", "image"],
    retention: "Keep through grading window and archive by academic policy.",
    auditRequired: true,
    status: "planned",
  },
  {
    category: "report_card",
    label: "Report cards",
    createdBy: ["admin", "staff"],
    visibleTo: ["student", "parent", "staff", "admin"],
    maxSizeMb: 10,
    allowedTypes: ["pdf"],
    retention: "Keep in student record archive according to school policy.",
    auditRequired: true,
    status: "planned",
  },
  {
    category: "receipt",
    label: "Payment receipts",
    createdBy: ["accounts"],
    visibleTo: ["parent", "accounts", "admin"],
    maxSizeMb: 5,
    allowedTypes: ["pdf"],
    retention: "Keep for finance and statutory reporting requirements.",
    auditRequired: true,
    status: "designed",
  },
  {
    category: "finance_export",
    label: "Finance exports",
    createdBy: ["accounts", "admin"],
    visibleTo: ["accounts", "admin"],
    maxSizeMb: 20,
    allowedTypes: ["csv", "xlsx", "pdf"],
    retention: "Expire generated exports quickly unless formally archived.",
    auditRequired: true,
    status: "designed",
  },
  {
    category: "admin_document",
    label: "Administrative documents",
    createdBy: ["admin"],
    visibleTo: ["admin"],
    maxSizeMb: 25,
    allowedTypes: ["pdf", "doc", "docx", "image"],
    retention: "Retain according to school administrative document policy.",
    auditRequired: true,
    status: "planned",
  },
  {
    category: "transport_document",
    label: "Transport documents",
    createdBy: ["transport", "admin"],
    visibleTo: ["transport", "admin"],
    maxSizeMb: 15,
    allowedTypes: ["pdf", "image"],
    retention: "Retain while route or vehicle assignment is active.",
    auditRequired: true,
    status: "planned",
  },
] satisfies readonly PortalFileCategorySpec[];

export const portalStorageFlowSteps = [
  {
    step: 1,
    name: "User chooses file",
    actor: "staff",
    purpose:
      "Select course material, report, receipt, export, or approved document from a portal form.",
    auditRequired: false,
    status: "designed",
  },
  {
    step: 2,
    name: "Backend validates upload intent",
    actor: "backend",
    purpose:
      "Check role, record ownership, category, file size, extension, and account status before issuing any upload URL.",
    auditRequired: true,
    status: "designed",
  },
  {
    step: 3,
    name: "Backend creates signed upload URL",
    actor: "backend",
    purpose:
      "Return a short-lived provider-specific upload URL without exposing storage credentials.",
    auditRequired: true,
    status: "planned",
  },
  {
    step: 4,
    name: "File uploads to private storage",
    actor: "storage_provider",
    purpose:
      "Store the object in a private bucket/key that is not publicly listable or directly downloadable.",
    auditRequired: false,
    status: "planned",
  },
  {
    step: 5,
    name: "Backend records file metadata",
    actor: "backend",
    purpose:
      "Store owner, category, object key, checksum, size, MIME type, visibility, and retention metadata.",
    auditRequired: true,
    status: "designed",
  },
  {
    step: 6,
    name: "Scanner reviews file",
    actor: "scanner",
    purpose:
      "Mark the object as safe, rejected, or needs manual review before broad access.",
    auditRequired: true,
    status: "planned",
  },
  {
    step: 7,
    name: "Authorized download requested",
    actor: "backend",
    purpose:
      "Verify role and record ownership before issuing a short-lived signed download URL.",
    auditRequired: true,
    status: "designed",
  },
] satisfies readonly PortalStorageFlowStep[];

export const portalStorageAccessRules = [
  {
    rule: "Course materials are visible only to enrolled students, linked parents, assigned staff, and admins.",
    appliesTo: ["course_material"],
    enforcement:
      "Backend joins course, class, student, parent link, and staff assignment before download URL is issued.",
    status: "designed",
  },
  {
    rule: "Assignment submissions are visible to the submitting student, assigned staff, and admins.",
    appliesTo: ["assignment_submission"],
    enforcement:
      "Backend checks assignment ownership and staff class/subject assignment.",
    status: "planned",
  },
  {
    rule: "Receipts are visible to linked parents, accounts users, and admins after verified payment or approved manual entry.",
    appliesTo: ["receipt"],
    enforcement:
      "Backend checks invoice/payment ownership and finance role before download.",
    status: "designed",
  },
  {
    rule: "Finance exports are restricted to accounts and admin roles.",
    appliesTo: ["finance_export"],
    enforcement:
      "Backend generates short-lived export file and records audit event for every download intent.",
    status: "designed",
  },
  {
    rule: "Admin documents and transport documents are not public portal downloads.",
    appliesTo: ["admin_document", "transport_document"],
    enforcement:
      "Backend restricts visibility to admin/transport scopes and denies parent/student access.",
    status: "planned",
  },
] satisfies readonly PortalStorageAccessRule[];

export const portalStorageSecurityControls = [
  {
    control: "Private buckets only",
    rule: "No permanent portal file should be publicly listable or anonymously downloadable.",
    failureMode:
      "If object policy cannot enforce privacy, the provider is not acceptable for production.",
    status: "designed",
  },
  {
    control: "Signed URLs",
    rule: "Uploads and downloads use short-lived backend-issued URLs.",
    failureMode:
      "Expired URL returns a safe denial and requires a new authorized backend request.",
    status: "designed",
  },
  {
    control: "File scanning",
    rule: "Uploaded files should be scanned or quarantined before broad access.",
    failureMode:
      "Unsafe or unscanned files remain unavailable and are flagged for review.",
    status: "planned",
  },
  {
    control: "MIME and extension validation",
    rule: "Backend validates declared MIME type, file extension, size, and category allowlist.",
    failureMode:
      "Invalid files are rejected before signed upload intent is created.",
    status: "designed",
  },
  {
    control: "Checksum metadata",
    rule: "Backend stores checksum or provider ETag for uploaded files.",
    failureMode:
      "Missing checksum flags the file for review or re-upload.",
    status: "planned",
  },
  {
    control: "Retention and deletion",
    rule: "Retention policy controls archive, expiry, and deletion by file category.",
    failureMode:
      "Files with no retention rule cannot be enabled for production upload.",
    status: "needs_decision",
  },
] satisfies readonly PortalStorageSecurityControl[];

export const portalStorageReadinessChecks = [
  {
    area: "Provider choice",
    status: "needs_decision",
    detail:
      "School/backend team must choose private object storage provider and ownership model.",
  },
  {
    area: "Frontend upload previews",
    status: "ready",
    detail:
      "Current course material controls keep selected files on the user's device and perform no upload.",
  },
  {
    area: "Signed upload flow",
    status: "planned",
    detail:
      "Backend endpoint must validate category and return short-lived upload URL.",
  },
  {
    area: "Signed download flow",
    status: "designed",
    detail:
      "Backend must check role and record ownership before returning short-lived download URL.",
  },
  {
    area: "File metadata table",
    status: "designed",
    detail:
      "file_assets table is defined in the schema plan for owner, category, object key, checksum, and retention.",
  },
  {
    area: "Scanning policy",
    status: "needs_decision",
    detail:
      "Malware scanning/quarantine approach needs provider and operational approval.",
  },
  {
    area: "Retention policy",
    status: "needs_decision",
    detail:
      "Report cards, receipts, exports, submissions, and documents need approved retention windows.",
  },
  {
    area: "Secrets boundary",
    status: "designed",
    detail:
      "Storage credentials belong only in the Render backend environment, not in the Vercel frontend.",
  },
] satisfies readonly PortalStorageReadinessCheck[];
