"use client";

import { useState, useTransition } from "react";
import { UserPlus } from "lucide-react";

import { createStudentRecord } from "@/app/(portal)/portal/actions/registry";
import {
  FormSection,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/portal/forms/FormField";
import { FormResult, type FormOutcome } from "@/components/portal/forms/FormResult";
import { cn } from "@/lib/utils";

type Option = { readonly id: string; readonly label: string; readonly meta?: string };

type StudentIntakeFormProps = {
  readonly classes: readonly { readonly id: string; readonly name: string; readonly level: string }[];
  readonly parents: readonly Option[];
  readonly routes: readonly Option[];
  readonly suggestedStudentId: string;
};

export function StudentIntakeForm({
  classes,
  parents,
  routes,
  suggestedStudentId,
}: StudentIntakeFormProps) {
  const [guardianIds, setGuardianIds] = useState<readonly string[]>([]);
  const [outcome, setOutcome] = useState<FormOutcome | null>(null);
  const [pending, startTransition] = useTransition();

  function toggleGuardian(id: string) {
    setGuardianIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const value = (key: string) => String(data.get(key) ?? "").trim();
    const classId = value("classId");
    const selectedClass = classes.find((item) => item.id === classId);

    startTransition(async () => {
      const result = await createStudentRecord({
        fullName: value("fullName"),
        studentId: value("studentId"),
        dateOfBirth: value("dateOfBirth"),
        gender: value("gender"),
        classId,
        className: selectedClass?.name ?? "",
        level: selectedClass?.level ?? "",
        admissionDate: value("admissionDate"),
        previousSchool: value("previousSchool"),
        guardianIds,
        guardianName: value("guardianName"),
        guardianRelationship: value("guardianRelationship"),
        guardianPhone: value("guardianPhone"),
        guardianEmail: value("guardianEmail"),
        address: value("address"),
        emergencyContactName: value("emergencyContactName"),
        emergencyContactPhone: value("emergencyContactPhone"),
        medicalNotes: value("medicalNotes"),
        feedingPlan: value("feedingPlan"),
        transportRouteId: value("transportRouteId"),
        status: value("status"),
      });

      setOutcome(result);

      if (result.ok) {
        form.reset();
        setGuardianIds([]);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <FormSection
        title="Learner details"
        description="The identity information that appears on the register and on report cards."
      >
        <TextField
          label="Full name"
          name="fullName"
          required
          placeholder="Surname first, e.g. Mensah Ama"
        />
        <TextField
          label="Student ID"
          name="studentId"
          defaultValue={suggestedStudentId}
          hint="Suggested from the current roll. Change it to match your numbering."
        />
        <TextField label="Date of birth" name="dateOfBirth" type="date" />
        <SelectField
          label="Gender"
          name="gender"
          options={[
            { value: "female", label: "Female" },
            { value: "male", label: "Male" },
            { value: "unspecified", label: "Prefer not to say" },
          ]}
        />
      </FormSection>

      <FormSection
        title="Placement"
        description="Where the learner sits in the school, and where they came from."
      >
        <SelectField
          label="Class"
          name="classId"
          required
          options={classes.map((item) => ({
            value: item.id,
            label: `${item.name} · ${item.level}`,
          }))}
        />
        <TextField label="Admission date" name="admissionDate" type="date" />
        <TextField
          label="Previous school"
          name="previousSchool"
          placeholder="Leave blank for a new entrant"
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

      <section className="border-t border-border pt-6">
        <h3 className="text-base font-extrabold text-charcoal">
          Guardians
        </h3>
        <p className="mt-1 text-sm leading-6 text-muted-grey">
          Link an existing guardian so the family sees this learner in their
          portal, or capture a new contact below.
        </p>

        {parents.length ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {parents.map((parent) => {
              const selected = guardianIds.includes(parent.id);

              return (
                <label
                  key={parent.id}
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
                    onChange={() => toggleGuardian(parent.id)}
                    className="mt-0.5 size-4 accent-[#e07a1f]"
                  />
                  <span>
                    <span className="block text-sm font-bold text-charcoal">
                      {parent.label}
                    </span>
                    {parent.meta ? (
                      <span className="mt-0.5 block text-xs text-muted-grey">
                        {parent.meta}
                      </span>
                    ) : null}
                  </span>
                </label>
              );
            })}
          </div>
        ) : (
          <p className="mt-5 text-sm text-muted-grey">
            No guardians are on file yet. Capture one below and link it later.
          </p>
        )}

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <TextField
            label="New guardian name"
            name="guardianName"
            placeholder="Only if the guardian is not listed above"
          />
          <SelectField
            label="Relationship"
            name="guardianRelationship"
            options={[
              { value: "mother", label: "Mother" },
              { value: "father", label: "Father" },
              { value: "guardian", label: "Guardian" },
              { value: "grandparent", label: "Grandparent" },
              { value: "other", label: "Other relative" },
            ]}
          />
          <TextField
            label="Guardian phone"
            name="guardianPhone"
            type="tel"
            placeholder="+233 20 000 0000"
          />
          <TextField
            label="Guardian email"
            name="guardianEmail"
            type="email"
            placeholder="guardian@example.com"
          />
        </div>
      </section>

      <FormSection
        title="Contact and emergency"
        description="Used by the school office when it needs to reach the family quickly."
      >
        <TextAreaField
          label="Home address"
          name="address"
          className="sm:col-span-2"
          placeholder="House number, street, area, city"
        />
        <TextField
          label="Emergency contact name"
          name="emergencyContactName"
          placeholder="Someone other than the main guardian"
        />
        <TextField
          label="Emergency contact phone"
          name="emergencyContactPhone"
          type="tel"
        />
        <TextAreaField
          label="Medical notes"
          name="medicalNotes"
          className="sm:col-span-2"
          placeholder="Allergies, conditions or medication the school must know about"
        />
      </FormSection>

      <FormSection
        title="School services"
        description="Feeding and transport can be changed later from the learner's record."
      >
        <SelectField
          label="Feeding plan"
          name="feedingPlan"
          options={[
            { value: "none", label: "Not enrolled" },
            { value: "daily", label: "Daily" },
            { value: "weekly", label: "Weekly" },
            { value: "termly", label: "Termly" },
          ]}
        />
        <SelectField
          label="Transport route"
          name="transportRouteId"
          options={[
            { value: "", label: "Not using school transport" },
            ...routes.map((route) => ({ value: route.id, label: route.label })),
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
          {pending ? "Saving…" : "Enrol learner"}
        </button>
        <button
          type="reset"
          onClick={() => {
            setGuardianIds([]);
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
