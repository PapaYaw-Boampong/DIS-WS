"use client";

import { useEffect, useState } from "react";

import { ResponsiveImage } from "@/components/ui/ResponsiveImage";
import { cn } from "@/lib/utils";
import type { SiteImage } from "@/types/content";

type HeroImageRotatorProps = {
  images: readonly SiteImage[];
  sizes?: string;
  preload?: boolean;
  interval?: number;
  className?: string;
};

/**
 * Cross-fading background montage for page heroes. Each image sits in its own
 * absolutely-positioned layer so the wrapper opacity drives the fade while
 * ResponsiveImage keeps its own blur-up behaviour. Honors reduced-motion by
 * holding on the first frame.
 */
export function HeroImageRotator({
  images,
  sizes = "100vw",
  preload = false,
  interval = 6000,
  className,
}: HeroImageRotatorProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    function update() {
      setPrefersReducedMotion(mediaQuery.matches);
    }

    update();
    mediaQuery.addEventListener("change", update);

    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || images.length < 2) {
      return;
    }

    const timer = window.setInterval(() => {
      if (document.hidden) {
        return;
      }

      setActiveIndex((current) => (current + 1) % images.length);
    }, interval);

    return () => window.clearInterval(timer);
  }, [images.length, interval, prefersReducedMotion]);

  return (
    <div className={cn("absolute inset-0 -z-20", className)} aria-hidden="true">
      {images.map((image, index) => (
        <div
          key={image.id ?? index}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000 ease-out motion-reduce:transition-none",
            index === activeIndex ? "opacity-100" : "opacity-0",
          )}
        >
          <ResponsiveImage
            image={image}
            sizes={sizes}
            preload={preload && index === 0}
            loading={index === 0 ? undefined : "eager"}
          />
        </div>
      ))}
    </div>
  );
}
