import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Bus,
  CalendarDays,
  GraduationCap,
  Mail,
  Phone,
  ShieldCheck,
  UtensilsCrossed,
} from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { listAttendanceSummaries } from "@/lib/portal/data/academics";
import { listClasses, listParents } from "@/lib/portal/data/people";
import { listTransportRoutes } from "@/lib/portal/data/transport";
import { getMockStudentPortalContext } from "@/lib/portal/mock-student";
import { isPortalRole } from "@/lib/portal/roles";
import { portalRoutes } from "@/lib/portal/routes";

export const metadata: Metadata = {
  title: "Profile",
};

type ProfilePageProps = {
  readonly params: Promise<{ role: string }>;
};

const feedingPlanLabels: Record<string, string> = {
  none: "Not enrolled",
  daily: "Daily plan",
  weekly: "Weekly plan",
  termly: "Termly plan",
};

function DetailRow({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border py-3 last:border-b-0">
      <dt className="text-sm text-muted-grey">{label}</dt>
      <dd className="text-sm font-bold text-charcoal">{value}</dd>
    </div>
  );
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { role } = await params;

  if (!isPortalRole(role) || role !== "student") {
    notFound();
  }

  const context = await getMockStudentPortalContext();

  if (!context) {
    notFound();
  }

  const { student, session } = context;
  const [attendanceSummaries, classes, parents, routes] = await Promise.all([
    listAttendanceSummaries(),
    listClasses(),
    listParents(),
    listTransportRoutes(),
  ]);
  const attendance = attendanceSummaries.find(
    (item) => item.studentId === student.id,
  );
  const classInfo = classes.find((item) => item.id === student.classId);
  const guardians = parents.filter((parent) =>
    parent.childIds.includes(student.id),
  );
  const route = routes.find((item) => item.id === student.transportRouteId);

  return (
    <>
      <DashboardHeader
        eyebrow={`${student.className} · ${student.studentId}`}
        title="My profile"
        description="Your school record, guardians and account details. Contact the school office to correct anything shown here."
        badge="Student record"
      />

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
        <div className="space-y-6">
          <DashboardCard title="Student record">
            <div className="flex flex-wrap items-center gap-5">
              <div className="flex size-16 shrink-0 items-center justify-center rounded-3xl bg-soft-cream text-curry-orange">
                <GraduationCap aria-hidden="true" className="size-8" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-charcoal">
                  {student.fullName}
                </p>
                <p className="mt-1 text-sm text-muted-grey">
                  {student.level} · {student.className}
                </p>
              </div>
              <div className="ml-auto">
                <StatusBadge
                  variant={student.status === "active" ? "success" : "warning"}
                >
                  {student.status === "active" ? "Active" : "Inactive"}
                </StatusBadge>
              </div>
            </div>

            <dl className="mt-6">
              <DetailRow label="Student ID" value={student.studentId} />
              <DetailRow label="Class" value={student.className} />
              <DetailRow label="Level" value={student.level} />
              <DetailRow
                label="Class teacher"
                value={classInfo?.classTeacher ?? "To be confirmed"}
              />
              <DetailRow
                label="Class size"
                value={
                  classInfo ? `${classInfo.studentCount} learners` : "—"
                }
              />
            </dl>
          </DashboardCard>

          <DashboardCard
            title="Guardians"
            description="The family contacts linked to your record."
          >
            {guardians.length ? (
              <ul className="space-y-4">
                {guardians.map((guardian) => (
                  <li
                    key={guardian.id}
                    className="rounded-2xl border border-border bg-soft-white p-5"
                  >
                    <p className="font-bold text-charcoal">
                      {guardian.fullName}
                    </p>
                    <p className="mt-2 flex items-center gap-2 text-sm text-muted-grey">
                      <Phone aria-hidden="true" className="size-4" />
                      {guardian.phone}
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-sm text-muted-grey">
                      <Mail aria-hidden="true" className="size-4" />
                      {guardian.email}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-grey">
                No guardian is linked to your record yet.
              </p>
            )}
          </DashboardCard>
        </div>

        <div className="space-y-6">
          <DashboardCard title="Account">
            <dl>
              <DetailRow label="Signed in as" value={session.user.name} />
              <DetailRow label="Email" value={session.user.email} />
              <DetailRow label="Portal role" value="Student" />
            </dl>
            <p className="mt-5 flex items-start gap-3 rounded-2xl bg-soft-cream p-4 text-sm leading-6 text-charcoal">
              <ShieldCheck
                aria-hidden="true"
                className="mt-0.5 size-5 shrink-0 text-curry-orange"
              />
              School accounts are issued by the office. Ask a teacher or the
              office to reset your password if you cannot sign in.
            </p>
          </DashboardCard>

          <DashboardCard title="School services">
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-2xl border border-border bg-soft-white p-4">
                <UtensilsCrossed
                  aria-hidden="true"
                  className="mt-0.5 size-5 shrink-0 text-curry-orange"
                />
                <div>
                  <p className="font-bold text-charcoal">Feeding</p>
                  <p className="mt-1 text-sm text-muted-grey">
                    {feedingPlanLabels[student.feedingPlan ?? "none"]}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl border border-border bg-soft-white p-4">
                <Bus
                  aria-hidden="true"
                  className="mt-0.5 size-5 shrink-0 text-curry-orange"
                />
                <div>
                  <p className="font-bold text-charcoal">Transport</p>
                  <p className="mt-1 text-sm text-muted-grey">
                    {route
                      ? `${route.routeName} · ${route.busName}`
                      : "Not using school transport"}
                  </p>
                </div>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard title="Attendance this term">
            <div className="flex items-center gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-soft-cream text-curry-orange">
                <CalendarDays aria-hidden="true" className="size-6" />
              </div>
              <div>
                <p className="text-3xl font-extrabold text-charcoal tabular-nums">
                  {attendance?.percentage ?? 0}%
                </p>
                <p className="text-sm text-muted-grey">
                  {attendance
                    ? `${attendance.present} present · ${attendance.late} late · ${attendance.absent} absent`
                    : "No attendance record yet"}
                </p>
              </div>
            </div>
            <Link
              href={portalRoutes.studentAttendance}
              className="mt-5 inline-flex min-h-10 items-center rounded-full border border-curry-orange px-4 text-sm font-bold text-deep-orange transition-colors hover:bg-soft-cream"
            >
              Open attendance
            </Link>
          </DashboardCard>
        </div>
      </div>
    </>
  );
}
