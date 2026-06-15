# Divine International School Website – Frontend Implementation Plan

## 1. Project Goal

Build the public-facing website for **Divine International School** based on the approved Figma designs.

Figma reference:

https://www.figma.com/design/jgKkQIVXT8UgLpQAoBBKis/Divine-International-School-Website-%E2%80%93-3-Design-Concepts?node-id=4-756

The website should feel like a modern, trustworthy school website inspired by the structure of Ghana International School, while using Divine International School’s chosen visual direction: **white, soft cream, curry-orange, and clean institutional layouts**.

The first development phase is focused on the **public website frontend**, not the full student/staff/admin portal system yet. Portal pages should exist as landing/access pages for now.

---

## 2. Core Design Direction

### Visual Style

Use a clean, warm, institutional design.

The design should communicate:

- trust
- academic excellence
- warmth
- structure
- parent-friendliness
- school community
- digital readiness

### Colour Palette

Use these design tokens:

```ts
const colors = {
  white: "#FFFFFF",
  softWhite: "#FFFBF3",
  softCream: "#FFF6E7",
  curry: "#D99A1E",
  curryOrange: "#F28C28",
  deepOrange: "#B45309",
  charcoal: "#1F2933",
  mutedGrey: "#6B7280",
  border: "#E8DED0",
  darkFooter: "#111827",
};
```

### Pattern Usage

Use the subtle white/curry-orange checkered pattern sparingly.

Best places:

- section backgrounds
- CTA strips
- academic cards background
- admissions process area
- footer top accents

Do not make the pattern visually loud. It should be decorative and low opacity.

### Typography

Use a clean sans-serif font. Recommended:

- `Inter`
- fallback: `system-ui`, `Arial`, `sans-serif`

Suggested scale:

```css
--font-display: 56px;
--font-h1: 48px;
--font-h2: 40px;
--font-h3: 28px;
--font-body-lg: 20px;
--font-body: 16px;
--font-small: 14px;
```

Use bold headings and readable body text.

---

## 3. Recommended Tech Stack

Use:

- **Next.js**
- **TypeScript**
- **Tailwind CSS**
- **React components**
- **App Router**
- **Lucide React** for icons
- **Framer Motion** only if animation is needed
- `next/image` for optimized images

Recommended setup:

```bash
npx create-next-app@latest divine-school-website \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir
```

---

## 4. Overall Architecture

Use a routed multi-page website.

Do **not** build the website as one page that swaps divs manually.

Use a shared layout:

```txt
Header
Main page content
Footer
```

In Next.js:

```tsx
// src/app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <PublicHeader />
        <main>{children}</main>
        <PublicFooter />
      </body>
    </html>
  );
}
```

The header and footer should remain consistent across all public pages.

The middle content should change based on the current route.

---

## 5. Route Implementation Map

Use this mapping between Figma frames and actual routes.

| Figma Design | Route | Page Component |
|---|---|---|
| Concept 1 / DIS School Website | `/` | `HomePage` |
| About Us Page - main | `/about` | `AboutPage` |
| About Us - History | `/about/history` | `HistoryPage` |
| About Us - Message from the principal | `/about/principal-message` | `PrincipalMessagePage` |
| About Us - Leadership and Management | `/about/leadership` | `LeadershipPage` |
| Dis Academics | `/academics` | `AcademicsPage` |
| Academics - Specific School | `/academics/[level]` | `AcademicLevelPage` |
| Academics - Meet our Teachers | `/academics/teachers` | `TeachersPage` |
| School Calendar | `/calendar` | `CalendarPage` |
| Admissions | `/admissions` | `AdmissionsPage` |
| DIS Experiences | `/student-life` | `StudentLifePage` |
| DIS Portals | `/portal` | `PortalLandingPage` |
| Contact section/page | `/contact` | `ContactPage` |

For the first release, if some pages are not fully designed yet, create functional placeholder pages using the same hero, section heading, and CTA style.

---

## 6. Recommended Folder Structure

Use this structure:

```txt
src/
  app/
    layout.tsx
    page.tsx
    about/
      page.tsx
      history/
        page.tsx
      principal-message/
        page.tsx
      leadership/
        page.tsx
    academics/
      page.tsx
      [level]/
        page.tsx
      teachers/
        page.tsx
    admissions/
      page.tsx
    student-life/
      page.tsx
    portal/
      page.tsx
    calendar/
      page.tsx
    contact/
      page.tsx

  components/
    layout/
      PublicHeader.tsx
      PublicFooter.tsx
      MobileNav.tsx
      TopUtilityBar.tsx

    ui/
      Button.tsx
      SectionHeader.tsx
      Container.tsx
      Card.tsx
      Badge.tsx
      PatternSection.tsx
      PageHero.tsx
      CTASection.tsx
      ImagePlaceholder.tsx

    home/
      HeroSlider.tsx
      StatsSection.tsx
      WelcomeSection.tsx
      JoinPathways.tsx
      AcademicPreview.tsx
      EventsPreview.tsx
      NewsPreview.tsx
      PortalAccessPreview.tsx

    about/
      PrincipalPreview.tsx
      MissionVisionValues.tsx
      HistoryTimeline.tsx
      LeadershipGrid.tsx

    academics/
      AcademicLevelsGrid.tsx
      CurriculumSection.tsx
      AssessmentSection.tsx
      LearningResources.tsx
      TeachersPreview.tsx
      CalendarPreview.tsx

    admissions/
      AdmissionsSteps.tsx
      RequirementsSection.tsx
      FeesPreview.tsx
      AdmissionsFAQ.tsx
      ApplyCTA.tsx

    student-life/
      ExperienceHero.tsx
      ActivitiesGrid.tsx
      CampusLifeSection.tsx
      TestimonialsSection.tsx
      GalleryPreview.tsx

    portal/
      PortalCard.tsx
      PortalGrid.tsx
      PortalInfoSection.tsx

  data/
    navigation.ts
    home.ts
    about.ts
    academics.ts
    admissions.ts
    studentLife.ts
    portals.ts
    news.ts
    events.ts

  lib/
    routes.ts
    utils.ts

  styles/
    globals.css
```

---

## 7. Navigation Structure

The public header should have:

```txt
Home
About
Academics
Admissions
Student Life
News / Events
Portals
Contact
```

### Header Behaviour

- Logo goes to `/`
- “Apply Now” goes to `/admissions`
- “Portals” goes to `/portal`
- Header should be sticky or semi-sticky
- Mobile should collapse into hamburger menu

### Suggested Dropdowns

About dropdown:

```txt
About Divine
History
Principal’s Message
Leadership & Management
```

Academics dropdown:

```txt
Academic Overview
Early Years
Primary School
Junior High School
Meet Our Teachers
School Calendar
```

Portals dropdown:

```txt
Student Portal
Parent Portal
Staff Portal
Admin Portal
```

For now, portal links can stay on `/portal` or use placeholder login routes.

---

## 8. Shared Layout Components

### `PublicHeader`

Responsibilities:

- Top contact bar
- Logo
- Main navigation
- Dropdown menus
- Apply button
- Portal link
- Mobile menu

Header sections:

```txt
Top Utility Bar
Main Navbar
Mobile Navigation
```

### `PublicFooter`

Responsibilities:

- School description
- Quick links
- Admissions links
- Academic links
- Portal links
- Contact information
- Social media
- Copyright

Footer columns:

```txt
School
Quick Links
Academics
Portals
Contact
```

### `PageHero`

Use on most internal pages.

Props:

```ts
type PageHeroProps = {
  eyebrow?: string;
  title: string;
  description: string;
  image?: string;
  variant?: "light" | "dark" | "pattern";
};
```

### `SectionHeader`

Props:

```ts
type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
};
```

### `CTASection`

Props:

```ts
type CTASectionProps = {
  title: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
};
```

### `Card`

Reusable for:

- academic levels
- portal cards
- news cards
- event cards
- value cards
- resource cards

Props:

```ts
type CardProps = {
  title: string;
  description: string;
  href?: string;
  image?: string;
  icon?: React.ReactNode;
  label?: string;
};
```

---

## 9. Page-by-Page Implementation Plan

## 9.1 Homepage `/`

Figma reference:

`Concept 1 / DIS School Website`

### Sections

```txt
Hero / Intro Slider
Stats Section
Welcome to Divine
School Message / Principal Preview
Join Divine As...
Academic Levels Preview
Upcoming Events
News & Updates
Portal Access Preview
Footer
```

### Components

```txt
HeroSlider
StatsSection
ImageTextSection
JoinPathways
AcademicLevelsGrid
EventsPreview
NewsPreview
PortalGrid
CTASection
```

### Behaviour

- “Apply Now” routes to `/admissions`
- “Explore School” scrolls to welcome or routes to `/about`
- Academic cards route to `/academics/[level]`
- News cards route to future `/news/[slug]`
- Events preview routes to `/calendar`
- Portal cards route to `/portal`

---

## 9.2 About Page `/about`

Figma references:

```txt
About Us Page - main
About Us - History
About Us - Message from the principal
About Us - Leadership and Management
```

### Sections

```txt
Page Hero
About Divine Overview
Principal’s Welcome Preview
Mission, Vision, Values
History Preview
Leadership Preview
School Culture
CTA: Apply / Contact
```

### Components

```txt
PageHero
ImageTextSection
MissionVisionValues
HistoryTimeline
LeadershipGrid
CTASection
```

### Content Notes

The About page should establish identity and trust. It should not be too crowded. Detailed content can route into child pages.

Child pages:

```txt
/about/history
/about/principal-message
/about/leadership
```

---

## 9.3 Academics Page `/academics`

Figma references:

```txt
Dis Academics
Academics - Specific School
Academics - Meet our Teachers
School Calendar
```

### Sections

```txt
Page Hero
Academic Philosophy / Overview
Academic Levels
Curriculum & Subjects
Learning Beyond the Classroom
Teaching & Learning Resources
Assessment & Reporting
Academic Calendar Preview
Meet Our Teachers Preview
Admissions CTA
```

### Components

```txt
PageHero
AcademicLevelsGrid
CurriculumSection
LearningResources
AssessmentSection
CalendarPreview
TeachersPreview
CTASection
```

### Academic Level Routes

Create route:

```txt
/academics/[level]
```

Valid slugs:

```txt
early-years
primary
junior-high
co-curricular
```

Each academic level page should include:

```txt
Page Hero
Level Overview
Subjects / Learning Areas
Student Development Focus
Assessment Approach
Teacher Support
CTA to Admissions
```

---

## 9.4 Admissions Page `/admissions`

Figma reference:

```txt
Admissions page
```

### Sections

```txt
Page Hero
Admissions Introduction
Why Choose Divine
Admission Process Steps
Required Documents
Fees / Payment Information Preview
Application CTA
Admissions FAQ
Contact Admissions
```

### Components

```txt
PageHero
AdmissionsSteps
RequirementsSection
FeesPreview
AdmissionsFAQ
CTASection
ContactBlock
```

### Admission Process Example

```txt
1. Make an enquiry
2. Visit the school / speak with admissions
3. Submit application form
4. Provide required documents
5. Student assessment / interview
6. Admission decision
7. Fee payment and enrollment
```

### Behaviour

- “Apply Now” scrolls to application CTA or form section
- “Contact Admissions” routes to `/contact`
- Form can be non-functional in phase 1 or handled by simple email submission later

---

## 9.5 Student Life Page `/student-life`

Figma reference:

```txt
DIS Experiences
```

### Sections

```txt
Page Hero
Student Experience Overview
Campus Life
Clubs and Activities
Sports
Arts and Culture
Leadership and Character
Events and Celebrations
Gallery Preview
Testimonials
CTA: Visit / Apply
```

### Components

```txt
PageHero
ExperienceHero
ActivitiesGrid
CampusLifeSection
GalleryPreview
TestimonialsSection
CTASection
```

### Content Direction

This page should feel warm and emotional. It should show that Divine is not only about academics, but also growth, confidence, friendship, creativity, and discipline.

---

## 9.6 Portal Landing Page `/portal`

Figma reference:

```txt
DIS Portals
```

### Sections

```txt
Page Hero
Portal Overview
Portal Cards
How Access Works
Privacy and Security Note
Support / Contact
CTA
```

### Portal Cards

```txt
Student Portal
Parent Portal
Staff Portal
Admin Portal
```

Each card should include:

```txt
Title
Short description
Feature bullets
Login button
```

### For Phase 1

The portal buttons can point to placeholder routes:

```txt
/portal/student
/portal/parent
/portal/staff
/portal/admin
```

Or they can display:

```txt
Coming Soon
```

Do not build the full portal application in this phase unless explicitly required.

---

## 9.7 Calendar Page `/calendar`

### Sections

```txt
Page Hero
Term Dates
Upcoming Events
Academic Calendar
Download Calendar CTA
```

For phase 1, use static data from `data/events.ts`.

Later, this can be pulled from an admin dashboard or CMS.

---

## 9.8 Contact Page `/contact`

### Sections

```txt
Page Hero
Contact Details
School Hours
Location / Map Placeholder
Contact Form
Admissions Contact
Social Media
```

### Contact Details

Use placeholders until final school details are confirmed.

```txt
Divine International School
Accra, Ghana
info@divineschool.edu.gh
+233 XX XXX XXXX
Monday - Friday: 8:00am - 4:00pm
```

---

## 10. Content/Data Strategy

For phase 1, keep content in local TypeScript data files.

Example:

```txt
src/data/academics.ts
src/data/admissions.ts
src/data/navigation.ts
src/data/events.ts
src/data/news.ts
```

This makes the frontend easy to build before a backend or CMS exists.

Later, these can be migrated to:

- Sanity
- Strapi
- Directus
- Payload CMS
- custom admin dashboard

### Example Data Shape

```ts
export const academicLevels = [
  {
    title: "Early Years",
    slug: "early-years",
    description: "A nurturing start for young learners.",
    image: "/images/academics/early-years.jpg",
  },
  {
    title: "Primary School",
    slug: "primary",
    description: "Strong foundations in literacy, numeracy, science and creativity.",
    image: "/images/academics/primary.jpg",
  },
  {
    title: "Junior High School",
    slug: "junior-high",
    description: "Preparing students for higher learning, confidence and independence.",
    image: "/images/academics/junior-high.jpg",
  },
];
```

---

## 11. Image Strategy

The Figma currently uses placeholder-style image blocks. During implementation:

### Use temporary placeholders first

Use:

```txt
/public/images/placeholders/
```

Suggested image placeholders:

```txt
school-hero.jpg
students-classroom.jpg
students-reading.jpg
campus.jpg
teachers.jpg
sports.jpg
gallery-1.jpg
gallery-2.jpg
```

### Later replace with real school photos

When real photos are available:

- compress images
- use `next/image`
- add alt text
- avoid huge unoptimized photos
- keep consistent aspect ratios

Suggested aspect ratios:

```txt
Hero images: 16:9 or 21:9
Cards: 4:3
Profile images: 1:1
Gallery images: 4:3 or 3:2
```

---

## 12. Responsive Design Rules

Build desktop first from Figma, then adapt.

Breakpoints:

```txt
mobile: 320px - 767px
tablet: 768px - 1023px
desktop: 1024px+
large desktop: 1280px+
```

### Mobile Rules

- Header becomes hamburger menu
- Card grids become single-column
- Hero text should stack above image or overlay cleanly
- Large desktop spacing should reduce
- Footer columns stack vertically
- Avoid very tall empty sections

### Common Responsive Grid Rules

```txt
Desktop: 3 or 4 cards per row
Tablet: 2 cards per row
Mobile: 1 card per row
```

Use Tailwind classes like:

```tsx
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
```

---

## 13. Accessibility Requirements

Implement:

- semantic HTML
- proper heading order
- alt text for images
- keyboard-accessible navigation
- visible focus states
- sufficient contrast
- aria labels for mobile menu buttons
- no text embedded inside images

Use:

```tsx
<button aria-label="Open navigation menu">
```

All CTA links should be real anchors or Next.js `Link` components.

---

## 14. SEO Requirements

Each route should include metadata.

Example:

```ts
export const metadata = {
  title: "Divine International School | Home",
  description: "A nurturing school community committed to academic excellence, character and confidence.",
};
```

Add metadata for:

```txt
Home
About
Academics
Admissions
Student Life
Portal
Contact
```

Use clean URLs.

---

## 15. Development Phases

### Phase 1: Foundation

Build:

```txt
Next.js project setup
Tailwind setup
Global theme tokens
Shared Header
Shared Footer
Container component
Button component
SectionHeader component
Card component
PageHero component
CTASection component
```

### Phase 2: Homepage

Build:

```txt
Homepage route
Hero section
Welcome section
Academic preview
Join pathway section
Events preview
News preview
Portal preview
Footer integration
```

### Phase 3: Core Pages

Build:

```txt
About
Academics
Admissions
Student Life
Portal
Contact
```

### Phase 4: Subpages

Build:

```txt
About History
Principal Message
Leadership
Academic Level Pages
Teachers
Calendar
```

### Phase 5: Polish

Add:

```txt
Responsive refinements
Animations
Hover states
Focus states
Image optimization
SEO metadata
404 page
Loading states if needed
```

---

## 16. Recommended Build Order for Codex

Start with:

```txt
1. Create project structure
2. Add theme tokens to Tailwind
3. Build Header and Footer
4. Build UI primitives
5. Build reusable section components
6. Build Home page
7. Build About page
8. Build Academics page
9. Build Admissions page
10. Build Student Life page
11. Build Portal page
12. Build Contact page
13. Add responsive styling
14. Add metadata and final polish
```

---

## 17. Initial Codex Instruction

Use this instruction in Codex:

```txt
You are implementing the frontend for the Divine International School public website based on the Figma design link below.

Figma:
https://www.figma.com/design/jgKkQIVXT8UgLpQAoBBKis/Divine-International-School-Website-%E2%80%93-3-Design-Concepts?node-id=4-756

Build a Next.js + TypeScript + Tailwind CSS website using the App Router.

Follow the implementation plan in this markdown. Use a shared Header and Footer layout across all public pages. Implement the site as a multi-page routed website, not a one-page div-swapping site.

Prioritize clean reusable components, strong responsive design, and a faithful translation of the Figma design system: white/soft cream backgrounds, curry-orange accents, charcoal text, rounded cards, subtle shadows, and section-based layouts.

Start by setting up the project structure, theme tokens, shared layout components, UI primitives, and the homepage. Then implement About, Academics, Admissions, Student Life, Portal, Calendar, and Contact pages.
```

---

## 18. Definition of Done

The frontend is complete when:

```txt
All main routes are implemented
Header and footer are shared
Design matches the Figma direction closely
Pages are responsive
Navigation works
Dropdowns work
Mobile menu works
CTA buttons route correctly
No major TypeScript errors
No broken internal links
Images have alt text
Pages have metadata
Code is componentized and maintainable
```

---

## 19. Important Implementation Principle

Do not hardcode large repeated layouts separately on every page.

Use shared components and data-driven rendering.

Good:

```tsx
<AcademicLevelsGrid levels={academicLevels} />
```

Bad:

```tsx
// Recreating the same academic card markup manually on every page
```

The goal is to make the website easy to maintain when the school later adds news, events, portal functionality, or a CMS.
