"use client";

import {
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  Mail,
} from "lucide-react";
import { type FormEvent, useState } from "react";

export function NewsletterSignup() {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim() || !consent) {
      setStatus("error");
      setMessage(
        "Enter your email address and confirm that you want school updates.",
      );
      return;
    }

    setStatus("submitting");
    setMessage("");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          email,
          consent,
          website,
        }),
      });
      const result = (await response.json()) as {
        message?: string;
      };

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to join the mailing list.",
        );
      }

      setFirstName("");
      setEmail("");
      setConsent(false);
      setWebsite("");
      setStatus("success");
      setMessage("You are on the list for future school updates.");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to join the mailing list.",
      );
    }
  }

  return (
    <div className="border-b border-white/10">
      <div className="mx-auto grid w-full max-w-[1180px] gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <div>
          <div className="flex items-center gap-3 text-curry-orange">
            <Mail aria-hidden="true" className="size-6" />
            <p className="text-sm font-extrabold tracking-[0.16em] uppercase">
              School Updates
            </p>
          </div>
          <h2 className="mt-3 text-2xl font-bold text-white">
            Join our mailing list
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-soft-white/75">
            Receive approved school notices, event highlights and admissions
            updates.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          aria-busy={status === "submitting"}
        >
          <div className="absolute -left-[9999px]" aria-hidden="true">
            <label htmlFor="newsletter-website">Website</label>
            <input
              id="newsletter-website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-[0.7fr_1fr_auto]">
            <input
              type="text"
              autoComplete="given-name"
              aria-label="First name"
              placeholder="First name"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              className="min-h-12 rounded-full border border-white/20 bg-white/10 px-5 text-sm text-white outline-none placeholder:text-white/55 focus:border-curry-orange"
            />
            <input
              type="email"
              autoComplete="email"
              aria-label="Email address"
              placeholder="Email address"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="min-h-12 rounded-full border border-white/20 bg-white/10 px-5 text-sm text-white outline-none placeholder:text-white/55 focus:border-curry-orange"
            />
            <button
              type="submit"
              disabled={status === "submitting"}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-curry-orange px-7 text-sm font-bold text-white transition-colors hover:bg-deep-orange disabled:opacity-60"
            >
              {status === "submitting" ? (
                <LoaderCircle
                  aria-hidden="true"
                  className="size-4 animate-spin"
                />
              ) : null}
              {status === "submitting" ? "Joining..." : "Subscribe"}
            </button>
          </div>
          <label className="mt-3 flex items-start gap-3 text-xs leading-5 text-soft-white/70">
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
              className="mt-1 size-4 shrink-0 accent-orange-500"
            />
            I agree to receive school updates by email and can unsubscribe from
            future messages.
          </label>
          {status === "success" || status === "error" ? (
            <div
              role={status === "error" ? "alert" : "status"}
              className="mt-3 flex items-start gap-2 text-sm text-soft-white"
            >
              {status === "error" ? (
                <AlertCircle
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-red-300"
                />
              ) : (
                <CheckCircle2
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-curry-orange"
                />
              )}
              <p>{message}</p>
            </div>
          ) : null}
        </form>
      </div>
    </div>
  );
}
