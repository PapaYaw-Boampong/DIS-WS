"use client";

import {
  type ChangeEvent,
  type FormEvent,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { routes } from "@/lib/routes";
import type {
  AdmissionsEnquiryErrors,
  AdmissionsEnquiryValues,
} from "@/types/content";

const initialValues: AdmissionsEnquiryValues = {
  guardianName: "",
  email: "",
  phone: "",
  learnerName: "",
  academicLevel: "",
  message: "",
};

const inputClasses =
  "mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 text-charcoal outline-none transition-colors placeholder:text-muted-grey/70 focus:border-curry-orange";

function validate(values: AdmissionsEnquiryValues) {
  const errors: AdmissionsEnquiryErrors = {};

  if (!values.guardianName.trim()) {
    errors.guardianName = "Enter the parent or guardian name.";
  }
  if (!values.email.trim()) {
    errors.email = "Enter an email address.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (!values.phone.trim()) {
    errors.phone = "Enter a phone number.";
  }
  if (!values.learnerName.trim()) {
    errors.learnerName = "Enter the learner's name.";
  }
  if (!values.academicLevel) {
    errors.academicLevel = "Select an academic level.";
  }

  return errors;
}

export function AdmissionsEnquiryForm() {
  const [values, setValues] =
    useState<AdmissionsEnquiryValues>(initialValues);
  const [errors, setErrors] = useState<AdmissionsEnquiryErrors>({});
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const guardianNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const learnerNameRef = useRef<HTMLInputElement>(null);
  const academicLevelRef = useRef<HTMLSelectElement>(null);

  const fieldRefs = {
    guardianName: guardianNameRef,
    email: emailRef,
    phone: phoneRef,
    learnerName: learnerNameRef,
    academicLevel: academicLevelRef,
  };

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    const field = event.target.name as keyof AdmissionsEnquiryValues;

    setValues((current) => ({
      ...current,
      [field]: event.target.value,
    }));
    setErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors[field];
      return nextErrors;
    });
    setStatus("idle");
    setStatusMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validate(values);
    const firstInvalidField = (
      [
        "guardianName",
        "email",
        "phone",
        "learnerName",
        "academicLevel",
      ] as const
    ).find((field) => nextErrors[field]);

    setErrors(nextErrors);

    if (firstInvalidField) {
      fieldRefs[firstInvalidField].current?.focus();
      return;
    }

    setStatus("submitting");
    setStatusMessage("");

    try {
      const response = await fetch("/api/admissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, website }),
      });
      const result = (await response.json()) as {
        message?: string;
      };

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to submit your enquiry.",
        );
      }

      setValues(initialValues);
      setWebsite("");
      setStatus("success");
      setStatusMessage(
        "Your admissions enquiry has been sent. The school team will contact your family with the next steps.",
      );
    } catch (error) {
      setStatus("error");
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Unable to submit your enquiry.",
      );
    }
  }

  return (
    <section
      id="application-enquiry"
      className="scroll-mt-24 bg-soft-white py-20 sm:py-24 lg:py-28"
    >
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <SectionHeader
              eyebrow="Start Here"
              title="Application enquiry"
              description="Tell us how Admissions can help. This enquiry does not replace the school's official application form."
            />
            <div className="mt-8 rounded-card border border-curry-orange/20 bg-soft-cream p-6">
              <h3 className="font-bold text-charcoal">What happens next?</h3>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-grey">
                <li>Admissions confirms the appropriate application steps.</li>
                <li>Your family receives the current document requirements.</li>
                <li>Any visit, assessment or interview is arranged directly.</li>
              </ul>
              <p className="mt-5 text-sm leading-6 text-muted-grey">
                Need direct assistance?{" "}
                <Link
                  href={routes.contact}
                  className="font-bold text-curry-orange hover:text-deep-orange"
                >
                  Contact Admissions
                </Link>
                .
              </p>
            </div>
          </div>

          <form
            noValidate
            onSubmit={handleSubmit}
            aria-busy={status === "submitting"}
            className="rounded-[2rem] border border-border bg-white p-6 shadow-card sm:p-8"
          >
            <div className="absolute -left-[9999px]" aria-hidden="true">
              <label htmlFor="admissions-website">Website</label>
              <input
                id="admissions-website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
              />
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  htmlFor="guardianName"
                  className="text-sm font-bold text-charcoal"
                >
                  Parent or guardian name
                </label>
                <input
                  ref={guardianNameRef}
                  id="guardianName"
                  name="guardianName"
                  type="text"
                  autoComplete="name"
                  value={values.guardianName}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.guardianName)}
                  aria-describedby={
                    errors.guardianName ? "guardianName-error" : undefined
                  }
                  className={inputClasses}
                />
                {errors.guardianName ? (
                  <p
                    id="guardianName-error"
                    className="mt-2 text-sm font-medium text-deep-orange"
                  >
                    {errors.guardianName}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="text-sm font-bold text-charcoal"
                >
                  Email address
                </label>
                <input
                  ref={emailRef}
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={values.email}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className={inputClasses}
                />
                {errors.email ? (
                  <p
                    id="email-error"
                    className="mt-2 text-sm font-medium text-deep-orange"
                  >
                    {errors.email}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="text-sm font-bold text-charcoal"
                >
                  Phone number
                </label>
                <input
                  ref={phoneRef}
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={values.phone}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={errors.phone ? "phone-error" : undefined}
                  className={inputClasses}
                />
                {errors.phone ? (
                  <p
                    id="phone-error"
                    className="mt-2 text-sm font-medium text-deep-orange"
                  >
                    {errors.phone}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="learnerName"
                  className="text-sm font-bold text-charcoal"
                >
                  Learner name
                </label>
                <input
                  ref={learnerNameRef}
                  id="learnerName"
                  name="learnerName"
                  type="text"
                  autoComplete="off"
                  value={values.learnerName}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.learnerName)}
                  aria-describedby={
                    errors.learnerName ? "learnerName-error" : undefined
                  }
                  className={inputClasses}
                />
                {errors.learnerName ? (
                  <p
                    id="learnerName-error"
                    className="mt-2 text-sm font-medium text-deep-orange"
                  >
                    {errors.learnerName}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="academicLevel"
                  className="text-sm font-bold text-charcoal"
                >
                  Academic level
                </label>
                <select
                  ref={academicLevelRef}
                  id="academicLevel"
                  name="academicLevel"
                  value={values.academicLevel}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.academicLevel)}
                  aria-describedby={
                    errors.academicLevel ? "academicLevel-error" : undefined
                  }
                  className={inputClasses}
                >
                  <option value="">Select a level</option>
                  <option value="early-years">Early Years</option>
                  <option value="primary">Primary</option>
                  <option value="junior-high">Junior High</option>
                  <option value="not-sure">Not sure</option>
                </select>
                {errors.academicLevel ? (
                  <p
                    id="academicLevel-error"
                    className="mt-2 text-sm font-medium text-deep-orange"
                  >
                    {errors.academicLevel}
                  </p>
                ) : null}
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="message"
                  className="text-sm font-bold text-charcoal"
                >
                  Message <span className="font-normal">(optional)</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={values.message}
                  onChange={handleChange}
                  className={`${inputClasses} py-3`}
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={status === "submitting"}
              className="mt-7 w-full gap-2 sm:w-auto"
            >
              {status === "submitting" ? (
                <LoaderCircle
                  aria-hidden="true"
                  className="size-5 animate-spin"
                />
              ) : null}
              {status === "submitting"
                ? "Sending..."
                : "Send Enquiry"}
            </Button>

            {status === "success" || status === "error" ? (
              <div
                role={status === "error" ? "alert" : "status"}
                className={`mt-6 flex gap-3 rounded-2xl border p-4 text-sm leading-6 text-charcoal ${
                  status === "error"
                    ? "border-red-200 bg-red-50"
                    : "border-curry-orange/25 bg-soft-cream"
                }`}
              >
                {status === "error" ? (
                  <AlertCircle
                    aria-hidden="true"
                    className="mt-0.5 size-5 shrink-0 text-red-700"
                  />
                ) : (
                  <CheckCircle2
                    aria-hidden="true"
                    className="mt-0.5 size-5 shrink-0 text-curry-orange"
                  />
                )}
                <p>{statusMessage}</p>
              </div>
            ) : null}
          </form>
        </div>
      </Container>
    </section>
  );
}
