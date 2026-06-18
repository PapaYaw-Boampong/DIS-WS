"use client";

import {
  type ChangeEvent,
  type FormEvent,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { routes } from "@/lib/routes";
import type {
  ContactFormErrors,
  ContactFormValues,
} from "@/types/content";

const initialValues: ContactFormValues = {
  name: "",
  email: "",
  phone: "",
  reason: "",
  message: "",
};

const inputClasses =
  "mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 text-charcoal outline-none transition-colors placeholder:text-muted-grey/70 focus:border-curry-orange";

function validate(values: ContactFormValues) {
  const errors: ContactFormErrors = {};

  if (!values.name.trim()) {
    errors.name = "Enter your name.";
  }
  if (!values.email.trim()) {
    errors.email = "Enter an email address.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (!values.reason) {
    errors.reason = "Select a reason for contacting the school.";
  }
  if (!values.message.trim()) {
    errors.message = "Enter a short message.";
  }

  return errors;
}

export function ContactForm() {
  const [values, setValues] = useState<ContactFormValues>(initialValues);
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const reasonRef = useRef<HTMLSelectElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const fieldRefs = {
    name: nameRef,
    email: emailRef,
    reason: reasonRef,
    message: messageRef,
  };

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    const field = event.target.name as keyof ContactFormValues;

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
    setSubmitted(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validate(values);
    const firstInvalidField = (
      ["name", "email", "reason", "message"] as const
    ).find((field) => nextErrors[field]);

    setErrors(nextErrors);
    setSubmitted(!firstInvalidField);

    if (firstInvalidField) {
      fieldRefs[firstInvalidField].current?.focus();
    }
  }

  return (
    <section className="bg-white py-20 sm:py-24 lg:py-28">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <SectionHeader
              eyebrow="Message Us"
              title="Send a contact enquiry"
              description="This form is presentational for now. It helps families prepare a message but does not submit to a backend."
            />
            <div className="mt-8 rounded-card border border-curry-orange/20 bg-soft-cream p-6">
              <h2 className="font-bold text-charcoal">Need quick help?</h2>
              <p className="mt-4 leading-7 text-muted-grey">
                For admissions questions, start with the admissions page. For
                directions, use the school location page.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={routes.admissions}
                  className="text-sm font-bold text-curry-orange hover:text-deep-orange"
                >
                  Admissions
                </Link>
                <Link
                  href={routes.location}
                  className="text-sm font-bold text-curry-orange hover:text-deep-orange"
                >
                  Location
                </Link>
              </div>
            </div>
          </div>

          <form
            noValidate
            onSubmit={handleSubmit}
            className="rounded-[2rem] border border-border bg-white p-6 shadow-card sm:p-8"
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="name" className="text-sm font-bold text-charcoal">
                  Your name
                </label>
                <input
                  ref={nameRef}
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={values.name}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  className={inputClasses}
                />
                {errors.name ? (
                  <p
                    id="name-error"
                    className="mt-2 text-sm font-medium text-deep-orange"
                  >
                    {errors.name}
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
                  Phone number <span className="font-normal">(optional)</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={values.phone}
                  onChange={handleChange}
                  className={inputClasses}
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="reason"
                  className="text-sm font-bold text-charcoal"
                >
                  Reason
                </label>
                <select
                  ref={reasonRef}
                  id="reason"
                  name="reason"
                  value={values.reason}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.reason)}
                  aria-describedby={errors.reason ? "reason-error" : undefined}
                  className={inputClasses}
                >
                  <option value="">Select a reason</option>
                  <option value="admissions">Admissions</option>
                  <option value="academics">Academics</option>
                  <option value="portal-support">Portal support</option>
                  <option value="location">Location or visit</option>
                  <option value="general">General enquiry</option>
                </select>
                {errors.reason ? (
                  <p
                    id="reason-error"
                    className="mt-2 text-sm font-medium text-deep-orange"
                  >
                    {errors.reason}
                  </p>
                ) : null}
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="message"
                  className="text-sm font-bold text-charcoal"
                >
                  Message
                </label>
                <textarea
                  ref={messageRef}
                  id="message"
                  name="message"
                  rows={5}
                  value={values.message}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? "message-error" : undefined}
                  className={`${inputClasses} py-3`}
                />
                {errors.message ? (
                  <p
                    id="message-error"
                    className="mt-2 text-sm font-medium text-deep-orange"
                  >
                    {errors.message}
                  </p>
                ) : null}
              </div>
            </div>

            <Button type="submit" size="lg" className="mt-7 w-full sm:w-auto">
              Prepare Message
            </Button>

            {submitted ? (
              <div
                role="status"
                className="mt-6 flex gap-3 rounded-2xl border border-curry-orange/25 bg-soft-cream p-4 text-sm leading-6 text-charcoal"
              >
                <CheckCircle2
                  aria-hidden="true"
                  className="mt-0.5 size-5 shrink-0 text-curry-orange"
                />
                <p>
                  Online contact submission is coming soon, so no information
                  has been sent. Please use the phone or email details above to
                  reach the school.
                </p>
              </div>
            ) : null}
          </form>
        </div>
      </Container>
    </section>
  );
}
