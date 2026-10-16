import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { ShieldCheck } from "lucide-react";

import { verifyMfaCode } from "@/app/(portal)/portal/actions";
import { MFA_CHALLENGE_COOKIE } from "@/lib/portal/auth-config";
import { getMockPortalSession } from "@/lib/portal/mock-session";
import { portalRoutes } from "@/lib/portal/routes";

export const metadata: Metadata = { title: "Verification Code" };

type VerifyPageProps = {
  readonly searchParams?: Promise<{ error?: string }>;
};

/**
 * Second step of a two-factor sign-in. Reachable only while an unredeemed
 * challenge cookie exists — there is no session yet, so this page is not
 * inside the portal workspace layout.
 */
export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const session = await getMockPortalSession();
  if (session) {
    redirect(portalRoutes.dashboard(session.user.role));
  }

  const challenge = (await cookies()).get(MFA_CHALLENGE_COOKIE)?.value;
  if (!challenge) {
    redirect(`${portalRoutes.login}?error=challenge-expired`);
  }

  const error = (await searchParams)?.error;

  return (
    <main className="flex min-h-screen items-center justify-center bg-soft-white p-6">
      <div className="w-full max-w-md rounded-3xl border border-border bg-white p-8 shadow-sm">
        <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-soft-cream text-curry-orange">
          <ShieldCheck aria-hidden="true" className="size-6" />
        </span>

        <h1 className="mt-5 text-2xl font-extrabold tracking-[-0.03em] text-charcoal">
          Enter your code
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-grey">
          Your password was accepted. Open your authenticator app and enter the
          six-digit code it is showing now. You can also use one of your
          recovery codes.
        </p>

        {error ? (
          <p
            role="alert"
            className="mt-5 rounded-2xl border border-red-300 bg-red-50 p-4 text-sm font-semibold text-charcoal"
          >
            That code was not accepted. Codes change every 30 seconds — check
            your app and enter the current one.
          </p>
        ) : null}

        <form action={verifyMfaCode} className="mt-6">
          <label className="block text-sm font-bold text-charcoal">
            Six-digit code
            <input
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              placeholder="000000"
              className="mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 text-center text-lg font-bold tracking-[0.3em] tabular-nums"
            />
          </label>

          <button
            type="submit"
            className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-curry-orange px-6 font-bold text-white transition-colors hover:bg-deep-orange"
          >
            Verify and sign in
          </button>
        </form>

        <p className="mt-6 text-sm text-muted-grey">
          Lost your phone and your recovery codes? The school office can reset
          two-step sign-in for your account.
        </p>
        <Link
          href={portalRoutes.login}
          className="mt-3 inline-flex text-sm font-bold text-deep-orange transition-colors hover:text-curry-orange"
        >
          Back to sign in
        </Link>
      </div>
    </main>
  );
}
