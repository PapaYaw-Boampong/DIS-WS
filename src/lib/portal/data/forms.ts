import "server-only";

import { portalApiGet } from "@/lib/portal/data/api";

export type MailingSignup = {
  readonly id: string;
  readonly email: string;
  readonly firstName: string;
  readonly consent: boolean;
  readonly status: "active" | "unsubscribed";
  readonly createdAt: string;
};

export type Inquiry = {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly subject: string;
  readonly message: string;
  readonly type: "contact" | "admissions";
  readonly status: "new" | "in_progress" | "resolved";
  readonly notes: string;
  readonly createdAt: string;
};

export async function listMailingSignups(): Promise<readonly MailingSignup[]> {
  return (
    await portalApiGet<{ signups?: MailingSignup[] }>("/mailing-list", {})
  ).signups ?? [];
}

export async function listInquiries(): Promise<readonly Inquiry[]> {
  return (
    await portalApiGet<{ inquiries?: Inquiry[] }>("/inquiries", {})
  ).inquiries ?? [];
}
