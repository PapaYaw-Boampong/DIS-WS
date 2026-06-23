# Divine International School Portals – Implementation Plan

## 1. Purpose of This Portal Cycle

This document starts the next development cycle for the **Divine International School digital ecosystem**: the private portals for students, parents, staff, and eventually administrators.

The public website is mostly complete and serves as the school’s public-facing identity, admissions, academic information, and communication platform. The portal system is the private operational layer where authenticated users can access school services, academic records, payments, communication, transport information, and day-to-day school activities.

The portal system should be built gradually and non-invasively. It should support existing school workflows first, then expand into deeper automation.

Current product decisions for the next portal cycle:

- The portal must not allow public self sign-up. Student, parent, staff, accounts, transport, and admin accounts are created or approved by school administrators.
- Dashboard quick-action blocks should be removed. Primary navigation should live in the sidebar and in the relevant page/workspace.
- Student upcoming-assignment widgets should be replaced by a dedicated To Do page.
- Learning materials should move into course pages instead of a standalone Resources area.
- Canvas LMS by Instructure is the main UX reference for course areas: course home, course navigation, modules, assignments, To Do/sidebar context, and teacher/student course workflows. The DIS portal should use these ideas without copying Canvas branding or connecting to Canvas.

---

## 2. Portal Vision

The portal system should provide role-based access for:

- Students
- Parents / guardians
- Staff / teachers
- Administrators / school management
- Accounts / finance officers
- Transport officers, if needed

The first major goal is to build a strong portal foundation with usable dashboards, role-based navigation, mock or seed data, and clear structures for future backend integration.

The second goal is to include practical school operations from the beginning, especially:

- school fees
- bus fees
- feeding payments
- advance payments
- fee balances
- payment history
- transport tracking
- account/finance management

---

## 3. Recommended Tech Direction

Use the existing frontend stack if the public website is already built with Next.js.

Recommended stack:

- Next.js
- TypeScript
- Tailwind CSS
- App Router
- React components
- Role-based layouts
- Mock data first, then backend integration
- PostgreSQL later for persistent data
- Prisma or Drizzle ORM later if backend/database is introduced
- Paystack, Hubtel, Flutterwave, or mobile money integration later for live payments

If the current website already uses Next.js, add the portal under the same project using protected route groups.

---

## 4. Recommended Route Structure

Use `/portal` as the private system namespace.

```txt
/portal
/portal/login
/portal/student
/portal/parent
/portal/staff
/portal/admin
/portal/accounts
```

Recommended deeper routes:

```txt
/portal/student/dashboard
/portal/student/profile
/portal/student/timetable
/portal/student/courses
/portal/student/todo
/portal/student/results
/portal/student/attendance
/portal/student/announcements

/portal/parent/dashboard
/portal/parent/children
/portal/parent/fees
/portal/parent/payments
/portal/parent/feeding
/portal/parent/transport
/portal/parent/results
/portal/parent/attendance
/portal/parent/messages
/portal/parent/announcements

/portal/staff/dashboard
/portal/staff/classes
/portal/staff/attendance
/portal/staff/assignments
/portal/staff/gradebook
/portal/staff/courses
/portal/staff/messages
/portal/staff/timetable

/portal/admin/dashboard
/portal/admin/students
/portal/admin/parents
/portal/admin/staff
/portal/admin/classes
/portal/admin/subjects
/portal/admin/fees
/portal/admin/transport
/portal/admin/announcements
/portal/admin/calendar

/portal/accounts/dashboard
/portal/accounts/invoices
/portal/accounts/payments
/portal/accounts/balances
/portal/accounts/feeding
/portal/accounts/transport-fees
/portal/accounts/reports
```

---

## 5. Role-Based Portal Overview

## 5.1 Student Portal

The student portal should help students access their academic life in one place.

### Core Student Capabilities

- Dashboard
- Student profile
- Class and grade information
- Subjects
- Timetable
- Courses
- To Do
- Homework
- Results and report cards
- Attendance summary
- Announcements
- Events calendar
- Course modules and materials
- Downloads
- Notices

### Student Dashboard Widgets

- Welcome message
- Today’s timetable
- To Do summary
- Recent results
- Attendance status
- School announcements
- Upcoming events

### Student Actions

- View To Do tasks
- Open course pages
- View homework
- View grades
- Download or view course materials when storage is connected later
- Check timetable
- Read announcements
- View academic calendar
- View attendance summary
- View report cards

### Later Student Features

- Assignment upload
- Course module completion
- Online quizzes
- Teacher feedback
- Progress charts
- Behaviour/discipline record
- Library borrowing record
- Digital student ID
- Certificate/download area

---

## 5.2 Parent Portal

The parent portal should help parents monitor their child’s progress, pay school-related fees, access receipts, and communicate with the school.

### Core Parent Capabilities

- Dashboard
- Parent profile
- Child/children profile
- Academic progress
- Results/report cards
- Attendance
- School fees
- Bus fees
- Feeding fees
- Advance payments
- Payment history
- Fee balances
- Receipts
- Transport tracking
- Announcements
- Events calendar
- Teacher messages
- School notices
- Downloads

### Parent Dashboard Widgets

- Child/children overview
- Attendance summary
- Recent results
- Outstanding school fees
- Feeding balance
- Bus fee status
- Transport tracking preview
- Recent payments
- Upcoming events
- Important announcements
- Teacher messages

### Parent Payment Capabilities

Parents should be able to pay for:

- school fees
- bus/transport fees
- feeding fees
- other approved school charges

Parents should also be able to:

- pay fees in full
- make partial payments, if the school allows it
- pay in advance for feeding
- pay in advance for bus/transport
- view current balance
- view payment history
- download receipts
- view invoices/bills
- see due dates
- see child-specific fee breakdown

### Parent Transport Capabilities

Transport tracking should be included as a current feature, even if the first version uses simulated or manually updated transport data.

Parents should be able to see:

- assigned bus
- bus route
- driver name/contact, if approved
- pickup point
- drop-off point
- estimated pickup time
- estimated drop-off time
- current trip status
- transport fee status
- transport announcements

Possible statuses:

```txt
Not Started
On Route
Picked Up
Arrived at School
Departed School
Dropped Off
Delayed
Cancelled
```

### Later Parent Features

- Online fee payment integration
- Mobile money payment
- Card payment
- Multiple children under one parent account
- Parent-teacher meeting booking
- Permission slip approvals
- Absence excuse submission
- Real-time GPS bus tracking
- SMS/WhatsApp notifications

---

## 5.3 Staff / Teacher Portal

The staff portal should help teachers and staff manage class-related tasks and communicate with students/parents.

### Core Staff Capabilities

- Dashboard
- Teacher/staff profile
- Assigned classes
- Assigned subjects
- Class list
- Attendance marking
- Assignments
- Homework posting
- Grades/marks entry
- Announcements
- Timetable
- Courses
- Course modules and materials
- Student records
- Parent communication

### Staff Dashboard Widgets

- Today’s classes
- Assigned classes
- Pending attendance
- Assignments to review
- Recent notices
- Upcoming events

### Staff Actions

- Mark attendance
- View class lists
- Create assignments
- Add course materials
- Manage course modules
- Enter assessment marks
- View student profiles
- Send notices to class/parents
- View timetable
- Download reports

### Later Staff Features

- Gradebook
- Behaviour tracking
- Lesson planning
- Assignment collection/review
- Bulk mark upload
- Class report generation
- Internal staff notices
- Leave requests
- Payroll view, if needed later

---

## 5.4 Admin Portal

The admin portal controls the school data that appears in the student, parent, staff, and accounts portals.

### Core Admin Capabilities

- Dashboard
- Student management
- Parent management
- Staff management
- Class management
- Subject management
- Academic year and term setup
- Admissions management
- Fees management
- Feeding management
- Transport management
- Attendance oversight
- Results/report cards
- News and announcements
- Events/calendar
- Documents
- Course setup oversight later
- Website content management later
- User roles and permissions

### Admin Dashboard Widgets

- Total students
- Total parents
- Total staff
- Attendance overview
- Fees overview
- Feeding payments overview
- Bus payments overview
- Recent admissions
- Recent announcements
- Upcoming events
- System alerts

### Admin Actions

- Create student accounts
- Create parent accounts
- Create staff accounts
- Assign students to classes
- Link parents to children
- Assign teachers to classes/subjects
- Create fee items
- Assign fees to students/classes
- Publish announcements
- Upload documents
- Manage academic calendar
- Approve content
- Generate reports

---

## 5.5 Accounts / Finance Portal

An accounts role should exist to manage payments and financial records without giving finance users full academic/admin control.

### Accounts Role Purpose

The accounts role manages school payments and financial records related to:

- school fees
- feeding fees
- bus/transport fees
- invoices
- receipts
- balances
- payment reconciliation
- financial reports

### Accounts Dashboard Widgets

- Total expected fees
- Total received payments
- Outstanding balances
- Today’s payments
- School fees summary
- Feeding fees summary
- Bus fees summary
- Recent transactions
- Pending confirmations

### Accounts Capabilities

- View all invoices
- Create fee items
- Assign fees to students/classes
- Record manual payments
- Confirm online payments
- View transaction history
- Generate receipts
- View outstanding balances
- Filter payments by class, student, term, category, or date
- Export payment reports
- Manage feeding balances
- Manage bus fee balances
- Reconcile payment provider transactions

### Payment Categories

```txt
School Fees
Feeding Fees
Bus / Transport Fees
Uniform Fees
Books / Learning Materials
Examination Fees
Other Charges
```

### Payment Statuses

```txt
Unpaid
Partially Paid
Paid
Overpaid
Pending Confirmation
Failed
Refunded
```

---

## 6. Payment System Requirements

The portal should support online fee payments for:

- school fees
- bus fees
- feeding fees
- other approved school charges

### Parent Payment Flow

```txt
Parent logs in
Parent selects child
Parent opens Fees/Payments
Parent sees outstanding balances and optional advance-payment items
Parent selects payment category
Parent enters amount or selects invoice
Parent chooses payment method
Parent confirms payment
System records transaction
Receipt becomes available
Accounts team can verify/reconcile payment
```

### Advance Payment Flow

Advance payments are especially important for feeding and transport.

Parents should be able to:

- pay ahead for feeding
- pay ahead for bus service
- keep a balance/credit wallet per child
- see deductions or usage records later
- see remaining balance

Recommended balance model:

```txt
Parent Account
  -> Child Account
      -> School Fees Balance
      -> Feeding Wallet / Balance
      -> Transport Wallet / Balance
```

### Fee Display for Parents

Each parent should see:

- total amount due
- amount paid
- outstanding balance
- due date
- payment category
- child name
- academic term/session
- receipt/payment reference
- payment status

### Payment Methods

For Ghana, plan for:

- Mobile Money
- Card payment
- Bank transfer/manual confirmation
- Cash/manual entry by accounts office

Possible payment providers later:

- Paystack
- Hubtel
- Flutterwave

Do not hardcode a live payment provider in the first UI cycle unless backend/payment integration is ready.

---

## 7. Transport Tracking Requirements

Transport tracking should be treated as a current feature in the portal concept.

### Parent Transport View

Parents should see:

- child name
- assigned bus
- route name
- pickup point
- drop-off point
- pickup time
- drop-off time
- current bus/trip status
- driver/assistant contact, if approved
- transport fee balance
- transport announcements

### Staff/Admin Transport View

Admins or transport officers should manage:

- buses
- routes
- drivers
- route stops
- students assigned to route
- trip status
- transport announcements
- bus fee assignment

### Transport MVP

The first version can use manually updated statuses.

Example:

```txt
Bus A - East Legon Route
Status: On Route
Last Updated: 7:15 AM
Next Stop: Lakeside Junction
```

Later, real GPS tracking can be added.

---

## 8. Authentication and Access Control

The portal must use role-based access.

### Roles

```txt
student
parent
staff
admin
accounts
transport
```

### Required Authentication Features

- Login
- Logout
- Forgot password
- No public sign-up or self-registration
- Admin-issued or admin-approved accounts
- Protected routes
- Role-based redirect
- Role-based sidebar navigation
- Session handling
- Account status: active/inactive/suspended

### Account Creation Rule

The production portal must not expose a public "create account" or "sign up"
flow. Accounts are created, approved, linked, activated, suspended, and reset by
authorized school administrators. Parents, students, staff, accounts users, and
transport users receive credentials only after the school approves the record.

### Role Redirects

```txt
student -> /portal/student/dashboard
parent -> /portal/parent/dashboard
staff -> /portal/staff/dashboard
admin -> /portal/admin/dashboard
accounts -> /portal/accounts/dashboard
transport -> /portal/admin/transport or /portal/transport/dashboard
```

### Access Rules

Students should only access their own records.

Parents should only access children linked to them.

Staff should only access assigned classes/subjects unless granted broader permissions.

Accounts users should access financial records but not full academic control unless allowed.

Admins should have broad system access.

---

## 9. Shared Portal UI Layout

All portals should use a dashboard layout.

```txt
Sidebar
Topbar
Main content area
Dashboard cards
Tables
Notices panel
Profile/account menu
```

### Shared Components

```txt
PortalLayout
PortalSidebar
PortalTopbar
DashboardCard
MetricCard
NoticeCard
DataTable
ProfileSummary
CalendarPreview
StatusBadge
EmptyState
PaymentSummaryCard
InvoiceCard
ReceiptCard
TransportStatusCard
ChildSwitcher
RoleGuard
```

---

## 10. Suggested Folder Structure

```txt
src/
  app/
    portal/
      login/
        page.tsx
      student/
        dashboard/
          page.tsx
        profile/
          page.tsx
        timetable/
          page.tsx
        courses/
          page.tsx
        todo/
          page.tsx
        results/
          page.tsx
        attendance/
          page.tsx
      parent/
        dashboard/
          page.tsx
        children/
          page.tsx
        fees/
          page.tsx
        payments/
          page.tsx
        feeding/
          page.tsx
        transport/
          page.tsx
        results/
          page.tsx
        attendance/
          page.tsx
        messages/
          page.tsx
      staff/
        dashboard/
          page.tsx
        classes/
          page.tsx
        attendance/
          page.tsx
        assignments/
          page.tsx
        gradebook/
          page.tsx
        courses/
          page.tsx
      admin/
        dashboard/
          page.tsx
        students/
          page.tsx
        parents/
          page.tsx
        staff/
          page.tsx
        classes/
          page.tsx
        fees/
          page.tsx
        transport/
          page.tsx
        announcements/
          page.tsx
      accounts/
        dashboard/
          page.tsx
        invoices/
          page.tsx
        payments/
          page.tsx
        balances/
          page.tsx
        reports/
          page.tsx

  components/
    portal/
      PortalLayout.tsx
      PortalSidebar.tsx
      PortalTopbar.tsx
      PortalCard.tsx
      MetricCard.tsx
      DataTable.tsx
      StatusBadge.tsx
      ChildSwitcher.tsx
      PaymentSummaryCard.tsx
      TransportStatusCard.tsx
      RoleGuard.tsx

  data/
    portal/
      auth.ts
      students.ts
      parents.ts
      staff.ts
      fees.ts
      payments.ts
      transport.ts
      announcements.ts
      timetable.ts
      results.ts

  lib/
    portal/
      roles.ts
      permissions.ts
      routes.ts
      mock-session.ts
```

---

## 11. Key Data Models for Planning

These models can start as TypeScript interfaces and mock data. Later, they can become database tables.

### User

```ts
type UserRole = "student" | "parent" | "staff" | "admin" | "accounts" | "transport";

type User = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: UserRole;
  status: "active" | "inactive" | "suspended";
};
```

### Student

```ts
type Student = {
  id: string;
  userId?: string;
  fullName: string;
  studentId: string;
  className: string;
  level: string;
  parentIds: string[];
  transportRouteId?: string;
  feedingPlan?: "none" | "daily" | "weekly" | "termly";
};
```

### Parent

```ts
type Parent = {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  email?: string;
  childIds: string[];
};
```

### Fee Item

```ts
type FeeCategory = "school_fees" | "feeding" | "transport" | "uniform" | "books" | "exam" | "other";

type FeeItem = {
  id: string;
  title: string;
  category: FeeCategory;
  amount: number;
  term: string;
  academicYear: string;
  dueDate?: string;
};
```

### Invoice

```ts
type Invoice = {
  id: string;
  studentId: string;
  feeItemIds: string[];
  totalAmount: number;
  amountPaid: number;
  balance: number;
  status: "unpaid" | "partially_paid" | "paid" | "overpaid";
  dueDate?: string;
};
```

### Payment

```ts
type Payment = {
  id: string;
  parentId?: string;
  studentId: string;
  invoiceId?: string;
  category: FeeCategory;
  amount: number;
  method: "momo" | "card" | "bank_transfer" | "cash" | "manual";
  status: "pending" | "successful" | "failed" | "refunded";
  reference: string;
  paidAt: string;
};
```

### Feeding Balance

```ts
type FeedingBalance = {
  id: string;
  studentId: string;
  balance: number;
  lastTopUpAt?: string;
  status: "active" | "low_balance" | "empty";
};
```

### Transport Route

```ts
type TransportRoute = {
  id: string;
  routeName: string;
  busName: string;
  driverName?: string;
  driverPhone?: string;
  stops: string[];
};
```

### Transport Trip

```ts
type TransportTrip = {
  id: string;
  routeId: string;
  date: string;
  status: "not_started" | "on_route" | "picked_up" | "arrived" | "departed" | "dropped_off" | "delayed" | "cancelled";
  lastUpdated: string;
  currentLocationLabel?: string;
  nextStop?: string;
};
```

### Course

Course pages should become the main academic workspace instead of a standalone
resources area. The first mock version can model the Canvas-like concepts of a
course home, course navigation, modules, assignments, materials, and progress.

```ts
type CourseSummary = {
  id: string;
  classId: string;
  subjectId: string;
  subject: string;
  title: string;
  courseCode: string;
  teacher: string;
  term: string;
  description: string;
  progress: number;
};

type CourseModule = {
  id: string;
  courseId: string;
  title: string;
  description: string;
  status: "published" | "draft";
  items: {
    id: string;
    title: string;
    type: "page" | "assignment" | "material" | "quiz" | "discussion";
    status: "available" | "completed" | "locked";
    dueDate?: string;
  }[];
};
```

---

## 12. MVP Scope for This Cycle

Build the portal system in phases.

### Phase 1: Portal Foundation

Build:

- Portal login page UI
- Mock authentication/session
- Role-based redirect logic
- Shared portal layout
- Sidebar
- Topbar
- Role-based navigation
- Dashboard card components
- Status badges
- Mock data files

Do not connect real payments or real authentication yet unless backend is ready.

### Phase 2: Role Dashboards

Build:

- Student dashboard
- Parent dashboard
- Staff dashboard
- Admin dashboard shell
- Accounts dashboard shell

Use mock data.

### Phase 3: Parent Payments and Fees UI

Build:

- Parent fees page
- Parent payments page
- Fee summary cards
- Invoice list
- Payment history table
- Feeding balance page
- Bus/transport fee section
- Advance payment UI
- Receipt view/download placeholder

### Phase 4: Transport Tracking UI

Build:

- Parent transport tracking page
- Assigned bus/route card
- Current trip status
- Pickup/drop-off details
- Transport fee status
- Admin transport overview page
- Manual trip status update UI placeholder

### Phase 5: Staff Operations UI

Build:

- Class list page
- Attendance marking UI
- Assignments page
- Gradebook page
- Course material upload UI placeholder

### Phase 6: Admin and Accounts Control

Build:

- Student management UI
- Parent management UI
- Staff management UI
- Fee item setup UI
- Invoice management UI
- Payment management UI
- Reports overview

### Phase 7: Course Workspace and To Do Alignment

Build:

- Student To Do page to replace the old dashboard upcoming-assignment block
- Student courses page with course cards, course home preview, course navigation, modules, assignments, course materials, and preview boundaries
- Staff courses page with course cards, module/assignment/material views, assigned class context, and browser-only course action previews
- Resources route compatibility redirect to Courses, with no Resources item in the sidebar
- Remove dashboard quick-action sections and the QuickActionCard component
- Confirm in login/public portal copy and the plan that there is no public self sign-up; admins create or approve accounts

Use mock data only. Do not connect Canvas, do not copy Canvas branding, and do
not add backend, file storage, notifications, real submissions, or production
credentials in this phase.

### Phase 8: Backend API Contract and Readiness

Build:

- `PORTAL_BACKEND_API_CONTRACT.md` as the working contract for the future Render
  backend API
- Typed frontend contract definitions for API envelopes, endpoint specs,
  backend services, data ownership, errors, pagination, and readiness checks
- Mock-safe admin Backend Readiness page that shows planned services, endpoints,
  data stores, audit boundaries, and remaining backend decisions
- Admin navigation link to the Backend Readiness page
- Clear implementation order for authentication, PostgreSQL, audit logs,
  identity/admin account management, read endpoints, write endpoints, payments,
  storage, notifications, and optional LMS integration

Do not create a real backend service in this phase. Do not connect a database,
payment provider, file storage provider, notification provider, or Canvas/LMS
provider. Do not add secrets or live school data to the frontend.

### Phase 9: Database Schema Readiness

Build:

- `PORTAL_DATABASE_SCHEMA_PLAN.md` as the working PostgreSQL schema design plan
  for the future Render backend
- Typed schema planning structures for database domains, table specs,
  relationships, indexes, migration groups, audit levels, sensitivity levels,
  and retention rules
- Mock-safe admin Database Readiness page showing planned tables,
  relationships, indexes, migration order, retention rules, and implementation
  boundaries
- Admin navigation link to the Database Readiness page
- A migration order that starts with identity and audit logs before people,
  academics, courses, finance, transport, files, and notifications

Do not add Prisma, Drizzle, migration files, a PostgreSQL client, database
credentials, seed data, or any live backend integration in this phase.

### Phase 10: Authentication and Authorization Readiness

Build:

- `PORTAL_AUTHORIZATION_PLAN.md` as the production auth and authorization policy
  draft
- Typed auth planning structures for role permissions, route access policies,
  account lifecycle, session controls, password reset rules, and readiness
  checks
- Mock-safe admin Auth Readiness page showing role scopes, route ownership
  rules, account lifecycle, session rules, password reset boundaries, and
  remaining production auth decisions
- Admin navigation link to the Auth Readiness page
- Clear production rule that the future backend owns credential verification,
  role authorization, record ownership, session expiry/revocation, password
  reset tokens, and auth audit logs

Do not add a real authentication provider, password hashing, reset-token
generation, session signing, MFA provider, credential storage, secrets, live
users, or backend calls in this phase.

---

## 13. First Codex Prompt for Portal Cycle

Use this in Codex Plan mode first:

```txt
You are helping me begin the next development cycle for the Divine International School digital ecosystem: the private portals.

Read PORTAL_IMPLEMENTATION_PLAN.md in the project root.

The public website is mostly done. Now we are building the portal layer for students, parents, staff, admin, and accounts.

Important requirements:
- Use the existing Next.js + TypeScript + Tailwind project if present.
- Build the portal under /portal routes.
- Use role-based layouts and navigation.
- Do not build everything at once.
- Start with a mock-data MVP before real backend integration.
- Include online payment planning for school fees, feeding fees, and bus/transport fees.
- Include advance payments for feeding and bus/transport.
- Include parent access to fee details, balances, payment history, and receipts.
- Include transport tracking as a current feature, even if the first version uses mock/manual data.
- Include an accounts/finance role for managing invoices, payments, balances, and reports.

Before editing files:
1. Inspect the current repo structure.
2. Confirm the existing frontend stack.
3. Propose the portal folder structure.
4. Propose the implementation phases.
5. Identify the first safe coding task.
6. Wait for my approval before making changes.
```

---

## 14. First Build Prompt After Approval

Use this after Codex has planned and you approve:

```txt
Proceed with Phase 1 only: Portal Foundation.

Implement:
- /portal/login page UI
- shared PortalLayout
- PortalSidebar
- PortalTopbar
- role-based mock session
- role-based navigation config
- dashboard shell components
- MetricCard
- StatusBadge
- DataTable placeholder component
- mock data structure for users, students, parents, staff, fees, payments, and transport

Do not build all portal pages yet.
Do not integrate real payment providers yet.
Do not connect a real backend yet.
Use clean TypeScript types and reusable components.
Keep the UI consistent with the Divine International School design system: white/soft cream backgrounds, curry-orange accents, charcoal text, rounded cards, subtle shadows, and clear dashboard layouts.
Run lint/type checks if available and summarize what changed.
```

---

## 15. Definition of Done for Portal MVP

The portal MVP is ready when:

- Login UI exists
- Role-based mock redirect works
- Student dashboard exists
- Student To Do page exists
- Student and staff Courses pages exist
- Backend API contract document exists
- Admin Backend Readiness page exists
- Database schema plan document exists
- Admin Database Readiness page exists
- Auth and authorization plan document exists
- Admin Auth Readiness page exists
- Parent dashboard exists
- Staff dashboard exists
- Admin dashboard shell exists
- Accounts dashboard shell exists
- Parent fees page exists
- Parent payment history page exists
- Feeding balance UI exists
- Transport tracking page exists
- Shared portal layout is reusable
- Sidebar changes based on role
- Mock data is organized clearly
- UI is responsive
- No major TypeScript errors
- No broken internal portal links
- No public self sign-up flow exists
- Dashboard quick-action blocks are removed

---

## 16. Important Implementation Principle

Do not begin with real payment integration.

Begin with the portal structure, UI, mock data, and payment flow screens. Once the workflows are clear, integrate a real payment provider such as Paystack, Hubtel, or Flutterwave.

The correct order is:

```txt
Portal shell
Role dashboards
Fees/payment UI
Transport tracking UI
Admin/accounts management UI
Course workspace and To Do UI
API contract and backend readiness
Database schema readiness
Authentication and authorization readiness
Backend/database
Payment provider integration
Live reconciliation/reporting
```

This prevents the project from becoming too complex too early.
