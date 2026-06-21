import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

import { NewsletterSignup } from "@/components/community/NewsletterSignup";
import { Container } from "@/components/ui/Container";
import { footerLinkGroups } from "@/data/navigation";
import { school } from "@/data/school";
import { routes } from "@/lib/routes";

export function PublicFooter() {
  return (
    <footer className="bg-dark-footer text-soft-white">
      <NewsletterSignup />
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr_1fr] lg:gap-8">
        <div className="sm:col-span-2 lg:col-span-1">
          <Link
            href={routes.home}
            className="flex items-center gap-3"
            aria-label={`${school.name} home`}
          >
            <Image
              src="/images/brand/dis-logo.png"
              alt=""
              width={47}
              height={40}
              quality={90}
              className="h-10 w-auto"
            />
            <span className="max-w-[180px] text-lg leading-tight font-extrabold text-white">
              {school.name}
            </span>
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-6 text-soft-white/80">
            {school.description}
          </p>
        </div>

        {footerLinkGroups.map((group) => (
          <div key={group.title}>
            <h2 className="text-lg font-bold text-white">{group.title}</h2>
            <ul className="mt-4 space-y-2.5 text-sm text-soft-white/80">
              {group.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-curry-orange"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h2 className="text-lg font-bold text-white">Contact</h2>
          <ul className="mt-4 space-y-3 text-sm text-soft-white/80">
            <li>
              <Link
                href={routes.location}
                className="flex items-start gap-2 transition-colors hover:text-curry-orange"
              >
                <MapPin
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-curry-orange"
                />
                {school.location}
              </Link>
            </li>
            <li>
              <a
                href={`mailto:${school.email}`}
                className="flex items-start gap-2 transition-colors hover:text-curry-orange"
              >
                <Mail
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-curry-orange"
                />
                <span className="break-all">{school.email}</span>
              </a>
            </li>
            <li>
              <a
                href={school.phoneHref}
                className="flex items-start gap-2 transition-colors hover:text-curry-orange"
              >
                <Phone
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-curry-orange"
                />
                {school.phoneDisplay}
              </a>
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col gap-2 py-5 text-xs text-soft-white/65 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {school.name}. All rights
            reserved.
          </p>
          <p>{school.motto}</p>
        </Container>
      </div>
    </footer>
  );
}
