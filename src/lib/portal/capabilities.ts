import { portalRoles, type PortalRole } from "@/types/portal";

/**
 * A capability is one thing a role is allowed to do. The developer portal can
 * grant or revoke them per role, so the school can decide (for example) whether
 * the school administrator may create classes and enrol students, or whether
 * that stays with the registry.
 */
export const portalCapabilities = [
  "students.view",
  "students.create",
  "students.import",
  "students.promote",
  "students.export",
  "parents.view",
  "parents.create",
  "staff.view",
  "staff.create",
  "classes.manage",
  "reportcards.publish",
  "documents.manage",
  "admissions.manage",
  "website.manage",
  "finance.manage",
  "transport.manage",
  "accounts.manage",
  "platform.readiness",
] as const;

export type PortalCapability = (typeof portalCapabilities)[number];

export type CapabilityGroup = {
  readonly label: string;
  readonly capabilities: readonly {
    readonly id: PortalCapability;
    readonly label: string;
    readonly description: string;
  }[];
};

// Grouped for the developer's permission matrix.
export const capabilityGroups: readonly CapabilityGroup[] = [
  {
    label: "Learners",
    capabilities: [
      { id: "students.view", label: "View students", description: "Open the student register." },
      { id: "students.create", label: "Create students", description: "Enrol a learner with a full intake record." },
      { id: "students.import", label: "Import students", description: "Upload a class list from a spreadsheet." },
      { id: "students.promote", label: "Promote students", description: "Move a class up a grade at the end of the year." },
      { id: "students.export", label: "Export records", description: "Download register data as a spreadsheet." },
    ],
  },
  {
    label: "Families and staff",
    capabilities: [
      { id: "parents.view", label: "View parents", description: "Open the parent and guardian register." },
      { id: "parents.create", label: "Create parents", description: "Add a guardian and link them to learners." },
      { id: "staff.view", label: "View staff records", description: "Open the staff register." },
      { id: "staff.create", label: "Create staff", description: "Add a staff record and portal account request." },
    ],
  },
  {
    label: "Academics",
    capabilities: [
      { id: "classes.manage", label: "Manage classes", description: "Create classes and set class teachers." },
      { id: "reportcards.publish", label: "Publish report cards", description: "Release end-of-term reports to families." },
      { id: "documents.manage", label: "Manage documents", description: "Publish school documents to the portal." },
      { id: "admissions.manage", label: "Manage admissions", description: "Handle enquiries and the mailing list." },
    ],
  },
  {
    label: "Operations",
    capabilities: [
      { id: "website.manage", label: "Manage website", description: "Edit public news, events and the calendar." },
      { id: "finance.manage", label: "Manage finance", description: "Fees, invoices and payment verification." },
      { id: "transport.manage", label: "Manage transport", description: "Routes, trips and assignments." },
      { id: "accounts.manage", label: "Manage user accounts", description: "Issue, suspend and reset portal accounts." },
      { id: "platform.readiness", label: "Platform readiness", description: "Integration and infrastructure checks." },
    ],
  },
];

export type CapabilityMatrix = Record<PortalRole, readonly PortalCapability[]>;

// Shipped defaults. The developer portal edits a copy of this.
export const defaultCapabilityMatrix: CapabilityMatrix = {
  student: [],
  parent: [],
  staff: ["students.view", "reportcards.publish", "documents.manage"],
  admin: [
    "students.view",
    "students.export",
    "classes.manage",
    "reportcards.publish",
    "documents.manage",
    "website.manage",
    "finance.manage",
    "transport.manage",
  ],
  registry: [
    "students.view",
    "students.create",
    "students.import",
    "students.promote",
    "students.export",
    "parents.view",
    "parents.create",
    "staff.view",
    "staff.create",
    "classes.manage",
    "documents.manage",
    "admissions.manage",
  ],
  developer: ["accounts.manage", "platform.readiness"],
  accounts: ["finance.manage"],
  transport: ["transport.manage"],
};

export function isPortalCapability(value: string): value is PortalCapability {
  return portalCapabilities.some((capability) => capability === value);
}

/**
 * Serialises the matrix for the override cookie: `role:cap|cap,role:cap`.
 * Compact enough for a cookie and readable in devtools.
 */
export function serializeCapabilityMatrix(matrix: CapabilityMatrix): string {
  return portalRoles
    .map((role) => `${role}:${matrix[role].join("|")}`)
    .join(",");
}

export function parseCapabilityMatrix(value: string | undefined): CapabilityMatrix {
  if (!value) {
    return defaultCapabilityMatrix;
  }

  const parsed: Record<string, PortalCapability[]> = {};

  for (const entry of value.split(",")) {
    const [role, capabilities = ""] = entry.split(":");

    if (!role) {
      continue;
    }

    parsed[role] = capabilities
      .split("|")
      .filter((capability): capability is PortalCapability =>
        isPortalCapability(capability),
      );
  }

  // Any role missing from the cookie keeps its shipped defaults.
  const matrix = { ...defaultCapabilityMatrix };

  for (const role of portalRoles) {
    matrix[role] = parsed[role] ?? defaultCapabilityMatrix[role];
  }

  return matrix;
}
