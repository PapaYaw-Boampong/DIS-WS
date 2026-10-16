import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdminClassesView } from "@/components/portal/dashboards/AdminClassesView";
import { getAdminAreaSession } from "@/lib/portal/mock-role";

export const metadata: Metadata = {
  title: "Classes",
};

type ClassesPageProps = {
  readonly params: Promise<{ role: string }>;
};

// Class administration only. Teachers work from their courses instead of a
// separate class roster view.
export default async function ClassesPage({ params }: ClassesPageProps) {
  const { role } = await params;

  if (role !== "admin" && role !== "registry") {
    notFound();
  }

  if (!(await getAdminAreaSession("registry"))) {
    notFound();
  }

  return <AdminClassesView />;
}
