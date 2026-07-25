// Allowlist of ContentIcon names the public website can render (mirrors
// src/components/ui/ContentIcon.tsx in the web app). CMS writes validate the
// icon against this set so the public site never receives an unknown name that
// would crash its icon lookup.
export const CONTENT_ICONS = new Set([
  "baby",
  "book-open",
  "briefcase",
  "bus",
  "calendar",
  "calculator",
  "clipboard-check",
  "compass",
  "dumbbell",
  "eye",
  "file-text",
  "flask",
  "goal",
  "graduation-cap",
  "handshake",
  "heart",
  "landmark",
  "languages",
  "library",
  "lock-keyhole",
  "mail",
  "map-pin",
  "monitor",
  "music",
  "newspaper",
  "palette",
  "phone",
  "presentation",
  "puzzle",
  "quote",
  "school",
  "shapes",
  "shield-check",
  "sparkles",
  "target",
  "trees",
  "trophy",
  "user-round",
  "users",
  "utensils",
]);

export function isContentIcon(value: string): boolean {
  return CONTENT_ICONS.has(value);
}
