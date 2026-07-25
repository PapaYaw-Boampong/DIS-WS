# DIS — Content & Feature Intake (Organized)

**Purpose.** This document organizes a raw information dump from the school into
(A) public-website content, (B) portal features and workflows, and (C) open
questions. It also applies a **professionalism / suitability filter** flagging
information that is unnecessary, unwise, or unprofessional to publish on a public
school website.

**Status.** Organizing pass only. Nothing here has been written into
`IMPLEMENTATION_PLAN.md`, `PORTAL_IMPLEMENTATION_PLAN.md`, or the portal
contracts yet. Once this is reviewed, we fold the approved items into those plans
and the backend contract.

**Note on source.** The dump was pasted three times (identical) — de-duplicated
here. The final requirement line ("Administrators should be able to update
website content without developer assistance, including:") was truncated; see
§B.4 and §C.

> **Copyediting flag:** the raw content has many spelling/grammar issues
> (Montessori, Crèche, exercise, receipts, calendar, etc.). All published copy
> must be professionally edited before it goes live. Names below are transcribed
> as given and **must be confirmed for spelling, titles, and consent to publish.**

---

## A. Public Website Content

Organized by where it maps in the current site information architecture. Each
block notes a **Publish** decision: ✅ publish · ✏️ publish after rewording ·
🔒 keep private (portal/internal) · ❓ confirm first.

### A.1 Campus & Facilities → new section under `/about` or `/student-life`
There is currently no dedicated facilities page; recommend a "Campus &
Facilities" section.

- ✏️ **Physical structure** — "Two-storey, purpose-built campus." Present
  qualitatively. *Drop the "6 offices" count* (adds nothing for parents; see
  filter). Classroom count (24) is acceptable framed as scale, not inventory.
- ✅ **Facilities (built, publishable):**
  - **Edu Lab** — fully equipped computer laboratory with multi-subject
    educational software and a digital board for instruction.
  - **Library.**
  - **Science Lab** — apparatus for integrated science (biology, chemistry,
    physics).
  - **Classrooms** — well-ventilated, fitted with instructional monitors and
    projectors. *(See filter re: "average class size 30".)*
  - **Canteen** — snack and hot-meal vendors with a dedicated eating area.
  - **School bus** — wide pick-up coverage.
- ✏️ **"In the pipeline" (not yet built):** Football pitch, Playground,
  Basketball court. → Only show if **clearly labelled** "Planned / Coming soon."
  Advertising unbuilt facilities as current is misleading (see filter).

### A.2 Academics → `/academics`
- ✏️ **Levels:**
  - Early Years: ~~Babysitting~~ → **Daycare/Nursery**, **Crèche**,
    **Kindergarten** *(rename "Babysitting" — see filter)*
  - **Basic / Primary 1–6**
  - **JHS 1–3**
- ✅ **Curriculum:**
  - Early Years: **GES curriculum with a Montessori-informed approach.**
  - Basic & JHS: **GES curriculum.**

### A.3 Admissions → `/admissions`
- ✅ **Process:** Inquiry (phone/email) → request application form → **entrance
  exam & oral interview** → on success, complete enrollment and receive package
  documents/instructions.
- ✅ **Requirements at enrollment:** 2 passport photographs; ID (Birth
  Certificate or Ghana Card).
- ✏️ **Payment at admission:** first-time admits pay the one-time admission fee
  **and** school fees in full. Continuing students may access payment plans on
  inquiry. → Publish the *policy*; keep *exact figures* off the public page (see
  A.5 / filter).

### A.4 Feeding → `/admissions` or facilities
- ✅ Breakfast and lunch provided.
- ✅ **Billing options:** termly (**10% discount**) or monthly/weekly (no
  discount). *(Confirm whether the school wants the discount rate public.)*

### A.5 Fees & What They Cover → `/admissions`
- ✅ **Fee categories:** School, Bus, Feeding.
- ✅ **Accepted methods:** Mobile Money, Bank Deposit, Cash.
- ✅ **Payment plans** available (on inquiry).
- ✅ **School fees include:** exercise books and stationery.
- ✅ **Purchased separately:** textbooks (per grade), uniforms, badges.
- 🔒 **Exact amounts, bill breakdown, package pricing** → **private** (parent
  portal or office pickup). Do **not** publish figures on the public site.

### A.6 Leadership → `/about/leadership`
- ❓ **Confirm spelling, titles, and consent to publish** for all names.
  - **Co-Directors:** Kwame Wireko Boampong · Vivian Agbeme Boampong
  - **Principal / Headmaster (Basic–JHS):** Kwasi Ohene — Assistant: Bismark ❓
  - **Head Manager (Early Years):** Deede Ayetee — Assistant: Nancy Abatifie ❓
- ✏️ Publish assistants with **full names and titles**, or omit until confirmed —
  single first names ("Bismark") read as unfinished (see filter).

### A.7 Careers / Work With Us → new section (link from `/about` or `/contact`)
- ✅ **How to apply:** send application to the school's designated hiring email
  with passport photo, CV, and projects/relevant experience → shortlisted
  candidates are contacted for an interview.
- ✏️ **Benefits:** staff training programmes, staff feeding, yearly merit-based
  bonuses. *(Acceptable to publish; confirm the school wants bonus policy
  public.)*

### A.8 Documents & Communications → `/calendar`, `/news`, downloads
- ✅ **Publicly available / requestable:**
  - Admissions document (requestable via public site form).
  - Term newsletter — *partial*: calendar, events, and announcements surfaced
    publicly.
  - Reminders & announcements.
  - Feeding menu.
  - School calendar.
- 🔒 **Private (parent portal or office pickup):** new-admission bill breakdown,
  package description, payment plan document, and similar itemized/financial
  documents.

---

## A.9 Professionalism / Suitability Filter (consolidated)

Items to **omit, reword, or keep private** before anything is published.

| # | Item | Concern | Recommendation |
|---|------|---------|----------------|
| 1 | "6 offices", raw room inventory | Reads as filler; irrelevant to parents | Omit office count; frame campus qualitatively |
| 2 | "Babysitting" as a level | Unprofessional for an academic page | Rename → "Daycare / Nursery" |
| 3 | Pipeline facilities (pitch, playground, court) shown as current | Misleading; over-promises | Show only if labelled "Planned / Coming soon", or omit |
| 4 | "Average class size 30" | 30 is not obviously a selling point | Either omit the number or frame as "well-resourced classrooms"; confirm with school |
| 5 | Assistant names as single first names ("Bismark") | Looks incomplete/unprofessional | Full name + title, or omit until confirmed |
| 6 | Exact fees, bill breakdown, discount %, package pricing | Financial detail; competitive/sensitive | Keep private (portal/office); publish policy only |
| 7 | MoMo merchant number, MTN API, bank-email ingestion, OCR/matching | Internal payment implementation; fraud/privacy risk if public | **Never** on public site; portal/backend only (see §B) |
| 8 | Cash desk workflow ("accounts pulls up student…") | Internal operations | Portal/internal only |
| 9 | Staff bonus specifics | Usually kept internal | Confirm before publishing on careers page |
| 10 | All personal names | Consent + spelling | Verify each before publishing |

---

## B. Portal Features & Workflows (fleshed out)

Organizing and detailing workflows only — no build decisions yet. These extend
the existing portal roles (student, parent, staff, admin, accounts, transport)
and will feed the backend contract and payment-integration plan.

### B.1 Payments — categories
Every payment in the portal is tagged to a **category**:
- **School fees**
- **Bus / transport**
- **Feeding**
- **Admission** (one-time, first-time admits)
- **Miscellaneous** — *must be supported* (uniforms, badges, textbooks, ad-hoc
  charges, etc.)

### B.2 Payment method workflows

**Method 1 — Mobile Money (MTN MoMo)**
1. Portal displays the school's **MoMo merchant number** (config, not public).
2. Parent pays to the merchant number and the intended payment is **recorded**
   in the portal (student, category, amount, reference).
3. Backend uses the **MTN API** to pull transaction history and **match** the
   payment.
4. On match, a **receipt is generated** and shown to **both parent and admin**.
- *Open items:* MTN merchant API access/eligibility, matching key (reference vs.
  phone vs. amount+time), handling unmatched/partial payments. → payment plan.

**Method 2 — Bank Deposit (continuous ingestion model)**
Preferred over waiting for periodic statements. Workflow:
1. Parent **uploads their deposit receipt** in the portal.
2. **OCR extracts** the details (amount, date, reference, bank).
3. **Bank transactions are imported automatically** from a feed — ideally the
   school's **bank-alert emails / notifications** ingested continuously.
4. The **matching engine runs immediately** against uploaded receipts + student
   ledger.
5. Parent receives a **notification that payment is verified**; **receipt is
   created and shown to parent and admin.**
- *Open items:* which banks send email alerts and in what format; a dedicated
  inbox/forwarding rule; OCR provider; false-match handling; manual override for
  accounts staff. **Privacy/compliance:** ingesting bank emails handles sensitive
  financial data — needs an explicit data-handling policy.

**Method 3 — Cash (office desk)**
1. Payment taken at the office.
2. **Accounts pulls up the student by name.**
3. Accounts **enters payment details** (category, amount, method = cash).
4. Portal **generates a receipt**, with an **option to print.**
- Fully manual/trusted-operator flow; no external provider.

**Cross-cutting (all methods):** every verified payment posts to the student
**ledger**, updates outstanding balances per category, produces a **receipt**
visible to parent + admin, and (bank/MoMo) triggers a **notification**. This
aligns with the existing `PORTAL_PAYMENT_INTEGRATION_PLAN.md` ledger/receipt/
reconciliation model — reconcile terminology when we update it.

### B.3 Parent portal — documents & information
- **Document access** for parents: bill breakdown, package description, payment
  plan doc, receipts, feeding menu, calendar, announcements.
- **Upload-and-render approach for information management:** for artefacts like
  the **calendar**, allow an admin to **upload a document (PDF/image) that the
  portal renders**, rather than data-entering every field. Good fit for
  calendar, feeding menu, newsletters, bill templates. *(Decide per artefact:
  rendered upload vs. structured data.)*

### B.4 Content management (CMS) — requirement (⚠️ truncated in source)
- Administrators must be able to **update website content without developer
  assistance.** The source list of exactly *what* they can edit was cut off.
- Captured as a first-class requirement; **needs the full list** (see §C). Likely
  candidates from this dump: announcements/reminders, calendar & events, feeding
  menu, news, facilities/leadership text, admissions info, downloadable docs.

---

## C. Open Questions / Needs Confirmation

1. **CMS scope (blocking):** complete the truncated list — which content areas
   must admins edit themselves? Structured fields vs. upload-and-render per area?
2. **Names & consent:** confirm spelling, official titles, and publish-consent
   for all leadership/staff named in §A.6.
3. **Publishing decisions on flagged items:** class size number (yes/no),
   discount % public (yes/no), staff bonus policy public (yes/no), pipeline
   facilities (show as "planned" or omit).
4. **Level naming:** approve "Daycare/Nursery" (or alternative) to replace
   "Babysitting."
5. **Payments — MoMo:** confirm MTN merchant API access and the matching key.
6. **Payments — Bank:** list of banks + alert email formats; dedicated ingestion
   inbox; OCR provider preference; data-handling/privacy policy owner.
7. **Miscellaneous payments:** enumerate the sub-types to model (uniforms,
   badges, textbooks, other).
8. **Contact specifics:** the public phone number(s) and hiring/admissions email
   addresses to display (currently placeholders in the site).

---

## D. Where this goes next (once approved)

- **Public content →** update the typed data files in `src/data/*` (about,
  academics, admissions, studentLife, news/events, contact) plus new
  **Facilities** and **Careers** sections; extend the leadership data.
- **Portal features →** fold payment categories + the three method workflows and
  the parent-document/upload-render model into
  `PORTAL_IMPLEMENTATION_PLAN.md`, `PORTAL_BACKEND_API_CONTRACT.md`,
  `PORTAL_PAYMENT_INTEGRATION_PLAN.md`, and `PORTAL_DATABASE_SCHEMA_PLAN.md`.
- **CMS requirement →** decide build approach (structured CMS vs.
  upload-and-render vs. hybrid) and record it in the plans before backend work.
