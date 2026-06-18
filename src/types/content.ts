export type NavItem = {
  readonly label: string;
  readonly href: string;
  readonly children?: readonly NavItem[];
};

export type FooterLinkGroup = {
  readonly title: string;
  readonly links: readonly NavItem[];
};

export type ContentIcon =
  | "baby"
  | "book-open"
  | "briefcase"
  | "calendar"
  | "calculator"
  | "clipboard-check"
  | "compass"
  | "eye"
  | "flask"
  | "graduation-cap"
  | "handshake"
  | "heart"
  | "landmark"
  | "languages"
  | "library"
  | "lock-keyhole"
  | "mail"
  | "map-pin"
  | "music"
  | "newspaper"
  | "palette"
  | "phone"
  | "presentation"
  | "puzzle"
  | "quote"
  | "school"
  | "shapes"
  | "shield-check"
  | "sparkles"
  | "target"
  | "trophy"
  | "user-round"
  | "users";

export type LinkAction = {
  readonly label: string;
  readonly href: string;
};

export type HeroSlide = {
  readonly eyebrow?: string;
  readonly title: string;
  readonly description: string;
  readonly primaryAction: LinkAction;
  readonly secondaryAction: LinkAction;
};

export type HomeStat = {
  readonly value: string;
  readonly label: string;
};

export type HomePathway = {
  readonly title: string;
  readonly description: string;
  readonly href: string;
  readonly icon: ContentIcon;
};

export type AboutValue = {
  readonly title: string;
  readonly description: string;
  readonly icon: ContentIcon;
};

export type HistoryMilestone = {
  readonly period: string;
  readonly title: string;
  readonly description: string;
};

export type LeaderProfile = {
  readonly title: string;
  readonly role: string;
  readonly description: string;
  readonly icon: ContentIcon;
  readonly imageDescription: string;
};

export type MessageSection = {
  readonly heading?: string;
  readonly paragraphs: readonly string[];
};

export type AcademicLevel = {
  readonly title: string;
  readonly slug: AcademicLevelSlug;
  readonly description: string;
  readonly image?: string;
  readonly icon: ContentIcon;
};

export type AcademicLevelSlug =
  | "early-years"
  | "primary"
  | "junior-high"
  | "co-curricular";

export type AcademicCardItem = {
  readonly title: string;
  readonly description: string;
  readonly icon: ContentIcon;
  readonly eyebrow?: string;
  readonly image?: string;
  readonly imageAlt?: string;
};

export type AcademicLevelDetail = {
  readonly slug: AcademicLevelSlug;
  readonly title: string;
  readonly eyebrow: string;
  readonly heroDescription: string;
  readonly overviewTitle: string;
  readonly overviewParagraphs: readonly string[];
  readonly imageLabel: string;
  readonly imageDescription: string;
  readonly subjects: readonly AcademicCardItem[];
  readonly developmentFocus: readonly AcademicCardItem[];
  readonly assessmentTitle: string;
  readonly assessmentDescription: string;
  readonly assessmentPoints: readonly string[];
  readonly teacherSupportTitle: string;
  readonly teacherSupportDescription: string;
};

export type TeacherProfile = {
  readonly team: AcademicLevelSlug;
  readonly title: string;
  readonly role: string;
  readonly description: string;
  readonly icon: ContentIcon;
  readonly imageDescription: string;
};

export type FacultyMember = {
  readonly team: AcademicLevelSlug;
  readonly role: string;
  readonly displayName: string;
  readonly description: string;
  readonly icon: ContentIcon;
  readonly image?: string;
  readonly imageDescription: string;
};

export type AdmissionBenefit = {
  readonly title: string;
  readonly description: string;
  readonly icon: ContentIcon;
};

export type AdmissionStep = {
  readonly step: number;
  readonly title: string;
  readonly description: string;
};

export type AdmissionRequirementGroup = {
  readonly title: string;
  readonly description: string;
  readonly icon: ContentIcon;
  readonly items: readonly string[];
};

export type AdmissionFAQ = {
  readonly question: string;
  readonly answer: string;
};

export type AdmissionsEnquiryValues = {
  guardianName: string;
  email: string;
  phone: string;
  learnerName: string;
  academicLevel: string;
  message: string;
};

export type AdmissionsEnquiryErrors = Partial<
  Record<keyof AdmissionsEnquiryValues, string>
>;

export type StudentLifeSlide = {
  readonly id: string;
  readonly eyebrow?: string;
  readonly title: string;
  readonly description: string;
  readonly imageLabel: string;
  readonly imageDescription: string;
  readonly icon: ContentIcon;
};

export type StudentActivity = {
  readonly title: string;
  readonly description: string;
  readonly icon: ContentIcon;
};

export type GalleryItem = {
  readonly title: string;
  readonly description: string;
  readonly icon: ContentIcon;
};

export type StudentVoice = {
  readonly id: string;
  readonly eyebrow?: string;
  readonly role: string;
  readonly title: string;
  readonly description: string;
  readonly imageLabel: string;
  readonly imageDescription: string;
  readonly icon: ContentIcon;
};

export type AcademicTerm = {
  readonly name: string;
  readonly period: string;
  readonly description: string;
  readonly highlights: readonly string[];
};

export type EventItem = {
  readonly title: string;
  readonly date: string;
  readonly description: string;
  readonly href: string;
  readonly icon: ContentIcon;
};

export type NewsItem = {
  readonly title: string;
  readonly slug: string;
  readonly excerpt: string;
  readonly publishedAt: string;
  readonly category: string;
  readonly image?: string;
  readonly icon: ContentIcon;
};

export type NewsBodySection = {
  readonly heading?: string;
  readonly paragraphs: readonly string[];
};

export type NewsArticle = NewsItem & {
  readonly imageDescription: string;
  readonly body: readonly NewsBodySection[];
};

export type PortalItem = {
  readonly title: string;
  readonly audience: string;
  readonly description: string;
  readonly icon: ContentIcon;
  readonly status: string;
  readonly actionLabel: string;
  readonly features: readonly string[];
};

export type PortalAccessStep = {
  readonly title: string;
  readonly description: string;
  readonly icon: ContentIcon;
};

export type PortalNotice = {
  readonly title: string;
  readonly description: string;
};

export type ContactDetail = {
  readonly title: string;
  readonly value: string;
  readonly href?: string;
  readonly description: string;
  readonly icon: ContentIcon;
};

export type ContactReason = {
  readonly title: string;
  readonly description: string;
  readonly icon: ContentIcon;
};

export type ContactFormValues = {
  name: string;
  email: string;
  phone: string;
  reason: string;
  message: string;
};

export type ContactFormErrors = Partial<
  Record<keyof ContactFormValues, string>
>;

export type LocationPoint = {
  readonly title: string;
  readonly value: string;
  readonly description: string;
  readonly icon: ContentIcon;
};

export type VisitNote = {
  readonly title: string;
  readonly description: string;
  readonly icon: ContentIcon;
};

export type MapEmbed = {
  readonly title: string;
  readonly src: string;
  readonly externalHref: string;
};
