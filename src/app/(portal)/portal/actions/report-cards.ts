"use server";

import { revalidatePath } from "next/cache";

import { portalApiPost, useRealPortalAuth } from "@/lib/portal/data/api";
import { getCapableSession } from "@/lib/portal/permissions";

export type ReportCardActionResult = {
  readonly ok: boolean;
  readonly message: string;
};

async function guard(): Promise<ReportCardActionResult | null> {
  if (!(await getCapableSession("reportcards.publish"))) {
    return {
      ok: false,
      message: "Your role does not currently have permission to release report cards.",
    };
  }
  return null;
}

/**
 * Release drafts to families. The backend notifies each learner's parent and
 * records who published what — publishing is not a display state.
 */
export async function publishReportCards(
  ids: readonly string[],
): Promise<ReportCardActionResult> {
  const denied = await guard();
  if (denied) return denied;

  if (ids.length === 0) {
    return { ok: false, message: "Select at least one report card to release." };
  }

  if (!useRealPortalAuth) {
    return {
      ok: true,
      message: `${ids.length} report card${ids.length === 1 ? "" : "s"} marked for release. Sending them to families needs the school database, which is not connected yet.`,
    };
  }

  const result = await portalApiPost<{ published?: number }>(
    "/report-cards/publish",
    { ids },
  );

  if (!result.ok) {
    return {
      ok: false,
      message:
        result.status === 403
          ? "You can only release report cards for your own classes."
          : "The report cards could not be released. Please try again.",
    };
  }

  const published = result.data?.published ?? ids.length;
  revalidatePath("/portal", "layout");

  return {
    ok: true,
    message: `${published} report card${published === 1 ? "" : "s"} released. The families have been notified.`,
  };
}

/** Pull a released report card back for a correction. */
export async function withdrawReportCard(
  id: string,
): Promise<ReportCardActionResult> {
  const denied = await guard();
  if (denied) return denied;

  if (!useRealPortalAuth) {
    return {
      ok: true,
      message:
        "Report card returned to draft. Saving the change needs the school database, which is not connected yet.",
    };
  }

  const result = await portalApiPost(`/report-cards/${id}/withdraw`);

  if (!result.ok) {
    return { ok: false, message: "The report card could not be withdrawn. Please try again." };
  }

  revalidatePath("/portal", "layout");

  return {
    ok: true,
    message: "Report card withdrawn from the family and returned to draft.",
  };
}

/**
 * Build drafts for a class from that term's gradebook. Already-published cards
 * are left alone — correcting one means withdrawing it first.
 */
export async function generateReportCards(input: {
  readonly classId: string;
  readonly academicYear: string;
  readonly term: string;
}): Promise<ReportCardActionResult> {
  const denied = await guard();
  if (denied) return denied;

  if (!input.classId || !input.academicYear || !input.term) {
    return { ok: false, message: "Choose a class, academic year and term." };
  }

  if (!useRealPortalAuth) {
    return {
      ok: true,
      message:
        "Report cards would be prepared from this class's gradebook. Building them needs the school database, which is not connected yet.",
    };
  }

  const result = await portalApiPost<{
    created?: number;
    updated?: number;
    skipped?: number;
  }>("/report-cards/generate", input);

  if (!result.ok) {
    return {
      ok: false,
      message:
        result.status === 403
          ? "You can only prepare report cards for your own classes."
          : "No report cards could be prepared. Check that the class has learners and gradebook entries.",
    };
  }

  const created = result.data?.created ?? 0;
  const updated = result.data?.updated ?? 0;
  const skipped = result.data?.skipped ?? 0;

  revalidatePath("/portal", "layout");

  return {
    ok: true,
    message: `${created} prepared, ${updated} refreshed${skipped ? `, ${skipped} left alone (already published)` : ""}.`,
  };
}
