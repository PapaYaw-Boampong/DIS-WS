"use client";

import { useState, useTransition } from "react";
import { KeyRound, ShieldCheck, ShieldOff } from "lucide-react";

import {
  confirmMfaSetup,
  disableMfa,
  regenerateBackupCodes,
  startMfaSetup,
  type MfaStatus,
} from "@/app/(portal)/portal/actions/mfa";
import { cn } from "@/lib/utils";

type MfaManagerProps = {
  readonly status: MfaStatus;
};

const fieldClass =
  "mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal tabular-nums";

function Notice({
  children,
  failed,
}: {
  readonly children: React.ReactNode;
  readonly failed?: boolean;
}) {
  return (
    <p
      role="status"
      className={cn(
        "mt-5 rounded-2xl border p-4 text-sm leading-6 font-semibold text-charcoal",
        failed ? "border-red-300 bg-red-50" : "border-curry-orange/25 bg-soft-cream",
      )}
    >
      {children}
    </p>
  );
}

// Backup codes are displayed exactly once. The copy says so plainly, because a
// user who closes this panel without saving them has no second route in.
function BackupCodes({ codes }: { readonly codes: readonly string[] }) {
  return (
    <div className="mt-5 rounded-2xl border border-curry-orange/40 bg-soft-cream p-4">
      <p className="font-bold text-charcoal">
        Save these recovery codes somewhere safe
      </p>
      <p className="mt-1 text-sm leading-6 text-muted-grey">
        Each one works once, and only if you lose your phone. They are shown now
        and never again — if you lose both your phone and these codes, the
        school office has to reset your account.
      </p>
      <ul className="mt-4 grid grid-cols-2 gap-2 font-mono text-sm font-bold text-charcoal sm:grid-cols-3">
        {codes.map((code) => (
          <li key={code} className="rounded-xl bg-white px-3 py-2 text-center">
            {code}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MfaManager({ status }: MfaManagerProps) {
  const [enabled, setEnabled] = useState(status.enabled);
  const [remaining, setRemaining] = useState(status.backupCodesRemaining);
  const [secret, setSecret] = useState<string | null>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [codes, setCodes] = useState<readonly string[] | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [pending, startTransition] = useTransition();

  function begin() {
    startTransition(async () => {
      const result = await startMfaSetup();
      if (!result.ok) {
        setFailed(true);
        setMessage(result.message);
        return;
      }
      setFailed(false);
      setMessage(null);
      setSecret(result.secret);
      setUri(result.otpauthUri);
    });
  }

  function confirm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = String(new FormData(event.currentTarget).get("code") ?? "");
    startTransition(async () => {
      const result = await confirmMfaSetup(code);
      if (!result.ok) {
        setFailed(true);
        setMessage(result.message);
        return;
      }
      setFailed(false);
      setEnabled(true);
      setSecret(null);
      setUri(null);
      setCodes(result.backupCodes);
      setRemaining(result.backupCodes.length);
      setMessage("Two-step sign-in is on. You will be asked for a code each time you sign in.");
    });
  }

  function regenerate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const code = String(new FormData(form).get("code") ?? "");
    startTransition(async () => {
      const result = await regenerateBackupCodes(code);
      setFailed(!result.ok);
      if (!result.ok) {
        setMessage(result.message);
        return;
      }
      setCodes(result.backupCodes);
      setRemaining(result.backupCodes.length);
      setMessage("New recovery codes issued. The previous set no longer works.");
      form.reset();
    });
  }

  function turnOff(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await disableMfa(
        String(data.get("password") ?? ""),
        String(data.get("code") ?? ""),
      );
      setFailed(!result.ok);
      setMessage(result.message);
      if (result.ok) {
        setEnabled(false);
        setCodes(null);
        setRemaining(0);
      }
    });
  }

  if (!status.available) {
    return (
      <p className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
        Two-step sign-in protects real accounts, so it needs the school database.
        It is unavailable while the portal is running on sample data.
      </p>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        {enabled ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">
            <ShieldCheck aria-hidden="true" className="size-4" />
            Two-step sign-in is on
          </span>
        ) : (
          <span className="inline-flex items-center gap-2 rounded-full bg-soft-white px-4 py-2 text-sm font-bold text-muted-grey">
            <ShieldOff aria-hidden="true" className="size-4" />
            Two-step sign-in is off
          </span>
        )}
        {enabled ? (
          <span className="text-sm text-muted-grey">
            {remaining} recovery code{remaining === 1 ? "" : "s"} left
          </span>
        ) : null}
      </div>

      {!enabled && !secret ? (
        <div className="mt-5">
          <p className="text-sm leading-6 text-muted-grey">
            Adds a six-digit code from your phone to your password. Anyone who
            learns your password still cannot sign in without your phone.
          </p>
          <button
            type="button"
            onClick={begin}
            disabled={pending}
            className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-full bg-curry-orange px-6 font-bold text-white transition-colors hover:bg-deep-orange disabled:opacity-40"
          >
            <ShieldCheck aria-hidden="true" className="size-5" />
            {pending ? "Preparing…" : "Set up two-step sign-in"}
          </button>
        </div>
      ) : null}

      {secret && uri ? (
        <div className="mt-5 rounded-2xl border border-border bg-soft-white p-4">
          <p className="font-bold text-charcoal">
            1. Add this account to your authenticator app
          </p>
          <p className="mt-1 text-sm leading-6 text-muted-grey">
            Use Google Authenticator, Microsoft Authenticator, Authy or your
            password manager. Choose &ldquo;enter a setup key&rdquo; and type
            the key below.
          </p>
          <p className="mt-3 rounded-xl bg-white px-4 py-3 font-mono text-sm font-bold break-all text-charcoal">
            {secret}
          </p>
          <details className="mt-3">
            <summary className="cursor-pointer text-sm font-bold text-deep-orange">
              Or copy the full setup link
            </summary>
            <p className="mt-2 rounded-xl bg-white px-4 py-3 font-mono text-xs break-all text-muted-grey">
              {uri}
            </p>
          </details>

          <form onSubmit={confirm} className="mt-5">
            <label className="block text-sm font-bold text-charcoal">
              2. Enter the six-digit code your app now shows
              <input
                name="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="000000"
                className={fieldClass}
              />
            </label>
            <button
              type="submit"
              disabled={pending}
              className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-full bg-curry-orange px-6 font-bold text-white transition-colors hover:bg-deep-orange disabled:opacity-40"
            >
              {pending ? "Checking…" : "Turn on two-step sign-in"}
            </button>
          </form>
        </div>
      ) : null}

      {codes ? <BackupCodes codes={codes} /> : null}

      {enabled ? (
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <form onSubmit={regenerate}>
            <p className="font-bold text-charcoal">New recovery codes</p>
            <p className="mt-1 text-sm leading-6 text-muted-grey">
              Issues a fresh set and cancels the old one.
            </p>
            <label className="mt-3 block text-sm font-bold text-charcoal">
              Current code from your app
              <input
                name="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="000000"
                className={fieldClass}
              />
            </label>
            <button
              type="submit"
              disabled={pending}
              className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-5 text-sm font-bold text-charcoal transition-colors hover:bg-soft-white disabled:opacity-40"
            >
              <KeyRound aria-hidden="true" className="size-4" />
              Issue new codes
            </button>
          </form>

          <form onSubmit={turnOff}>
            <p className="font-bold text-charcoal">Turn off two-step sign-in</p>
            <p className="mt-1 text-sm leading-6 text-muted-grey">
              Needs both your password and a current code, so nobody who has
              only borrowed your screen can remove it.
            </p>
            <label className="mt-3 block text-sm font-bold text-charcoal">
              Password
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                className="mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal"
              />
            </label>
            <label className="mt-3 block text-sm font-bold text-charcoal">
              Current code from your app
              <input
                name="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="000000"
                className={fieldClass}
              />
            </label>
            <button
              type="submit"
              disabled={pending}
              className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-red-300 px-5 text-sm font-bold text-red-700 transition-colors hover:bg-red-50 disabled:opacity-40"
            >
              <ShieldOff aria-hidden="true" className="size-4" />
              Turn off
            </button>
          </form>
        </div>
      ) : null}

      {message ? <Notice failed={failed}>{message}</Notice> : null}
    </div>
  );
}
