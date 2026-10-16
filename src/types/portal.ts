export const portalRoles = [
  "student",
  "parent",
  "staff",
  "admin",
  "registry",
  "developer",
  "accounts",
  "transport",
] as const;

export type PortalRole = (typeof portalRoles)[number];

// The administration portal is split by responsibility: `admin` runs the school
// (classes, fees, website), `registry` owns people records and admissions, and
// `developer` owns accounts and platform readiness. `admin` keeps access to
// every administrative page so a single school administrator account still
// works end to end.
export const portalAdminRoles = ["admin", "registry", "developer"] as const;

export type PortalAdminRole = (typeof portalAdminRoles)[number];

export type PortalAccountStatus = "active" | "inactive" | "suspended";

export type PortalUser = {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: PortalRole;
  readonly status: PortalAccountStatus;
  // Set by an admin password reset; the portal forces a change before use.
  readonly mustChangePassword?: boolean;
};

export type MockPortalSession = {
  readonly user: PortalUser;
  readonly mode: "mock" | "real";
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
  | "admission"
  | "miscellaneous"
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

export type PaymentMethod = "momo" | "bank" | "cash" | "paystack";

// `initiated` is a payment INTENT — an online checkout was opened but nothing
// has been paid. It must never count towards a paid total or produce a receipt.
// `failed`/`abandoned` are provider outcomes for a checkout that did not
// complete; `rejected` remains the school's own decision on a submitted claim.
export type PaymentStatus =
  | "pending"
  | "initiated"
  | "verified"
  | "rejected"
  | "failed"
  | "abandoned";

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
  readonly note?: string;
  readonly bankName?: string;
  readonly depositorName?: string;
  readonly depositDate?: string;
  readonly rejectionReason?: string;
  readonly verifiedAt?: string;
  readonly hasAttachment?: boolean;
  // Set only for provider-confirmed payments. `provider` present means the
  // machine verified it, not a person — which is why these rows are read-only
  // in the accounts console (reversing one is a refund, not a status edit).
  readonly provider?: string | null;
  readonly providerChannel?: string | null;
  readonly providerFee?: number | null;
};

export type FeedingBalance = {
  readonly id: string;
  readonly studentId: string;
  readonly balance: number;
  readonly lastTopUpAt?: string;
  readonly status: "active" | "low_balance" | "empty";
};

export type TransportWalletBalance = {
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
  // Set only while the driver is sharing position from their phone. Absent
  // means nobody is sharing, so only the route schedule is known.
  readonly latitude?: number | null;
  readonly longitude?: number | null;
  readonly speedKph?: number | null;
  // Reported accuracy radius in metres — a rough fix must not be shown as an
  // exact spot on the road.
  readonly accuracyM?: number | null;
  readonly positionAt?: string | null;
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

export type PortalEventCategory =
  | "academic"
  | "community"
  | "sports"
  | "meeting";

export type PortalEventProgrammeItem = {
  readonly time: string;
  readonly item: string;
};

export type PortalEvent = {
  readonly id: string;
  readonly title: string;
  readonly date: string;
  readonly time?: string;
  readonly audience: PortalAnnouncementAudience;
  // Optional programme detail: present for school-authored events, absent for
  // simple calendar entries.
  readonly endTime?: string;
  readonly category?: PortalEventCategory;
  readonly location?: string;
  readonly summary?: string;
  readonly details?: readonly string[];
  readonly programme?: readonly PortalEventProgrammeItem[];
  readonly contact?: string;
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

export type ReportCardSubject = {
  readonly subject: string;
  // Ghanaian primary reporting: continuous assessment out of 50, end-of-term
  // examination out of 50, totalled to 100.
  readonly classScore: number;
  readonly examScore: number;
  readonly total: number;
  readonly grade: string;
  readonly position?: number;
  readonly remark: string;
};

export type ReportCard = {
  readonly id: string;
  readonly studentId: string;
  readonly academicYear: string;
  readonly term: string;
  readonly className: string;
  readonly status: "draft" | "published";
  readonly publishedAt?: string;
  readonly overallTotal: number;
  readonly overallPercentage: number;
  readonly positionInClass?: number;
  readonly classSize?: number;
  readonly attendancePresent: number;
  readonly attendanceTotal: number;
  readonly subjects: readonly ReportCardSubject[];
  readonly classTeacher: string;
  readonly classTeacherRemark: string;
  readonly headTeacherRemark: string;
  readonly nextTermBegins?: string;
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
  readonly objectKey?: string | null;
};

export type AssignmentSubmission = {
  readonly id: string;
  readonly assignmentId: string;
  readonly studentId: string;
  readonly fileName: string;
  readonly mimeType: string;
  readonly submittedAt: string;
  readonly status: string;
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
  | "bell"
  | "bus"
  | "settings"
  | "file"
  | "school"
  | "globe";

export type PortalNavigationItem = {
  readonly label: string;
  readonly icon: PortalNavigationIcon;
  readonly href?: string;
  readonly phase: number;
  // When set, the item only appears for roles holding this capability.
  readonly capability?: string;
  readonly children?: readonly PortalNavigationItem[];
};

export type PortalDocument = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly category: string;
  readonly audience: string;
  readonly studentId?: string | null;
  readonly fileName?: string | null;
  readonly url?: string | null;
  readonly downloadable: boolean;
  readonly publishedAt: string;
};

export type PortalNotification = {
  readonly id: string;
  readonly title: string;
  readonly body: string;
  readonly audience: string;
  readonly priority: string;
  readonly read: boolean;
  readonly createdAt: string;
};

export type PortalMessageAuthor = {
  readonly id: string;
  readonly name: string;
  readonly role: string;
};

export type StatementMethod = "momo" | "bank";

export type StatementTransaction = {
  readonly id: string;
  readonly importId: string;
  readonly amount: number;
  readonly date: string;
  readonly reference?: string | null;
  readonly counterpartyName?: string | null;
  readonly raw: Record<string, string>;
  readonly matchedPaymentId?: string | null;
  readonly matchType?: "reference" | "amount_date_name" | "manual" | null;
  readonly matchConfidence?: number | null;
  readonly createdAt: string;
};

export type StatementImport = {
  readonly id: string;
  readonly method: StatementMethod;
  readonly fileName: string;
  readonly importedById: string;
  readonly importedAt: string;
  readonly rowCount: number;
  readonly matchedCount: number;
  readonly transactions?: readonly StatementTransaction[];
};

export type PortalMessage = {
  readonly id: string;
  readonly author: PortalMessageAuthor;
  readonly body: string;
  readonly sentAt: string;
  readonly fromMe?: boolean;
};

export type PortalConversation = {
  readonly id: string;
  readonly subject: string;
  readonly counterpart: string;
  readonly audience: string;
  readonly preview: string;
  readonly unread: boolean;
  readonly updatedAt: string;
  readonly messages: readonly PortalMessage[];
};
