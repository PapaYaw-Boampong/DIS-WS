"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { portalRoutes } from "@/lib/portal/routes";
import type { PortalRole } from "@/types/portal";

type CourseNavProps = {
  readonly role: PortalRole;
  readonly courseId: string;
};

export function CourseNav({ role, courseId }: CourseNavProps) {
  const pathname = usePathname();
  const tabs = [
    { label: "Home", href: portalRoutes.course(role, courseId) },
    { label: "Modules", href: portalRoutes.courseModules(role, courseId) },
    {
      label: "Assignments",
      href: portalRoutes.courseAssignments(role, courseId),
    },
    { label: "Grades", href: portalRoutes.courseGrades(role, courseId) },
    { label: "People", href: portalRoutes.coursePeople(role, courseId) },
  ];

  return (
    <nav
      aria-label="Course navigation"
      className="flex gap-1 overflow-x-auto rounded-2xl border border-border bg-soft-white p-3 xl:h-fit xl:flex-col xl:overflow-visible"
    >
      {tabs.map((tab) => {
        const active =
          tab.label === "Home"
            ? pathname === tab.href
            : pathname === tab.href || pathname.startsWith(`${tab.href}/`);

        return (
          <Link
            key={tab.label}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={
              active
                ? "shrink-0 rounded-xl bg-curry-orange px-4 py-3 text-sm font-bold text-white"
                : "shrink-0 rounded-xl px-4 py-3 text-sm font-semibold text-charcoal transition-colors hover:bg-white"
            }
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
