import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  BookOpen,
  FileText,
  FolderOpen,
  Upload,
} from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { DataTable, type DataTableRow } from "@/components/portal/DataTable";
import { MetricCard } from "@/components/portal/MetricCard";
import { MockResourceUpload } from "@/components/portal/MockResourceUpload";
import { StatusBadge } from "@/components/portal/StatusBadge";
import {
  mockClasses,
  mockLearningResources,
} from "@/data/portal/academics";
import { formatPortalDate } from "@/lib/portal/format";
import { getMockStaffPortalContext } from "@/lib/portal/mock-staff";

export const metadata: Metadata = {
  title: "Resources",
};

export default async function StaffResourcesPage() {
  const context = await getMockStaffPortalContext();

  if (!context) {
    notFound();
  }

  const resources = mockLearningResources.filter((resource) =>
    context.staff.classIds.includes(resource.classId),
  );
  const resourceRows: readonly DataTableRow[] = resources.map((resource) => {
    const classItem = mockClasses.find(
      (item) => item.id === resource.classId,
    );

    return {
      id: resource.id,
      cells: [
        resource.title,
        classItem?.name ?? resource.classId,
        resource.subject,
        resource.fileName,
        formatPortalDate(resource.sharedAt),
        <StatusBadge
          key={resource.id}
          variant={resource.status === "published" ? "success" : "warning"}
        >
          {resource.status === "published" ? "Published" : "Draft"}
        </StatusBadge>,
      ],
    };
  });

  return (
    <>
      <DashboardHeader
        eyebrow="Learning materials"
        title="Resources"
        description="Review fictional shared files and preview an upload without sending a file to storage or a backend."
        badge="Upload placeholder"
      />

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Resources"
          value={String(resources.length)}
          detail="Across assigned classes"
          icon={<FolderOpen aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Published"
          value={String(
            resources.filter((resource) => resource.status === "published")
              .length,
          )}
          detail="Visible mock materials"
          icon={<BookOpen aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Draft"
          value={String(
            resources.filter((resource) => resource.status === "draft").length,
          )}
          detail="Not shared"
          icon={<FileText aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Upload mode"
          value="Preview"
          detail="Files remain local"
          icon={<Upload aria-hidden="true" className="size-5" />}
        />
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_minmax(22rem,0.8fr)]">
        <DashboardCard
          title="Shared resource list"
          description="File records are fictional and cannot be downloaded."
        >
          <DataTable
            caption="Staff learning resources"
            columns={[
              "Resource",
              "Class",
              "Subject",
              "File",
              "Shared",
              "Status",
            ]}
            rows={resourceRows}
          />
        </DashboardCard>

        <DashboardCard
          title="Upload resource"
          description="Preview the planned upload workflow."
          className="h-fit"
        >
          <MockResourceUpload classes={context.classes} />
        </DashboardCard>
      </div>
    </>
  );
}
