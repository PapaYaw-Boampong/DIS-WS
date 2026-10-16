"use client";

import { useState, useTransition } from "react";
import { UserPlus } from "lucide-react";

import { createParentRecord } from "@/app/(portal)/portal/actions/registry";
import {
  FormSection,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/portal/forms/FormField";
import { FormResult, type FormOutcome } from "@/components/portal/forms/FormResult";
import { cn } from "@/lib/utils";

type ParentIntakeFormProps = {
  readonly students: readonly {
    readonly id: string;
    readonly label: string;
    readonly meta?: string;
  }[];
};

export function ParentIntakeForm({ students }: ParentIntakeFormProps) {
  const [childIds, setChildIds] = useState<readonly string[]>([]);
  const [createAccount, setCreateAccount] = useState(true);
  const [outcome, setOutcome] = useState<FormOutcome | null>(null);
  const [pending, startTransition] = useTransition();

  function toggleChild(id: string) {
    setChildIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const value = (key: string) => String(data.get(key) ?? "").trim();

    startTransition(async () => {
      const result = await createParentRecord({
        fullName: value("fullName"),
        relationship: value("relationship"),
        phone: value("phone"),
        alternatePhone: value("alternatePhone"),
        email: value("email"),
        address: value("address"),
        occupation: value("occupation"),
        idType: value("idType"),
        idNumber: value("idNumber"),
        childIds,
        createPortalAccount: createAccount,
        status: value("status"),
      });

      setOutcome(result);

      if (result.ok) {
        form.reset();
        setChildIds([]);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <FormSection
        title="Guardian details"
        description="The adult the school contacts about a learner."
      >
        <TextField label="Full name" name="fullName" required />
        <SelectField
          label="Relationship to learner"
          name="relationship"
          options={[
            { value: "mother", label: "Mother" },
            { value: "father", label: "Father" },
            { value: "guardian", label: "Guardian" },
            { value: "grandparent", label: "Grandparent" },
            { value: "other", label: "Other relative" },
          ]}
        />
        <TextField label="Occupation" name="occupation" />
        <SelectField
          label="Record status"
          name="status"
          options={[
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ]}
        />
      </FormSection>

      <FormSection
        title="Contact"
        description="At least one reachable phone number is required."
      >
        <TextField
          label="Primary phone"
          name="phone"
          type="tel"
          required
          placeholder="+233 20 000 0000"
        />
        <TextField label="Alternate phone" name="alternatePhone" type="tel" />
        <TextField
          label="Email"
          name="email"
          type="email"
          hint="Used for the portal account and school notices."
        />
        <TextAreaField label="Home address" name="address" />
      </FormSection>

      <FormSection
        title="Identification"
        description="Recorded for collection authorisation at the school gate."
      >
        <SelectField
          label="ID type"
          name="idType"
          options={[
            { value: "ghana_card", label: "Ghana Card" },
            { value: "passport", label: "Passport" },
            { value: "voter_id", label: "Voter ID" },
            { value: "drivers_licence", label: "Driver's licence" },
            { value: "none", label: "Not provided" },
          ]}
        />
        <TextField label="ID number" name="idNumber" />
      </FormSection>

      <section className="border-t border-border pt-6">
        <h3 className="text-base font-extrabold text-charcoal">
          Linked learners
        </h3>
        <p className="mt-1 text-sm leading-6 text-muted-grey">
          Every learner ticked here appears in this guardian&apos;s portal, with
          their fees, results and transport.
        </p>

        {students.length ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {students.map((student) => {
              const selected = childIds.includes(student.id);

              return (
                <label
                  key={student.id}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors",
                    selected
                      ? "border-curry-orange bg-soft-cream"
                      : "border-border bg-soft-white hover:border-curry-orange/40",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleChild(student.id)}
                    className="mt-0.5 size-4 accent-[#e07a1f]"
                  />
                  <span>
                    <span className="block text-sm font-bold text-charcoal">
                      {student.label}
                    </span>
                    {student.meta ? (
                      <span className="mt-0.5 block text-xs text-muted-grey">
                        {student.meta}
                      </span>
                    ) : null}
                  </span>
                </label>
              );
            })}
          </div>
        ) : (
          <p className="mt-5 text-sm text-muted-grey">
            No learners are on the register yet.
          </p>
        )}

        <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-soft-white p-4">
          <input
            type="checkbox"
            checked={createAccount}
            onChange={() => setCreateAccount((value) => !value)}
            className="mt-0.5 size-4 accent-[#e07a1f]"
          />
          <span>
            <span className="block text-sm font-bold text-charcoal">
              Request a portal account
            </span>
            <span className="mt-0.5 block text-xs leading-5 text-muted-grey">
              The developer portal issues the credentials; the guardian sets
              their own password on first sign-in.
            </span>
          </span>
        </label>
      </section>

      <div className="flex flex-wrap items-center gap-4 border-t border-border pt-6">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-12 items-center gap-2 rounded-full bg-curry-orange px-6 font-bold text-white transition-colors hover:bg-deep-orange disabled:opacity-50"
        >
          <UserPlus aria-hidden="true" className="size-5" />
          {pending ? "Saving…" : "Add guardian"}
        </button>
        <button
          type="reset"
          onClick={() => {
            setChildIds([]);
            setOutcome(null);
          }}
          className="inline-flex min-h-12 items-center rounded-full border border-border px-5 text-sm font-bold text-charcoal transition-colors hover:bg-soft-white"
        >
          Clear form
        </button>
      </div>

      <FormResult outcome={outcome} />
    </form>
  );
}
