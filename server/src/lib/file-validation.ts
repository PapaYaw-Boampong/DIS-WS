// Shared upload allowlist for every user-supplied file (payment receipts,
// course materials, assignment submissions). The declared mimeType becomes
// the literal Content-Type served back on download, so anything that a
// browser would render as a document (text/html, image/svg+xml, xml, script
// types, ...) must never be accepted — that's a stored-XSS vector against
// whoever opens the file next (staff viewing a receipt, a teacher grading a
// submission, a student opening a material).
const ALLOWED_UPLOAD_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
]);

export function isAllowedUploadMimeType(mimeType: string): boolean {
  return ALLOWED_UPLOAD_MIME_TYPES.has(mimeType.toLowerCase());
}
