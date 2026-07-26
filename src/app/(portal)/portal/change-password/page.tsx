import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import { changePortalPassword } from "@/app/(portal)/portal/actions";
import { getMockPortalSession } from "@/lib/portal/mock-session";
import { portalRoutes } from "@/lib/portal/routes";

export const metadata: Metadata = { title: "Change Password" };

const errors: Record<string, string> = {
  "too-short": "Your new password must be at least 8 characters.",
  mismatch: "The new password and confirmation do not match.",
  current: "Your current password is incorrect.",
  reuse: "Choose a password different from your current one.",
  failed: "Could not change your password. Please try again.",
};

type ChangePasswordPageProps = {
  readonly searchParams: Promise<{ error?: string }>;
};

const fieldClass =
  "mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 text-charcoal outline-none transition focus:border-curry-orange focus:ring-4 focus:ring-curry-orange/10";

export default async function ChangePasswordPage({
  searchParams,
}: ChangePasswordPageProps) {
  const session = await getMockPortalSession();
  if (!session) {
    redirect(portalRoutes.login);
  }

  const { error } = await searchParams;
  const forced = session.user.mustChangePassword;
  const errorMessage = error ? errors[error] : undefined;

  return (
    <main className="flex min-h-screen items-center justify-center bg-soft-white px-4 py-10">
      <div className="w-full max-w-md rounded-[2rem] border border-border bg-white p-6 shadow-card sm:p-9">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-soft-cream text-curry-orange">
          <ShieldCheck aria-hidden="true" className="size-6" />
        </div>
        <p className="mt-6 text-sm font-bold tracking-[0.14em] text-curry-orange uppercase">
          Account security
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.03em] text-charcoal">
          {forced ? "Set a new password" : "Change your password"}
        </h1>
        <p className="mt-3 leading-7 text-muted-grey">
          {forced
            ? "Your password was reset by an administrator. Choose a new password to continue."
            : "Update the password for your portal account."}
        </p>

        {errorMessage ? (
          <p
            role="alert"
            className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
          >
            {errorMessage}
          </p>
        ) : null}

        <form action={changePortalPassword} className="mt-7 space-y-4">
          <label className="block text-sm font-bold text-charcoal">
            Current password
            <input
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              required
              className={fieldClass}
            />
          </label>
          <label className="block text-sm font-bold text-charcoal">
            New password{" "}
            <span className="font-normal text-muted-grey">
              — at least 8 characters
            </span>
            <input
              name="newPassword"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              className={fieldClass}
            />
          </label>
          <label className="block text-sm font-bold text-charcoal">
            Confirm new password
            <input
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              className={fieldClass}
            />
          </label>
          <button
            type="submit"
            className="mt-2 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-curry-orange px-6 font-bold text-white transition-colors hover:bg-deep-orange"
          >
            Save new password
          </button>
        </form>
      </div>
    </main>
  );
}
