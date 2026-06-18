import {
  Baby,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Calculator,
  ClipboardCheck,
  Compass,
  Eye,
  FlaskConical,
  GraduationCap,
  Handshake,
  Heart,
  Landmark,
  Languages,
  LibraryBig,
  LockKeyhole,
  Mail,
  MapPin,
  Music2,
  Newspaper,
  Palette,
  Phone,
  Presentation,
  Puzzle,
  Quote,
  School,
  Shapes,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  UserRound,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import type { ContentIcon as ContentIconName } from "@/types/content";

type ContentIconProps = {
  name: ContentIconName;
  className?: string;
};

const icons: Record<ContentIconName, LucideIcon> = {
  baby: Baby,
  "book-open": BookOpen,
  briefcase: BriefcaseBusiness,
  calendar: CalendarDays,
  calculator: Calculator,
  "clipboard-check": ClipboardCheck,
  compass: Compass,
  eye: Eye,
  flask: FlaskConical,
  "graduation-cap": GraduationCap,
  handshake: Handshake,
  heart: Heart,
  landmark: Landmark,
  languages: Languages,
  library: LibraryBig,
  "lock-keyhole": LockKeyhole,
  mail: Mail,
  "map-pin": MapPin,
  music: Music2,
  newspaper: Newspaper,
  palette: Palette,
  phone: Phone,
  presentation: Presentation,
  puzzle: Puzzle,
  quote: Quote,
  school: School,
  shapes: Shapes,
  "shield-check": ShieldCheck,
  sparkles: Sparkles,
  target: Target,
  trophy: Trophy,
  "user-round": UserRound,
  users: UsersRound,
};

export function ContentIcon({ name, className }: ContentIconProps) {
  const Icon = icons[name];

  return <Icon aria-hidden="true" className={className} strokeWidth={1.8} />;
}
