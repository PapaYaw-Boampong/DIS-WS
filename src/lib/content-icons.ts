import type { ContentIcon } from "@/types/content";

// Valid ContentIcon names (mirrors the record in components/ui/ContentIcon.tsx
// and the backend allowlist in server/src/lib/content-icons.ts). Used to guard
// CMS-supplied icon strings before they reach the icon lookup, which would
// otherwise render `undefined` and crash if given an unknown name.
const CONTENT_ICON_NAMES = new Set<string>([
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

export const contentIconNames = [...CONTENT_ICON_NAMES] as readonly ContentIcon[];

export function toContentIcon(
  value: string | null | undefined,
  fallback: ContentIcon,
): ContentIcon {
  return value && CONTENT_ICON_NAMES.has(value)
    ? (value as ContentIcon)
    : fallback;
}
