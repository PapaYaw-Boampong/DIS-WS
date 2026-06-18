import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

import { Container } from "@/components/ui/Container";
import { portalLinks } from "@/data/navigation";
import { school } from "@/data/school";
import { routes } from "@/lib/routes";

export function TopUtilityBar() {
  return (
    <div className="hidden h-[38px] bg-curry-orange text-white lg:block">
      <Container className="flex h-full items-center justify-between gap-6 text-[0.8125rem] font-semibold">
        <div className="flex items-center gap-5">
          <a
            href={school.phoneHref}
            className="inline-flex items-center gap-1.5 hover:underline"
          >
            <Phone aria-hidden="true" className="size-3.5" />
            {school.phoneDisplay}
          </a>
          <a
            href={`mailto:${school.email}`}
            className="inline-flex items-center gap-1.5 hover:underline"
          >
            <Mail aria-hidden="true" className="size-3.5" />
            {school.email}
          </a>
          <Link
            href={routes.location}
            className="inline-flex items-center gap-1.5 hover:underline"
          >
            <MapPin aria-hidden="true" className="size-3.5" />
            {school.location}
          </Link>
        </div>
        <nav aria-label="Utility navigation">
          <ul className="flex items-center gap-6">
            <li>
              <Link href={routes.admissions} className="hover:underline">
                Apply Now
              </Link>
            </li>
            {portalLinks.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </div>
  );
}
