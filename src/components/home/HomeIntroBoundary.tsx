"use client";

import { usePathname } from "next/navigation";

import { HomeIntro } from "@/components/home/HomeIntro";
import { routes } from "@/lib/routes";

export function HomeIntroBoundary() {
  const pathname = usePathname();

  return pathname === routes.home ? <HomeIntro /> : null;
}
