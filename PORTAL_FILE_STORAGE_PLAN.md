# Divine International School Portal File Storage Plan

Status: Phase 12 secure file storage readiness draft
Frontend status: local preview only
Production authority: future Render backend

## 1. Boundary

This plan defines how portal files should be stored, accessed, scanned, audited,
and retained before live uploads/downloads are enabled.

This phase does not add:

- object storage provider SDKs
- storage access keys
- bucket names
- upload endpoints
- signed URL generation
- malware scanning service
- live file uploads
- live file downloads
- backend calls
- production file metadata

The current frontend remains mock-only. Existing upload controls keep selected
files on the user device and do not transmit files.

## 2. Storage Rule

File binaries belong in private object storage, not PostgreSQL and not the
frontend repository.

PostgreSQL should store metadata only:

- owner
- category
- storage key
- file name
- MIME type
- byte size
- checksum/ETag
- visibility
- retention rule
- scan state
- audit trail references

## 3. File Categories

Initial portal file categories:

| Category | Created by | Visible to | Notes |
|---|---|---|---|
| Course materials | staff, admin | enrolled students, linked parents, staff, admin | Lesson notes, slides, worksheets |
| Assignment submissions | student | submitting student, assigned staff, admin | Wait for secure upload flow |
| Report cards | staff, admin | student, linked parent, staff, admin | PDF only recommended |
| Receipts | accounts/backend | parent, accounts, admin | Generated after verified payment/manual entry |
| Finance exports | accounts, admin | accounts, admin | Short-lived exports recommended |
| Admin documents | admin | admin | Internal documents only |
| Transport documents | transport, admin | transport, admin | Vehicle/route documents |

## 4. Upload Flow

Recommended production upload flow:

1. User selects a file in the portal.
2. Frontend asks backend for an upload intent.
3. Backend verifies role, record ownership, file category, size, type, and
   account status.
4. Backend creates short-lived signed upload URL.
5. Browser uploads directly to private object storage using the signed URL.
6. Backend records file metadata.
7. File is scanned or quarantined.
8. File becomes available only after safety and authorization checks pass.

The frontend must never store or use permanent bucket credentials.

## 5. Download Flow

Recommended production download flow:

1. User requests a file.
2. Backend checks session, role, record ownership, visibility, scan state, and
   retention state.
3. Backend records a download-intent audit event when required.
4. Backend creates a short-lived signed download URL.
5. Browser downloads from object storage.

No portal file should be permanently public.

## 6. Security Controls

Required controls:

- private buckets only
- short-lived signed upload URLs
- short-lived signed download URLs
- backend role/ownership checks
- file category allowlists
- MIME and extension validation
- size limits
- checksum or ETag metadata
- audit logging for sensitive upload/download intents
- scan/quarantine policy
- retention and deletion policy

## 7. Retention Decisions Needed

The school should approve retention windows for:

- course materials
- assignment submissions
- report cards
- payment receipts
- finance exports
- admin documents
- transport documents

Generated finance exports should usually expire quickly unless formally
archived.

## 8. Scanning and Quarantine

The backend/storage design should decide whether scanning is handled by:

- storage-provider malware scanning
- external scanning service
- backend-triggered scan worker
- manual approval for sensitive files

Until scanning is implemented, live student/staff uploads should remain disabled.

## 9. Access Rules

- Course materials require course/class membership, parent-child link, assigned
  staff scope, or admin role.
- Assignment submissions require submitting student, assigned staff, or admin
  role.
- Receipts require linked parent, accounts role, or admin role.
- Finance exports require accounts or admin role.
- Admin documents are admin-only.
- Transport documents are transport/admin-only.

## 10. Implementation Order

1. Choose private object storage provider.
2. Define bucket policy and retention rules.
3. Add backend storage configuration in Render only.
4. Add `file_assets` metadata table and migrations.
5. Add upload-intent endpoint.
6. Add signed upload flow.
7. Add scan/quarantine policy.
8. Add signed download endpoint.
9. Add audit logging for upload/download intents.
10. Replace frontend mock upload/download controls one route at a time.

Do not wire live uploads before backend authorization, private storage, scanning
policy, and audit logging are complete.
