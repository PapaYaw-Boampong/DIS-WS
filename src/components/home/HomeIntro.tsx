"use client";

import Image from "next/image";
import { useLayoutEffect, useState } from "react";

import { ResponsiveImage } from "@/components/ui/ResponsiveImage";
import { school } from "@/data/school";
import {
  HOME_INTRO_DURATION_MS,
  HOME_INTRO_FADE_MS,
  HOME_INTRO_PANEL_OUT_MS,
  HOME_INTRO_STORAGE_KEY,
} from "@/lib/homeIntro";
import { siteImages } from "@/lib/images";
import { cn } from "@/lib/utils";

type IntroPhase = "visible" | "exiting" | "hidden";
type LogoStatus = "loading" | "loaded" | "failed";

export function HomeIntro() {
  const [phase, setPhase] = useState<IntroPhase>("visible");
  const [logoStatus, setLogoStatus] =
    useState<LogoStatus>("loading");
  // Photo panels: slide in once the logo is ready, slide back out together
  // just before the intro fades into the home page.
  const [panelsLeaving, setPanelsLeaving] = useState(false);

  useLayoutEffect(() => {
    const root = document.documentElement;
    let hasSeenIntro = false;

    try {
      hasSeenIntro =
        window.sessionStorage.getItem(HOME_INTRO_STORAGE_KEY) === "1";
    } catch {
      hasSeenIntro = root.dataset.disHomeIntro === "seen";
    }

    if (hasSeenIntro) {
      root.dataset.disHomeIntro = "seen";
      const hideFrame = window.requestAnimationFrame(() => {
        setPhase("hidden");
      });

      return () => window.cancelAnimationFrame(hideFrame);
    }

    root.dataset.disHomeIntro = "pending";

    const previousBodyOverflow = document.body.style.overflow;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let hasReleasedScroll = false;
    let hideTimer: number | undefined;

    document.body.style.overflow = "hidden";

    function releaseScroll() {
      if (hasReleasedScroll) {
        return;
      }

      hasReleasedScroll = true;
      document.body.style.overflow = previousBodyOverflow;
    }

    function completeIntro() {
      try {
        window.sessionStorage.setItem(HOME_INTRO_STORAGE_KEY, "1");
      } catch {
        // The intro still works when browser storage is unavailable.
      }

      root.dataset.disHomeIntro = "seen";
      releaseScroll();
    }

    if (logoStatus === "loading") {
      return () => {
        if (root.dataset.disHomeIntro === "pending") {
          delete root.dataset.disHomeIntro;
        }

        releaseScroll();
      };
    }

    const panelsTimer = prefersReducedMotion
      ? undefined
      : window.setTimeout(
          () => setPanelsLeaving(true),
          HOME_INTRO_DURATION_MS - HOME_INTRO_PANEL_OUT_MS,
        );

    const exitTimer = window.setTimeout(() => {
      if (prefersReducedMotion) {
        setPhase("hidden");
        completeIntro();
        return;
      }

      setPhase("exiting");
      hideTimer = window.setTimeout(() => {
        setPhase("hidden");
        completeIntro();
      }, HOME_INTRO_FADE_MS);
    }, HOME_INTRO_DURATION_MS);

    return () => {
      window.clearTimeout(exitTimer);

      if (panelsTimer !== undefined) {
        window.clearTimeout(panelsTimer);
      }

      if (hideTimer !== undefined) {
        window.clearTimeout(hideTimer);
      }

      if (root.dataset.disHomeIntro === "pending") {
        delete root.dataset.disHomeIntro;
      }

      releaseScroll();
    };
  }, [logoStatus]);

  if (phase === "hidden") {
    return null;
  }

  return (
    <div
      className={cn(
        "home-intro fixed inset-0 z-[1000] flex min-h-dvh items-center justify-center overflow-hidden bg-white px-6 transition-opacity ease-out motion-reduce:transition-none",
        phase === "exiting" ? "opacity-0" : "opacity-100",
      )}
      style={{ transitionDuration: `${HOME_INTRO_FADE_MS}ms` }}
      role="status"
      aria-live="polite"
      aria-label={`${school.name}. ${school.motto}`}
    >
      {logoStatus !== "loading" ? (
        <>
          {/* Left panel drops in from the top (a band above the logo on
              small screens); the right rises from the bottom. Both leave the
              way they came, together. */}
          <div
            aria-hidden="true"
            className={cn(
              "intro-panel-top pointer-events-none absolute inset-x-5 top-5 h-[22vh] overflow-hidden rounded-[1.75rem] shadow-card-strong lg:inset-x-auto lg:top-[10%] lg:bottom-[10%] lg:left-[5%] lg:h-auto lg:w-[27%]",
              panelsLeaving && "is-leaving",
            )}
          >
            <ResponsiveImage
              image={siteImages.introLeft}
              sizes="(min-width: 1024px) 27vw, 100vw"
              preload
            />
          </div>
          <div
            aria-hidden="true"
            className={cn(
              "intro-panel-bottom pointer-events-none absolute inset-x-5 bottom-5 h-[22vh] overflow-hidden rounded-[1.75rem] shadow-card-strong lg:inset-x-auto lg:top-[10%] lg:right-[5%] lg:bottom-[10%] lg:h-auto lg:w-[27%]",
              panelsLeaving && "is-leaving",
            )}
          >
            <ResponsiveImage
              image={siteImages.introRight}
              sizes="(min-width: 1024px) 27vw, 100vw"
              preload
            />
          </div>
        </>
      ) : null}
      <div className="relative flex flex-col items-center text-center">
        <div
          className="relative flex w-[16.5rem] items-center justify-center sm:w-[21rem]"
          style={{ aspectRatio: "541 / 461" }}
        >
          <Image
            src="/images/brand/dis-logo-curry-orange-3x.png"
            alt={`${school.name} logo`}
            width={1623}
            height={1383}
            preload
            unoptimized
            loading="eager"
            fetchPriority="high"
            onLoad={() => setLogoStatus("loaded")}
            onError={() => setLogoStatus("failed")}
            className={cn(
              "block h-auto w-full object-contain opacity-100",
              logoStatus === "failed" && "hidden",
            )}
          />
          {logoStatus === "failed" ? (
            <div
              role="img"
              aria-label={`${school.name} logo fallback`}
              className="flex size-54 items-center justify-center rounded-full border-8 border-curry-orange text-5xl font-black text-curry-orange sm:size-66"
            >
              {school.shortName}
            </div>
          ) : null}
        </div>
        <p className="mt-4 text-xs leading-relaxed font-normal text-muted-grey italic sm:text-sm">
          {school.motto}
        </p>
      </div>
    </div>
  );
}
