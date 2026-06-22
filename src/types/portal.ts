export const portalRoles = [
  "student",
  "parent",
  "staff",
  "admin",
  "accounts",
  "transport",
] as const;

export type PortalRole = (typeof portalRoles)[number];

export type PortalAccountStatus = "active" | "inactive" | "suspended";

export type PortalUser = {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: PortalRole;
  readonly status: PortalAccountStatus;
};

export type MockPortalSession = {
  readonly user: PortalUser;
  readonly mode: "mock";
};

export type StudentProfile = {
  readonly id: string;
  readonly userId?: string;
  readonly fullName: string;
  readonly studentId: string;
  readonly className: string;
  readonly level: string;
  readonly parentIds: readonly string[];
  readonly transportRouteId?: string;
  readonly feedingPlan?: "none" | "daily" | "weekly" | "termly";
};

export type ParentProfile = {
  readonly id: string;
  readonly userId: string;
  readonly fullName: string;
  readonly phone: string;
  readonly email: string;
  readonly childIds: readonly string[];
};

export type StaffProfile = {
  readonly id: string;
  readonly userId: string;
  readonly fullName: string;
  readonly staffId: string;
  readonly title: string;
  readonly classIds: readonly string[];
  readonly subjectIds: readonly string[];
};

export type FeeCategory =
  | "school_fees"
  | "feeding"
  | "transport"
  | "uniform"
  | "books"
  | "exam"
  | "other";

export type FeeItem = {
  readonly id: string;
  readonly title: string;
  readonly category: FeeCategory;
  readonly amount: number;
  readonly term: string;
  readonly academicYear: string;
  readonly dueDate?: string;
};

export type InvoiceStatus =
  | "unpaid"
  | "partially_paid"
  | "paid"
  | "overpaid";

export type Invoice = {
  readonly id: string;
  readonly studentId: string;
  readonly feeItemIds: readonly string[];
  readonly totalAmount: number;
  readonly amountPaid: number;
  readonly balance: number;
  readonly status: InvoiceStatus;
  readonly dueDate?: string;
};

export type PaymentMethod =
  | "momo"
  | "card"
  | "bank_transfer"
  | "cash"
  | "manual";

export type PaymentStatus = "pending" | "successful" | "failed" | "refunded";

export type Payment = {
  readonly id: string;
  readonly parentId?: string;
  readonly studentId: string;
  readonly invoiceId?: string;
  readonly category: FeeCategory;
  readonly amount: number;
  readonly method: PaymentMethod;
  readonly status: PaymentStatus;
  readonly reference: string;
  readonly paidAt: string;
};

export type TransportRoute = {
  readonly id: string;
  readonly routeName: string;
  readonly busName: string;
  readonly driverName?: string;
  readonly driverPhone?: string;
  readonly stops: readonly string[];
};

export type TransportTripStatus =
  | "not_started"
  | "on_route"
  | "picked_up"
  | "arrived"
  | "departed"
  | "dropped_off"
  | "delayed"
  | "cancelled";

export type TransportTrip = {
  readonly id: string;
  readonly routeId: string;
  readonly date: string;
  readonly status: TransportTripStatus;
  readonly lastUpdated: string;
  readonly currentLocationLabel?: string;
  readonly nextStop?: string;
};

export type PortalNavigationIcon =
  | "dashboard"
  | "user"
  | "calendar"
  | "book"
  | "clipboard"
  | "chart"
  | "users"
  | "wallet"
  | "message"
  | "bus"
  | "settings"
  | "file"
  | "school";

export type PortalNavigationItem = {
  readonly label: string;
  readonly icon: PortalNavigationIcon;
  readonly href?: string;
  readonly phase: number;
};
