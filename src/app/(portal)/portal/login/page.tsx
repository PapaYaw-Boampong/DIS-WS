import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";

import { loginWithMockAccount } from "@/app/(portal)/portal/actions";
import { mockPortalUsers } from "@/data/portal/users";
import { school } from "@/data/school";
import { getMockPortalSession } from "@/lib/portal/mock-session";
import {
  isPortalRole,
  portalRoleLabels,
} from "@/lib/portal/roles";
import { portalRoutes } from "@/lib/portal/routes";
import { portalRoles, type PortalRole } from "@/types/portal";

export const metadata: Metadata = {
  title: "Portal Login",
};

type PortalLoginPageProps = {
  readonly searchParams: Promise<{
    role?: string;
    error?: string;
  }>;
};

const loginErrors: Record<string, string> = {
  "invalid-role": "Choose a valid portal role to continue.",
  "account-unavailable": "The selected mock account is not available.",
};

export default async function PortalLoginPage({
  searchParams,
}: PortalLoginPageProps) {
  const session = await getMockPortalSession();

  if (session) {
    redirect(portalRoutes.dashboard(session.user.role));
  }

  const query = await searchParams;
  const selectedRole: PortalRole =
    query.role && isPortalRole(query.role) ? query.role : "student";
  const errorMessage = query.error ? loginErrors[query.error] : undefined;

  return (
    <main className="min-h-screen bg-soft-white lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(34rem,1.1fr)]">
      <section className="relative hidden overflow-hidden bg-slate-900 p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div
          className="absolute -right-32 -bottom-28 size-[420px] rounded-full border-[74px] border-curry-orange/10"
          aria-hidden="true"
        />
        <Link
          href="/"
          className="relative flex w-fit items-center gap-3"
          aria-label={`${school.name} home`}
        >
          <Image
            src="/images/brand/dis-logo.png"
            alt=""
            width={58}
            height={50}
            quality={90}
            className="h-12 w-auto"
          />
          <span className="max-w-56 text-xl leading-tight font-extrabold">
            {school.name}
          </span>
        </Link>

        <div className="relative max-w-xl">
          <p className="text-sm font-bold tracking-[0.18em] text-curry-orange uppercase">
            Portal Foundation
          </p>
          <h1 className="mt-5 text-5xl leading-[1.05] font-extrabold tracking-[-0.04em]">
            One secure starting point for every school role.
          </h1>
          <p className="mt-6 text-lg leading-8 text-white/70">
            This first development phase establishes the portal shell,
            role-based navigation and protected mock sessions before backend
            integration begins.
          </p>
          <ul className="mt-10 space-y-4 text-sm font-semibold text-white/85">
            {[
              "Mock accounts only — no sensitive school data",
              "Role-aware routes and navigation",
              "Frontend prepared for a separate backend API",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <CheckCircle2
                  aria-hidden="true"
                  className="size-5 shrink-0 text-curry-orange"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-white/50">{school.motto}</p>
      </section>

      <section className="flex min-h-screen items-center px-4 py-10 sm:px-8 lg:px-12 xl:px-20">
        <div className="mx-auto w-full max-w-xl">
          <Link
            href={portalRoutes.landing}
            className="inline-flex items-center gap-2 text-sm font-bold text-deep-orange hover:underline"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Back to portal overview
          </Link>

          <div className="mt-8 rounded-[2rem] border border-border bg-white p-6 shadow-card sm:p-9">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-soft-cream text-curry-orange">
              <ShieldCheck aria-hidden="true" className="size-6" />
            </div>
            <p className="mt-6 text-sm font-bold tracking-[0.14em] text-curry-orange uppercase">
              Mock authentication
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.03em] text-charcoal">
              Choose a portal role
            </h2>
            <p className="mt-3 leading-7 text-muted-grey">
              Select a demo account to enter the protected portal shell. No
              password, live account or backend request is used.
            </p>

            {errorMessage ? (
              <p
                role="alert"
                className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
              >
                {errorMessage}
              </p>
            ) : null}

            <form action={loginWithMockAccount} className="mt-7">
              <label
                htmlFor="portal-role"
                className="text-sm font-bold text-charcoal"
              >
                Portal role
              </label>
              <select
                id="portal-role"
                name="role"
                defaultValue={selectedRole}
                className="mt-2 min-h-13 w-full rounded-2xl border border-border bg-white px-4 text-charcoal outline-none transition focus:border-curry-orange focus:ring-4 focus:ring-curry-orange/10"
              >
                {portalRoles.map((role) => (
                  <option key={role} value={role}>
                    {portalRoleLabels[role]}
                  </option>
                ))}
              </select>

              <p className="mt-3 text-sm leading-6 text-muted-grey">
                Each option maps to one fictional active account. Changing the
                role changes the protected dashboard opened after submission.
              </p>

              <button
                type="submit"
                className="mt-6 inline-flex min-h-13 w-full items-center justify-center rounded-full bg-curry-orange px-6 font-bold text-white transition-colors hover:bg-deep-orange"
              >
                Continue with mock access
              </button>
            </form>
          </div>

          <div className="mt-6 rounded-3xl border border-border bg-white p-5">
            <p className="text-xs font-bold tracking-[0.12em] text-muted-grey uppercase">
              Available demo accounts
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {mockPortalUsers.map((user) => (
                <div key={user.id} className="rounded-2xl bg-soft-white p-3">
                  <p className="text-sm font-bold text-charcoal">
                    {portalRoleLabels[user.role]}
                  </p>
                  <p className="mt-1 truncate text-xs text-muted-grey">
                    {user.email}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
