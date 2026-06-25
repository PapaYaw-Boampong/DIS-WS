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
  readonly classId: string;
  readonly className: string;
  readonly level: string;
  readonly parentIds: readonly string[];
  readonly status: PortalAccountStatus;
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
  readonly status: PortalAccountStatus;
};

export type StaffProfile = {
  readonly id: string;
  readonly userId: string;
  readonly fullName: string;
  readonly staffId: string;
  readonly title: string;
  readonly classIds: readonly string[];
  readonly subjectIds: readonly string[];
  readonly status: PortalAccountStatus;
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

export type FeedingBalance = {
  readonly id: string;
  readonly studentId: string;
  readonly balance: number;
  readonly lastTopUpAt?: string;
  readonly status: "active" | "low_balance" | "empty";
};

export type WalletTransaction = {
  readonly id: string;
  readonly studentId: string;
  readonly wallet: "feeding" | "transport";
  readonly type: "credit" | "debit";
  readonly amount: number;
  readonly description: string;
  readonly reference: string;
  readonly occurredAt: string;
};

export type TransportRoute = {
  readonly id: string;
  readonly routeName: string;
  readonly busName: string;
  readonly vehicleRegistration: string;
  readonly capacity: number;
  readonly driverName?: string;
  readonly driverPhone?: string;
  readonly stops: readonly string[];
  readonly stopCoordinates?: readonly TransportMapPoint[];
};

export type TransportMapPoint = {
  readonly label: string;
  readonly x: number;
  readonly y: number;
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
  readonly direction: "morning" | "afternoon";
  readonly status: TransportTripStatus;
  readonly lastUpdated: string;
  readonly currentLocationLabel?: string;
  readonly currentLocationPoint?: TransportMapPoint;
  readonly nextStop?: string;
};

export type TransportAssignment = {
  readonly id: string;
  readonly studentId: string;
  readonly routeId: string;
  readonly pickupPoint: string;
  readonly dropOffPoint: string;
  readonly estimatedPickupTime: string;
  readonly estimatedDropOffTime: string;
  readonly feeStatus: "unpaid" | "partially_paid" | "paid";
};

export type TransportNotice = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly publishedAt: string;
  readonly routeId?: string;
};

export type PortalAnnouncementAudience =
  | "all"
  | "student"
  | "parent"
  | "staff";

export type PortalAnnouncement = {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly publishedAt: string;
  readonly audience: PortalAnnouncementAudience;
  readonly priority: "normal" | "important";
};

export type PortalEvent = {
  readonly id: string;
  readonly title: string;
  readonly date: string;
  readonly time?: string;
  readonly audience: PortalAnnouncementAudience;
};

export type TimetableEntry = {
  readonly id: string;
  readonly classId: string;
  readonly className: string;
  readonly subject: string;
  readonly teacher: string;
  readonly room: string;
  readonly day: string;
  readonly startTime: string;
  readonly endTime: string;
};

export type AssignmentSummary = {
  readonly id: string;
  readonly classId: string;
  readonly courseId?: string;
  readonly subject: string;
  readonly title: string;
  readonly instructions?: string;
  readonly dueDate: string;
  readonly totalStudents?: number;
  readonly submittedCount?: number;
  readonly status: "not_started" | "in_progress" | "submitted" | "review";
};

export type CourseSummary = {
  readonly id: string;
  readonly classId: string;
  readonly subjectId: string;
  readonly subject: string;
  readonly title: string;
  readonly courseCode: string;
  readonly teacher: string;
  readonly term: string;
  readonly description: string;
  readonly progress: number;
};

export type CourseModuleItem = {
  readonly id: string;
  readonly title: string;
  readonly type: "page" | "assignment" | "material" | "quiz" | "discussion";
  readonly status: "available" | "completed" | "locked";
  readonly dueDate?: string;
};

export type CourseModule = {
  readonly id: string;
  readonly courseId: string;
  readonly title: string;
  readonly description: string;
  readonly status: "published" | "draft";
  readonly position: number;
  readonly items: readonly CourseModuleItem[];
};

export type ResultSummary = {
  readonly id: string;
  readonly studentId: string;
  readonly subject: string;
  readonly assessment: string;
  readonly score: number;
  readonly total: number;
  readonly gradedAt: string;
};

export type AttendanceSummary = {
  readonly id: string;
  readonly studentId: string;
  readonly term: string;
  readonly present: number;
  readonly absent: number;
  readonly late: number;
  readonly percentage: number;
};

export type ClassSummary = {
  readonly id: string;
  readonly name: string;
  readonly level: string;
  readonly studentCount: number;
  readonly classTeacher: string;
};

export type AttendanceMark = "present" | "absent" | "late" | "excused";

export type DailyAttendanceRecord = {
  readonly id: string;
  readonly classId: string;
  readonly studentId: string;
  readonly date: string;
  readonly mark: AttendanceMark;
  readonly note?: string;
};

export type GradebookEntry = {
  readonly id: string;
  readonly classId: string;
  readonly studentId: string;
  readonly subject: string;
  readonly assessment: string;
  readonly score: number;
  readonly total: number;
  readonly status: "draft" | "published";
};

export type LearningResource = {
  readonly id: string;
  readonly classId: string;
  readonly courseId?: string;
  readonly subject: string;
  readonly title: string;
  readonly fileName: string;
  readonly fileType: "pdf" | "document" | "presentation" | "link";
  readonly sharedAt: string;
  readonly status: "published" | "draft";
};

export type DashboardAlert = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly severity: "info" | "warning" | "critical";
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
  readonly children?: readonly PortalNavigationItem[];
};
