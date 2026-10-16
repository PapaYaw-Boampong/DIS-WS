import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Bus,
  CalendarDays,
  GraduationCap,
  UtensilsCrossed,
  WalletCards,
} from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { StatusBadge } from "@/components/portal/StatusBadge";
import {
  listAttendanceSummaries,
  listResults,
} from "@/lib/portal/data/academics";
import { getParentInvoices } from "@/lib/portal/data/parent";
import { listClasses } from "@/lib/portal/data/people";
import { listTransportAssignments, listTransportRoutes } from "@/lib/portal/data/transport";
import { formatPortalCurrency } from "@/lib/portal/format";
import { averagePercentage, resultGrade } from "@/lib/portal/grades";
import { getMockParentPortalContext } from "@/lib/portal/mock-parent";
import { portalRoutes } from "@/lib/portal/routes";

export const metadata: Metadata = {
  title: "My Children",
};

type ChildrenPageProps = {
  readonly params: Promise<{ role: string }>;
};

const feedingPlanLabels: Record<string, string> = {
  none: "Not enrolled",
  daily: "Daily plan",
  weekly: "Weekly plan",
  termly: "Termly plan",
};

export default async function ChildrenPage({ params }: ChildrenPageProps) {
  const { role } = await params;

  if (role !== "parent") {
    notFound();
  }

  const context = await getMockParentPortalContext();

  if (!context) {
    notFound();
  }

  const [attendanceSummaries, allResults, invoices, classes, routes, assignments] =
    await Promise.all([
      listAttendanceSummaries(),
      listResults(),
      getParentInvoices(),
      listClasses(),
      listTransportRoutes(),
      listTransportAssignments(),
    ]);

  return (
    <>
      <DashboardHeader
        eyebrow="Family records"
        title="My children"
        description="Each learner linked to your account, with their class, attendance, results and school services."
        badge="Family records"
      />

      <div className="mt-8 space-y-6">
        {context.students.map((student) => {
          const attendance = attendanceSummaries.find(
            (item) => item.studentId === student.id,
          );
          const results = allResults.filter(
            (item) => item.studentId === student.id,
          );
          const average = averagePercentage(results);
          const balance = invoices
            .filter((invoice) => invoice.studentId === student.id)
            .reduce((total, invoice) => total + invoice.balance, 0);
          const classInfo = classes.find((item) => item.id === student.classId);
          const assignment = assignments.find(
            (item) => item.studentId === student.id,
          );
          const route = routes.find(
            (item) =>
              item.id === (assignment?.routeId ?? student.transportRouteId),
          );

          return (
            <DashboardCard
              key={student.id}
              title={student.fullName}
              description={`${student.level} · ${student.className} · ${student.studentId}`}
              action={
                <StatusBadge
                  variant={student.status === "active" ? "success" : "warning"}
                >
                  {student.status === "active" ? "Active" : "Inactive"}
                </StatusBadge>
              }
            >
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-border bg-soft-white p-4">
                  <CalendarDays
                    aria-hidden="true"
                    className="size-5 text-curry-orange"
                  />
                  <p className="mt-3 text-2xl font-extrabold text-charcoal tabular-nums">
                    {attendance?.percentage ?? 0}%
                  </p>
                  <p className="mt-1 text-sm text-muted-grey">
                    Attendance this term
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-soft-white p-4">
                  <GraduationCap
                    aria-hidden="true"
                    className="size-5 text-curry-orange"
                  />
                  <p className="mt-3 text-2xl font-extrabold text-charcoal tabular-nums">
                    {results.length ? `${average}%` : "—"}
                  </p>
                  <p className="mt-1 text-sm text-muted-grey">
                    {results.length
                      ? resultGrade(average).label
                      : "No results published"}
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-soft-white p-4">
                  <WalletCards
                    aria-hidden="true"
                    className="size-5 text-curry-orange"
                  />
                  <p className="mt-3 text-2xl font-extrabold text-charcoal">
                    {formatPortalCurrency(balance)}
                  </p>
                  <p className="mt-1 text-sm text-muted-grey">
                    Outstanding fees
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-soft-white p-4">
                  <Bus aria-hidden="true" className="size-5 text-curry-orange" />
                  <p className="mt-3 font-bold text-charcoal">
                    {route ? route.routeName : "No transport"}
                  </p>
                  <p className="mt-1 text-sm text-muted-grey">
                    {assignment
                      ? `Pickup: ${assignment.pickupPoint}`
                      : "Not using school transport"}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-4 rounded-2xl bg-soft-cream p-4 text-sm">
                <span className="flex items-center gap-2 font-semibold text-charcoal">
                  <UtensilsCrossed
                    aria-hidden="true"
                    className="size-4 text-curry-orange"
                  />
                  Feeding: {feedingPlanLabels[student.feedingPlan ?? "none"]}
                </span>
                <span className="text-muted-grey">
                  Class teacher: {classInfo?.classTeacher ?? "To be confirmed"}
                </span>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={portalRoutes.parentResults}
                  className="inline-flex min-h-10 items-center rounded-full border border-curry-orange px-4 text-sm font-bold text-deep-orange transition-colors hover:bg-soft-cream"
                >
                  Report cards
                </Link>
                <Link
                  href={portalRoutes.parentFees}
                  className="inline-flex min-h-10 items-center rounded-full border border-border px-4 text-sm font-bold text-charcoal transition-colors hover:bg-soft-white"
                >
                  Open fees
                </Link>
                <Link
                  href={portalRoutes.parentTransport}
                  className="inline-flex min-h-10 items-center rounded-full border border-border px-4 text-sm font-bold text-charcoal transition-colors hover:bg-soft-white"
                >
                  Transport
                </Link>
              </div>
            </DashboardCard>
          );
        })}
      </div>
    </>
  );
}
