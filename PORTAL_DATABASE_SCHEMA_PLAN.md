# Divine International School Portal Database Schema Plan

Status: Phase 9 schema design draft
Target database: PostgreSQL, owned by the future Render backend
Frontend status: mock data only

## 1. Boundary

This document defines the planned database structure for the future portal
backend. It does not create a database, does not add migrations, does not add
Prisma or Drizzle, and does not connect the Next.js frontend to PostgreSQL.

The frontend must continue using fictional mock data until the backend service,
authentication, authorization, audit logging, and database migrations are built
and verified separately.

## 2. Core Rules

- No public self sign-up.
- All portal accounts are administrator-issued or administrator-approved.
- Parent access is based only on approved parent-child links.
- Staff access is based on class/subject assignments unless an admin grants
  broader permissions.
- Financial writes are immutable-audited.
- Attendance and grade writes are immutable-audited.
- Payment provider references must be unique and idempotent.
- File binaries belong in private object storage, not PostgreSQL.
- Canvas remains an inspiration for course structure only unless a future LMS
  integration is explicitly approved.

## 3. Schema Domains

```txt
identity
  users
  user_sessions
  students
  parents
  parent_student_links
  staff_profiles

academics
  classes
  subjects
  staff_class_assignments
  attendance_records
  gradebook_entries

courses
  courses
  course_modules
  course_module_items
  assignments
  assignment_submissions

finance
  fee_items
  invoices
  invoice_items
  payments
  wallet_transactions

transport
  transport_routes
  transport_assignments
  transport_trips

files
  file_assets

notifications
  notification_events

audit
  audit_logs
```

## 4. Identity Tables

### users

Stores administrator-issued portal accounts.

Recommended fields:

- `id`
- `name`
- `email`
- `phone`
- `role`
- `status`
- `password_hash` or external-auth subject reference
- `last_login_at`
- `created_by`
- `created_at`
- `updated_at`

Constraints:

- unique `email` when present
- no anonymous registration rows
- deny login when status is `inactive` or `suspended`

### user_sessions

Stores production session metadata.

Recommended fields:

- `id`
- `user_id`
- `session_hash`
- `expires_at`
- `revoked_at`
- `ip_address`
- `user_agent`
- `created_at`

### students

Stores student records and class assignment.

Recommended fields:

- `id`
- `user_id`
- `student_number`
- `full_name`
- `class_id`
- `level`
- `status`
- `feeding_plan`
- `created_at`
- `updated_at`

### parents

Stores parent/guardian records.

Recommended fields:

- `id`
- `user_id`
- `full_name`
- `phone`
- `email`
- `status`
- `created_at`
- `updated_at`

### parent_student_links

Controls parent access to children.

Recommended fields:

- `id`
- `parent_id`
- `student_id`
- `relationship`
- `status`
- `created_by`
- `created_at`

Constraints:

- unique `(parent_id, student_id)`
- every parent portal child query must pass through this table

### staff_profiles

Stores teacher and staff records.

Recommended fields:

- `id`
- `user_id`
- `staff_number`
- `full_name`
- `title`
- `status`
- `created_at`
- `updated_at`

## 5. Academic Tables

### classes

Stores class shells.

Recommended fields:

- `id`
- `name`
- `level`
- `academic_year`
- `class_teacher_id`
- `status`

### subjects

Stores subjects used by courses, timetable, gradebook, and assignments.

Recommended fields:

- `id`
- `code`
- `name`
- `level`
- `status`

### staff_class_assignments

Controls staff access to classes and subjects.

Recommended fields:

- `id`
- `staff_id`
- `class_id`
- `subject_id`
- `assignment_role`
- `status`

Constraints:

- unique `(staff_id, class_id, subject_id)`

### attendance_records

Stores daily attendance.

Recommended fields:

- `id`
- `class_id`
- `student_id`
- `date`
- `mark`
- `note`
- `submitted_by`
- `submitted_at`

Constraints:

- unique `(class_id, student_id, date)`

### gradebook_entries

Stores assessment marks.

Recommended fields:

- `id`
- `class_id`
- `student_id`
- `subject_id`
- `assessment`
- `score`
- `total`
- `status`
- `entered_by`
- `published_at`
- `created_at`

## 6. Course Tables

### courses

Stores Canvas-inspired DIS course shells.

Recommended fields:

- `id`
- `class_id`
- `subject_id`
- `teacher_id`
- `course_code`
- `title`
- `term`
- `academic_year`
- `description`
- `status`

### course_modules

Stores ordered course modules.

Recommended fields:

- `id`
- `course_id`
- `title`
- `description`
- `position`
- `status`

### course_module_items

Stores module items such as pages, assignments, materials, quizzes, and
discussions.

Recommended fields:

- `id`
- `module_id`
- `item_type`
- `title`
- `target_id`
- `position`
- `status`
- `due_at`

### assignments

Stores coursework.

Recommended fields:

- `id`
- `course_id`
- `class_id`
- `subject_id`
- `title`
- `instructions`
- `due_at`
- `status`
- `created_by`
- `created_at`

### assignment_submissions

Stores student submission metadata.

Recommended fields:

- `id`
- `assignment_id`
- `student_id`
- `status`
- `submitted_at`
- `file_asset_id`
- `teacher_feedback`
- `graded_at`

File-backed submissions should wait until private object storage and signed URL
rules exist.

## 7. Finance Tables

### fee_items

Stores approved fee definitions.

Recommended fields:

- `id`
- `title`
- `category`
- `amount`
- `term`
- `academic_year`
- `due_at`
- `status`
- `created_by`

### invoices

Stores invoice headers and balance snapshots.

Recommended fields:

- `id`
- `student_id`
- `term`
- `academic_year`
- `total_amount`
- `amount_paid`
- `balance`
- `status`
- `due_at`
- `created_by`

### invoice_items

Stores invoice line items.

Recommended fields:

- `id`
- `invoice_id`
- `fee_item_id`
- `title_snapshot`
- `category_snapshot`
- `amount_snapshot`

### payments

Stores payment records and reconciliation state.

Recommended fields:

- `id`
- `parent_id`
- `student_id`
- `invoice_id`
- `category`
- `amount`
- `method`
- `status`
- `reference`
- `provider_reference`
- `recorded_by`
- `paid_at`
- `verified_at`

Constraints:

- unique `reference`
- unique `provider_reference` when present

### wallet_transactions

Stores feeding and transport wallet activity.

Recommended fields:

- `id`
- `student_id`
- `wallet`
- `type`
- `amount`
- `balance_after`
- `description`
- `reference`
- `occurred_at`

## 8. Transport Tables

### transport_routes

Stores transport route details.

Recommended fields:

- `id`
- `route_name`
- `bus_name`
- `vehicle_registration`
- `capacity`
- `driver_name`
- `driver_phone`
- `stops`
- `status`

### transport_assignments

Links students to routes.

Recommended fields:

- `id`
- `student_id`
- `route_id`
- `pickup_point`
- `drop_off_point`
- `estimated_pickup_time`
- `estimated_drop_off_time`
- `fee_status`

### transport_trips

Stores current and historical trip states.

Recommended fields:

- `id`
- `route_id`
- `date`
- `direction`
- `status`
- `current_location_label`
- `next_stop`
- `last_updated_at`
- `updated_by`

## 9. Files and Notifications

### file_assets

Stores private file metadata only.

Recommended fields:

- `id`
- `owner_id`
- `owner_type`
- `storage_key`
- `file_name`
- `file_type`
- `mime_type`
- `byte_size`
- `checksum`
- `visibility`
- `created_by`
- `created_at`

### notification_events

Stores backend-triggered notification events.

Recommended fields:

- `id`
- `recipient_user_id`
- `channel`
- `template_key`
- `payload`
- `status`
- `provider_reference`
- `queued_at`
- `sent_at`

## 10. Audit Logs

### audit_logs

Stores immutable audit entries.

Recommended fields:

- `id`
- `actor_user_id`
- `actor_role`
- `action`
- `target_table`
- `target_id`
- `previous_summary`
- `new_summary`
- `request_id`
- `ip_address`
- `user_agent`
- `created_at`

Required audited actions:

- account creation and status changes
- parent-child link changes
- staff class/subject assignment changes
- attendance submissions
- gradebook entries
- fee item, invoice, payment, and wallet writes
- payment webhook verification
- transport trip status updates
- file upload/download intents
- report exports
- notification events

## 11. Migration Order

1. Identity and audit foundation
2. People records
3. Academic setup
4. Courses and modules
5. Academic records
6. Finance setup
7. Payments and wallets
8. Transport operations
9. Private file metadata
10. Notifications

Do not enable live frontend writes until the relevant migration group, role
authorization, audit logging, and smoke tests are complete.

The production role and route authorization policy is tracked in
`PORTAL_AUTHORIZATION_PLAN.md`.

## 12. Backend ORM Decision

Prisma or Drizzle can be selected later. Do not add either package to the
frontend until the backend repository/service structure is approved.

Decision criteria:

- migration reliability
- PostgreSQL support
- type-safety
- ease of audit-log transaction handling
- team familiarity
- Render deployment behavior

## 13. Data Migration Rule

The current frontend mock data is not production seed data.

When the backend is ready:

1. Create sanitized seed records separately.
2. Load only fictional or approved school records.
3. Verify parent-child and staff-class permissions.
4. Verify financial balances against approved accounting records.
5. Keep mock data available only in non-production development environments.
