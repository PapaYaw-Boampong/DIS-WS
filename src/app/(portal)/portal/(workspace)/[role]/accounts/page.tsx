import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { KeyRound, ShieldCheck, Users } from "lucide-react";

import { AccountsManager } from "@/components/portal/AccountsManager";
import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { MetricCard } from "@/components/portal/MetricCard";
import { listUserAccounts } from "@/lib/portal/data/accounts";
import { getMockRoleSession } from "@/lib/portal/mock-role";

export const metadata: Metadata = { title: "User Accounts" };

export default async function AccountsPage() {
  const session = await getMockRoleSession("admin");
  if (!session) {
    notFound();
  }

  const accounts = await listUserAccounts();
  const active = accounts.filter((a) => a.status === "active").length;
  const pendingReset = accounts.filter((a) => a.mustChangePassword).length;

  return (
    <>
      <DashboardHeader
        eyebrow="Administration"
        title="User accounts"
        description="Real portal sign-in accounts. Reset a forgotten password (the user must then set a new one) or suspend access."
        badge="Live accounts"
      />

      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        <MetricCard
          label="Accounts"
          value={String(accounts.length)}
          detail="Total sign-in accounts"
          icon={<Users aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Active"
          value={String(active)}
          detail="Can sign in"
          icon={<ShieldCheck aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Pending reset"
          value={String(pendingReset)}
          detail="Must change password"
          icon={<KeyRound aria-hidden="true" className="size-5" />}
        />
      </div>

      <div className="mt-8">
        <DashboardCard
          title="Accounts"
          description="Password resets produce a one-time temporary password shown here."
        >
          <AccountsManager accounts={accounts} currentUserId={session.user.id} />
        </DashboardCard>
      </div>
    </>
  );
}
