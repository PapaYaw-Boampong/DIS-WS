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
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [statusMessage, setStatusMessage] = useState("");
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
    setStatus("idle");
    setStatusMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validate(values);
    const firstInvalidField = (
      ["name", "email", "reason", "message"] as const
    ).find((field) => nextErrors[field]);

    setErrors(nextErrors);

    if (firstInvalidField) {
      fieldRefs[firstInvalidField].current?.focus();
      return;
    }

    setStatus("submitting");
    setStatusMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, website }),
      });
      const result = (await response.json()) as {
        message?: string;
      };

      if (!response.ok) {
        throw new Error(result.message || "Unable to submit your message.");
      }

      setValues(initialValues);
      setWebsite("");
      setStatus("success");
      setStatusMessage(
        "Your message has been sent. The school team will respond using the contact details you provided.",
      );
    } catch (error) {
      setStatus("error");
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Unable to submit your message.",
      );
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
              description="Send your question directly to the school team. Required fields are marked in the form."
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
            aria-busy={status === "submitting"}
            className="rounded-[2rem] border border-border bg-white p-6 shadow-card sm:p-8"
          >
            <div className="absolute -left-[9999px]" aria-hidden="true">
              <label htmlFor="contact-website">Website</label>
              <input
                id="contact-website"
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
              {status === "submitting" ? "Sending..." : "Send Message"}
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
