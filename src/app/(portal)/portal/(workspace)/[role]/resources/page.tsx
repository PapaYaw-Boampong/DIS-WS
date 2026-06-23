import { redirect } from "next/navigation";

import { isPortalRole } from "@/lib/portal/roles";
import { portalRoutes } from "@/lib/portal/routes";

type LegacyResourcesRedirectProps = {
  readonly params: Promise<{
    role: string;
  }>;
};

export default async function LegacyResourcesRedirect({
  params,
}: LegacyResourcesRedirectProps) {
  const { role } = await params;

  if (role === "student") {
    redirect(portalRoutes.studentCourses);
  }

  if (role === "staff") {
    redirect(portalRoutes.staffCourses);
  }

  if (isPortalRole(role)) {
    redirect(portalRoutes.dashboard(role));
  }

  redirect(portalRoutes.login);
}
