"use server";

import { revalidatePath } from "next/cache";

import { portalApiPost, useRealPortalAuth } from "@/lib/portal/data/api";
import type { PortalCapability } from "@/lib/portal/capabilities";
import { getCapableSession } from "@/lib/portal/permissions";

export type RegistryActionResult = {
  readonly ok: boolean;
  readonly message: string;
  // Mock mode returns what would have been written, so the UI can confirm the
  // record it captured without inventing a database row.
  readonly preview?: Record<string, string>;
};

type StudentIntake = {
  readonly fullName: string;
  readonly studentId: string;
  readonly dateOfBirth: string;
  readonly gender: string;
  readonly classId: string;
  readonly className: string;
  readonly level: string;
  readonly admissionDate: string;
  readonly previousSchool: string;
  readonly guardianIds: readonly string[];
  readonly guardianName: string;
  readonly guardianRelationship: string;
  readonly guardianPhone: string;
  readonly guardianEmail: string;
  readonly address: string;
  readonly emergencyContactName: string;
  readonly emergencyContactPhone: string;
  readonly medicalNotes: string;
  readonly feedingPlan: string;
  readonly transportRouteId: string;
  readonly status: string;
};

type ParentIntake = {
  readonly fullName: string;
  readonly relationship: string;
  readonly phone: string;
  readonly alternatePhone: string;
  readonly email: string;
  readonly address: string;
  readonly occupation: string;
  readonly idType: string;
  readonly idNumber: string;
  readonly childIds: readonly string[];
  readonly createPortalAccount: boolean;
  readonly status: string;
};

type StaffIntake = {
  readonly fullName: string;
  readonly staffId: string;
  readonly title: string;
  readonly department: string;
  readonly employmentType: string;
  readonly startDate: string;
  readonly qualification: string;
  readonly phone: string;
  readonly email: string;
  readonly address: string;
  readonly classIds: readonly string[];
  readonly subjectIds: readonly string[];
  readonly portalRole: string;
  readonly status: string;
};

async function guard(
  capability: PortalCapability,
): Promise<RegistryActionResult | null> {
  if (!(await getCapableSession(capability))) {
    return {
      ok: false,
      message: "Your role does not currently have permission for this action.",
    };
  }

  return null;
}

// One shape for every write: enforce the capability, POST when a backend is
// wired up, otherwise return the captured record for confirmation.
async function submit(
  capability: PortalCapability,
  path: string,
  payload: unknown,
  preview: Record<string, string>,
  successMessage: string,
): Promise<RegistryActionResult> {
  const denied = await guard(capability);

  if (denied) {
    return denied;
  }

  if (!useRealPortalAuth) {
    return {
      ok: true,
      message: `${successMessage} Saving the record needs the school database, which is not connected yet.`,
      preview,
    };
  }

  const result = await portalApiPost(path, payload);

  if (!result.ok) {
    return {
      ok: false,
      message: "The school database rejected the record. Check the details and try again.",
    };
  }

  revalidatePath("/portal", "layout");

  return { ok: true, message: successMessage, preview };
}

export async function createStudentRecord(
  intake: StudentIntake,
): Promise<RegistryActionResult> {
  if (!intake.fullName.trim() || !intake.classId) {
    return { ok: false, message: "A full name and class are required." };
  }

  return submit(
    "students.create",
    "/students",
    intake,
    {
      Learner: intake.fullName,
      "Student ID": intake.studentId || "Assigned on save",
      Class: intake.className,
      Guardians: intake.guardianIds.length
        ? `${intake.guardianIds.length} linked`
        : intake.guardianName || "None linked",
      Contact: intake.guardianPhone || "—",
    },
    `${intake.fullName} was captured for ${intake.className}.`,
  );
}

export async function createParentRecord(
  intake: ParentIntake,
): Promise<RegistryActionResult> {
  if (!intake.fullName.trim() || !intake.phone.trim()) {
    return { ok: false, message: "A full name and phone number are required." };
  }

  return submit(
    "parents.create",
    "/parents",
    intake,
    {
      Guardian: intake.fullName,
      Relationship: intake.relationship,
      Phone: intake.phone,
      Email: intake.email || "—",
      Children: intake.childIds.length
        ? `${intake.childIds.length} linked`
        : "None linked",
      "Portal account": intake.createPortalAccount ? "Requested" : "Not requested",
    },
    `${intake.fullName} was captured as a guardian.`,
  );
}

export async function createStaffRecord(
  intake: StaffIntake,
): Promise<RegistryActionResult> {
  if (!intake.fullName.trim() || !intake.title.trim()) {
    return { ok: false, message: "A full name and job title are required." };
  }

  return submit(
    "staff.create",
    "/staff",
    intake,
    {
      Staff: intake.fullName,
      "Staff ID": intake.staffId || "Assigned on save",
      Title: intake.title,
      Department: intake.department || "—",
      "Portal role": intake.portalRole,
      Classes: intake.classIds.length ? `${intake.classIds.length} assigned` : "None",
    },
    `${intake.fullName} was captured as staff.`,
  );
}

export type PromotionEntry = {
  readonly studentId: string;
  readonly studentName: string;
  readonly fromClassId: string;
  readonly toClassId: string;
  readonly outcome: "promote" | "repeat" | "graduate" | "transfer";
};

export async function promoteStudents(
  academicYear: string,
  entries: readonly PromotionEntry[],
): Promise<RegistryActionResult> {
  if (!entries.length) {
    return { ok: false, message: "Select at least one learner to progress." };
  }

  const promoted = entries.filter((entry) => entry.outcome === "promote").length;
  const repeated = entries.filter((entry) => entry.outcome === "repeat").length;
  const graduated = entries.filter((entry) => entry.outcome === "graduate").length;
  const transferred = entries.filter((entry) => entry.outcome === "transfer").length;

  return submit(
    "students.promote",
    "/students/promotions",
    { academicYear, entries },
    {
      "Academic year": academicYear,
      Promoted: String(promoted),
      Repeating: String(repeated),
      Graduated: String(graduated),
      "Transferred out": String(transferred),
    },
    `${entries.length} learner${entries.length === 1 ? "" : "s"} progressed for ${academicYear}.`,
  );
}

export type ImportedStudentRow = {
  readonly fullName: string;
  readonly studentId: string;
  readonly className: string;
  readonly level: string;
  readonly dateOfBirth: string;
  readonly gender: string;
  readonly guardianName: string;
  readonly guardianPhone: string;
  readonly guardianEmail: string;
};

export async function importStudentRows(
  rows: readonly ImportedStudentRow[],
): Promise<RegistryActionResult> {
  if (!rows.length) {
    return { ok: false, message: "There are no valid rows to import." };
  }

  const classes = new Set(rows.map((row) => row.className).filter(Boolean));

  return submit(
    "students.import",
    "/students/import",
    { rows },
    {
      Learners: String(rows.length),
      Classes: classes.size ? [...classes].join(", ") : "—",
      Guardians: String(
        rows.filter((row) => row.guardianName || row.guardianPhone).length,
      ),
    },
    `${rows.length} learner${rows.length === 1 ? "" : "s"} ready to enrol.`,
  );
}
