"use client";

import { useState, useTransition } from "react";
import { UserPlus } from "lucide-react";

import { createStaffRecord } from "@/app/(portal)/portal/actions/registry";
import {
  FormSection,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/portal/forms/FormField";
import { FormResult, type FormOutcome } from "@/components/portal/forms/FormResult";
import { cn } from "@/lib/utils";

type StaffIntakeFormProps = {
  readonly classes: readonly { readonly id: string; readonly name: string }[];
  readonly subjects: readonly { readonly id: string; readonly name: string }[];
  readonly suggestedStaffId: string;
};

export function StaffIntakeForm({
  classes,
  subjects,
  suggestedStaffId,
}: StaffIntakeFormProps) {
  const [classIds, setClassIds] = useState<readonly string[]>([]);
  const [subjectIds, setSubjectIds] = useState<readonly string[]>([]);
  const [outcome, setOutcome] = useState<FormOutcome | null>(null);
  const [pending, startTransition] = useTransition();

  function toggle(
    id: string,
    values: readonly string[],
    setValues: (next: readonly string[]) => void,
  ) {
    setValues(
      values.includes(id) ? values.filter((item) => item !== id) : [...values, id],
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const value = (key: string) => String(data.get(key) ?? "").trim();

    startTransition(async () => {
      const result = await createStaffRecord({
        fullName: value("fullName"),
        staffId: value("staffId"),
        title: value("title"),
        department: value("department"),
        employmentType: value("employmentType"),
        startDate: value("startDate"),
        qualification: value("qualification"),
        phone: value("phone"),
        email: value("email"),
        address: value("address"),
        classIds,
        subjectIds,
        portalRole: value("portalRole"),
        status: value("status"),
      });

      setOutcome(result);

      if (result.ok) {
        form.reset();
        setClassIds([]);
        setSubjectIds([]);
      }
    });
  }

  function chipList(
    label: string,
    options: readonly { readonly id: string; readonly name: string }[],
    values: readonly string[],
    setValues: (next: readonly string[]) => void,
  ) {
    return (
      <div>
        <p className="text-sm font-bold text-charcoal">{label}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {options.map((option) => {
            const selected = values.includes(option.id);

            return (
              <label
                key={option.id}
                className={cn(
                  "cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                  selected
                    ? "border-curry-orange bg-curry-orange text-white"
                    : "border-border bg-white text-charcoal hover:border-curry-orange/40",
                )}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => toggle(option.id, values, setValues)}
                  className="sr-only"
                />
                {option.name}
              </label>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <FormSection
        title="Staff details"
        description="The record the school keeps for this member of staff."
      >
        <TextField label="Full name" name="fullName" required />
        <TextField
          label="Staff ID"
          name="staffId"
          defaultValue={suggestedStaffId}
          hint="Suggested from the current staff list."
        />
        <TextField
          label="Job title"
          name="title"
          required
          placeholder="e.g. Class Teacher, Primary 6"
        />
        <SelectField
          label="Department"
          name="department"
          options={[
            { value: "early_years", label: "Early Years" },
            { value: "primary", label: "Primary" },
            { value: "junior_high", label: "Junior High" },
            { value: "administration", label: "Administration" },
            { value: "finance", label: "Finance" },
            { value: "transport", label: "Transport" },
            { value: "support", label: "Support services" },
          ]}
        />
      </FormSection>

      <FormSection
        title="Employment"
        description="Used for staff reporting and payroll handover."
      >
        <SelectField
          label="Employment type"
          name="employmentType"
          options={[
            { value: "full_time", label: "Full time" },
            { value: "part_time", label: "Part time" },
            { value: "contract", label: "Contract" },
            { value: "national_service", label: "National service" },
          ]}
        />
        <TextField label="Start date" name="startDate" type="date" />
        <TextField
          label="Highest qualification"
          name="qualification"
          placeholder="e.g. B.Ed Basic Education"
        />
        <SelectField
          label="Record status"
          name="status"
          options={[
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ]}
        />
      </FormSection>

      <FormSection title="Contact">
        <TextField label="Phone" name="phone" type="tel" />
        <TextField label="Email" name="email" type="email" />
        <TextAreaField
          label="Home address"
          name="address"
          className="sm:col-span-2"
        />
      </FormSection>

      <section className="space-y-6 border-t border-border pt-6">
        <div>
          <h3 className="text-base font-extrabold text-charcoal">Teaching load</h3>
          <p className="mt-1 text-sm leading-6 text-muted-grey">
            Classes and subjects decide which registers, gradebooks and report
            cards this member of staff can open.
          </p>
        </div>
        {chipList("Classes", classes, classIds, setClassIds)}
        {chipList("Subjects", subjects, subjectIds, setSubjectIds)}
      </section>

      <FormSection
        title="Portal access"
        description="The portal role decides which workspace they sign in to."
      >
        <SelectField
          label="Portal role"
          name="portalRole"
          options={[
            { value: "staff", label: "Staff" },
            { value: "admin", label: "School Admin" },
            { value: "registry", label: "Registry" },
            { value: "accounts", label: "Accounts" },
            { value: "transport", label: "Transport" },
            { value: "none", label: "No portal account" },
          ]}
        />
      </FormSection>

      <div className="flex flex-wrap items-center gap-4 border-t border-border pt-6">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-12 items-center gap-2 rounded-full bg-curry-orange px-6 font-bold text-white transition-colors hover:bg-deep-orange disabled:opacity-50"
        >
          <UserPlus aria-hidden="true" className="size-5" />
          {pending ? "Saving…" : "Add staff record"}
        </button>
        <button
          type="reset"
          onClick={() => {
            setClassIds([]);
            setSubjectIds([]);
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
