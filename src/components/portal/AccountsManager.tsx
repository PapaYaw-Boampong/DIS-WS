"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, ShieldBan, ShieldCheck } from "lucide-react";

import { StatusBadge } from "@/components/portal/StatusBadge";
import {
  resetUserPassword,
  setUserStatus,
} from "@/app/(portal)/portal/actions/accounts";
import type { UserAccount } from "@/lib/portal/data/accounts";

type AccountsManagerProps = {
  readonly accounts: readonly UserAccount[];
  readonly currentUserId: string;
};

const statusVariant = {
  active: "success",
  inactive: "neutral",
  suspended: "danger",
} as const;

export function AccountsManager({
  accounts,
  currentUserId,
}: AccountsManagerProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [tempPasswords, setTempPasswords] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);

  function handleReset(account: UserAccount) {
    setMessage(null);
    startTransition(async () => {
      const result = await resetUserPassword(account.id);
      const tempPassword = result.tempPassword;
      if (!result.ok || !tempPassword) {
        setMessage(
          result.error === "backend_required"
            ? "Resetting passwords requires the live backend."
            : "Could not reset the password.",
        );
        return;
      }
      setTempPasswords((prev) => ({ ...prev, [account.id]: tempPassword }));
      router.refresh();
    });
  }

  function handleStatus(account: UserAccount, suspend: boolean) {
    startTransition(async () => {
      await setUserStatus(account.id, suspend ? "suspended" : "active");
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {message ? (
        <p
          role="status"
          className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700"
        >
          {message}
        </p>
      ) : null}

      <ul className="divide-y divide-border">
        {accounts.length === 0 ? (
          <li className="py-6 text-sm text-muted-grey">
            No accounts found. (Real accounts appear here when the backend is
            connected.)
          </li>
        ) : (
          accounts.map((account) => {
            const temp = tempPasswords[account.id];
            const isSelf = account.id === currentUserId;
            return (
              <li key={account.id} className="py-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-charcoal">
                        {account.name}
                      </span>
                      <StatusBadge variant={statusVariant[account.status]}>
                        {account.status}
                      </StatusBadge>
                      <span className="rounded-full bg-soft-cream px-2.5 py-0.5 text-xs font-bold text-deep-orange capitalize">
                        {account.role}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-sm text-muted-grey">
                      {account.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleReset(account)}
                      disabled={pending}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-bold text-charcoal transition-colors hover:border-curry-orange disabled:opacity-60"
                    >
                      <KeyRound aria-hidden="true" className="size-3.5" />
                      Reset password
                    </button>
                    {account.status === "suspended" ? (
                      <button
                        type="button"
                        onClick={() => handleStatus(account, false)}
                        disabled={pending}
                        className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 px-3 py-1.5 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-50 disabled:opacity-60"
                      >
                        <ShieldCheck aria-hidden="true" className="size-3.5" />
                        Activate
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleStatus(account, true)}
                        disabled={pending || isSelf}
                        title={isSelf ? "You cannot suspend your own account." : undefined}
                        className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-3 py-1.5 text-xs font-bold text-red-700 transition-colors hover:bg-red-50 disabled:opacity-40"
                      >
                        <ShieldBan aria-hidden="true" className="size-3.5" />
                        Suspend
                      </button>
                    )}
                  </div>
                </div>

                {temp ? (
                  <div className="mt-3 rounded-2xl border border-curry-orange/25 bg-soft-cream p-4">
                    <p className="text-sm font-semibold text-charcoal">
                      Temporary password (shown once) — give this to{" "}
                      {account.name}. They must change it on next sign-in.
                    </p>
                    <code className="mt-2 inline-block rounded-lg border border-border bg-white px-3 py-1.5 text-base font-bold tracking-wide text-deep-orange">
                      {temp}
                    </code>
                  </div>
                ) : null}
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
