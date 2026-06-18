"use client";

import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";
import type { SiteImage } from "@/types/content";

type ResponsiveImageProps = {
  image: SiteImage;
  sizes: string;
  preload?: boolean;
  className?: string;
  onLoad?: () => void;
};

export function ResponsiveImage({
  image,
  sizes,
  preload = false,
  className,
  onLoad,
}: ResponsiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <Image
      src={image.src}
      alt={image.alt}
      fill
      sizes={sizes}
      preload={preload}
      placeholder="blur"
      className={cn(
        "site-image object-cover",
        isLoaded ? "site-image-loaded" : "site-image-pending",
        className,
      )}
      style={{ objectPosition: image.position }}
      onLoad={() => {
        setIsLoaded(true);
        onLoad?.();
      }}
    />
  );
}
