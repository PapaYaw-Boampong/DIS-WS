"use server";

import { portalApiPost, useRealPortalAuth } from "@/lib/portal/data/api";

export type WriteResult = {
  readonly ok: boolean;
  readonly mode: "mock" | "real";
  readonly saved?: number;
};

export type NewAssignmentInput = {
  readonly classId: string;
  readonly courseId?: string;
  readonly subject: string;
  readonly title: string;
  readonly instructions?: string;
  readonly dueDate: string;
};

// Create an assignment. Mock mode is a no-op preview; real mode POSTs to the
// backend (staff may only write to their own classes — enforced server-side).
export async function createAssignment(
  input: NewAssignmentInput,
): Promise<WriteResult> {
  if (!useRealPortalAuth) {
    return { ok: true, mode: "mock" };
  }
  const result = await portalApiPost("/assignments", input);
  return { ok: result.ok, mode: "real" };
}

export type GradeEntryInput = {
  readonly studentId: string;
  readonly subject: string;
  readonly assessment: string;
  readonly score: number;
  readonly total: number;
  readonly status?: string;
};

export async function saveGradebook(
  classId: string,
  entries: readonly GradeEntryInput[],
): Promise<WriteResult> {
  if (!useRealPortalAuth) {
    return { ok: true, mode: "mock", saved: entries.length };
  }
  const result = await portalApiPost<{ saved?: number }>("/gradebook", {
    classId,
    entries,
  });
  return { ok: result.ok, mode: "real", saved: result.data?.saved };
}

export type AttendanceMarkInput = {
  readonly studentId: string;
  readonly mark: string;
  readonly note?: string;
};

export async function saveAttendance(
  classId: string,
  date: string,
  marks: readonly AttendanceMarkInput[],
): Promise<WriteResult> {
  if (!useRealPortalAuth) {
    return { ok: true, mode: "mock", saved: marks.length };
  }
  const result = await portalApiPost<{ saved?: number }>("/daily-attendance", {
    classId,
    date,
    marks,
  });
  return { ok: result.ok, mode: "real", saved: result.data?.saved };
}

export type FileActionResult = WriteResult & { readonly error?: string };

// Staff: upload a real course material file. Mock mode is a no-op preview
// (files stay on the user's device, matching the previous placeholder copy);
// real mode uploads to the backend, which stores it in R2.
export async function uploadCourseMaterial(
  formData: FormData,
): Promise<FileActionResult> {
  if (!useRealPortalAuth) {
    return { ok: true, mode: "mock" };
  }

  const classId = String(formData.get("classId") ?? "");
  const courseId = formData.get("courseId");
  const subject = String(formData.get("subject") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const file = formData.get("file");

  if (!classId || !subject || !title || !(file instanceof File) || file.size === 0) {
    return { ok: false, mode: "real", error: "invalid_request" };
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const result = await portalApiPost<{ error?: string }>("/learning-resources", {
    classId,
    courseId: courseId ? String(courseId) : undefined,
    subject,
    title,
    file: {
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      dataBase64: bytes.toString("base64"),
    },
  });
  return {
    ok: result.ok,
    mode: "real",
    error: result.ok ? undefined : (result.data?.error ?? "upload_failed"),
  };
}

// Student: submit (or re-submit) a file for one assignment.
export async function submitAssignmentWork(
  assignmentId: string,
  formData: FormData,
): Promise<FileActionResult> {
  if (!useRealPortalAuth) {
    return { ok: true, mode: "mock" };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, mode: "real", error: "invalid_request" };
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const result = await portalApiPost<{ error?: string }>(
    `/assignments/${encodeURIComponent(assignmentId)}/submissions`,
    {
      file: {
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        dataBase64: bytes.toString("base64"),
      },
    },
  );
  return {
    ok: result.ok,
    mode: "real",
    error: result.ok ? undefined : (result.data?.error ?? "submit_failed"),
  };
}
