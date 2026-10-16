import Link from "next/link";
import { GraduationCap, School, UserPlus, Users } from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { DataTable, type DataTableRow } from "@/components/portal/DataTable";
import { MetricCard } from "@/components/portal/MetricCard";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { listInquiries, listMailingSignups } from "@/lib/portal/data/forms";
import { listClasses, listParents, listStaff } from "@/lib/portal/data/people";
import { listStudents } from "@/lib/portal/data/students";
import { formatPortalDate } from "@/lib/portal/format";
import { getMockPortalSession } from "@/lib/portal/mock-session";
import { portalRoutes } from "@/lib/portal/routes";

export async function RegistryDashboard() {
  const session = await getMockPortalSession();
  const userName = session?.user.name ?? "Registry";
  const [students, parents, staff, classes, inquiries, mailingList] =
    await Promise.all([
      listStudents(),
      listParents(),
      listStaff(),
      listClasses(),
      listInquiries(),
      listMailingSignups(),
    ]);

  const newInquiries = inquiries.filter(
    (inquiry) => inquiry.status === "new",
  ).length;
  const studentRows: readonly DataTableRow[] = students.map((student) => ({
    id: student.id,
    cells: [
      student.fullName,
      student.studentId,
      student.className,
      <StatusBadge
        key={`${student.id}-status`}
        variant={student.status === "active" ? "success" : "warning"}
      >
        {student.status === "active" ? "Active" : "Inactive"}
      </StatusBadge>,
    ],
  }));
  const classRows: readonly DataTableRow[] = classes.map((classItem) => ({
    id: classItem.id,
    cells: [
      classItem.name,
      classItem.level,
      String(classItem.studentCount),
      classItem.classTeacher,
    ],
  }));

  return (
    <>
      <DashboardHeader
        eyebrow="Registry office"
        title={`Welcome back, ${userName.split(" ")[0]}`}
        description="Learner, family and staff records, class placement, admissions enquiries and the school mailing list."
        badge="Registry records"
      />

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Students"
          value={String(students.length)}
          detail="On the register"
          icon={<GraduationCap aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Parents"
          value={String(parents.length)}
          detail="Linked family accounts"
          icon={<Users aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Staff records"
          value={String(staff.length)}
          detail="Academic and support staff"
          icon={<School aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="New enquiries"
          value={String(newInquiries)}
          detail={`${inquiries.length} total admissions enquiries`}
          icon={<UserPlus aria-hidden="true" className="size-5" />}
        />
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]">
        <div className="space-y-8">
          <DashboardCard
            title="Student register"
            description="Every learner currently on roll."
            action={
              <Link
                href={portalRoutes.registryStudents}
                className="inline-flex min-h-10 items-center rounded-full border border-curry-orange px-4 text-sm font-bold text-deep-orange transition-colors hover:bg-soft-cream"
              >
                Open students
              </Link>
            }
          >
            <DataTable
              caption="Student register"
              columns={["Student", "Student ID", "Class", "Status"]}
              rows={studentRows}
              emptyMessage="No students are on the register yet."
            />
          </DashboardCard>

          <DashboardCard
            title="Class placement"
            description="Class sizes and the teacher responsible for each one."
          >
            <DataTable
              caption="Class placement"
              columns={["Class", "Level", "Students", "Class teacher"]}
              rows={classRows}
              emptyMessage="No classes are configured yet."
            />
          </DashboardCard>
        </div>

        <div className="space-y-8">
          <DashboardCard
            title="Admissions enquiries"
            description="The most recent enquiries from the public website."
            action={
              <Link
                href={portalRoutes.registryInquiries}
                className="text-sm font-bold text-deep-orange hover:underline"
              >
                All enquiries
              </Link>
            }
          >
            {inquiries.length ? (
              <ul className="space-y-3">
                {inquiries.slice(0, 5).map((inquiry) => (
                  <li
                    key={inquiry.id}
                    className="rounded-2xl border border-border bg-soft-white p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-bold text-charcoal">{inquiry.name}</p>
                      <StatusBadge
                        variant={
                          inquiry.status === "new" ? "warning" : "success"
                        }
                      >
                        {inquiry.status === "new" ? "New" : "Handled"}
                      </StatusBadge>
                    </div>
                    <p className="mt-1 text-sm text-muted-grey">
                      {inquiry.subject}
                    </p>
                    <p className="mt-2 text-xs font-semibold text-muted-grey">
                      {formatPortalDate(inquiry.createdAt.slice(0, 10))}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-grey">
                No admissions enquiries have been submitted yet.
              </p>
            )}
          </DashboardCard>

          <DashboardCard
            title="Mailing list"
            description="Families and visitors subscribed to school updates."
          >
            <p className="text-3xl font-extrabold text-charcoal tabular-nums">
              {mailingList.filter((entry) => entry.status === "active").length}
            </p>
            <p className="mt-1 text-sm text-muted-grey">Active subscribers</p>
            <Link
              href={portalRoutes.registryMailingList}
              className="mt-5 inline-flex min-h-10 items-center rounded-full border border-curry-orange px-4 text-sm font-bold text-deep-orange transition-colors hover:bg-soft-cream"
            >
              Manage mailing list
            </Link>
          </DashboardCard>
        </div>
      </div>
    </>
  );
}
