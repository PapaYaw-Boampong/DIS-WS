import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getMfaStatus } from "@/app/(portal)/portal/actions/mfa";
import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { MfaManager } from "@/components/portal/MfaManager";
import { getMockPortalSession } from "@/lib/portal/mock-session";
import { portalRoutes } from "@/lib/portal/routes";
import { isPortalRole } from "@/lib/portal/roles";

export const metadata: Metadata = { title: "Security" };

type SecurityPageProps = {
  readonly params: Promise<{ role: string }>;
};

// Every role gets this page: a parent's account holds their children's records
// and their payment history, so second-factor protection is not just an
// administrator's concern.
export default async function SecurityPage({ params }: SecurityPageProps) {
  const { role } = await params;
  const session = await getMockPortalSession();

  if (!isPortalRole(role) || !session || session.user.role !== role) {
    notFound();
  }

  const status = await getMfaStatus();

  return (
    <>
      <DashboardHeader
        eyebrow="Your account"
        title="Security"
        description="Protect your sign-in. Two-step sign-in adds a code from your phone on top of your password."
        badge="Account security"
      />

      <div className="mt-8 max-w-3xl space-y-8">
        <DashboardCard
          title="Two-step sign-in"
          description="Recommended for every account, and strongly recommended for staff, accounts and administrator accounts."
        >
          <MfaManager status={status} />
        </DashboardCard>

        <DashboardCard
          title="Password"
          description="Change the password you use to sign in."
        >
          <p className="text-sm leading-6 text-muted-grey">
            If you have forgotten your password, the school office can issue a
            temporary one — you will be asked to set a new password the next
            time you sign in.
          </p>
          <Link
            href={portalRoutes.changePassword}
            className="mt-5 inline-flex min-h-11 items-center rounded-full border border-border px-5 text-sm font-bold text-charcoal transition-colors hover:bg-soft-white"
          >
            Change password
          </Link>
        </DashboardCard>
      </div>
    </>
  );
}
