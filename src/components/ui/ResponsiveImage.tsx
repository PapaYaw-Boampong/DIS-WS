"use client";

import Image from "next/image";

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
  return (
    <Image
      src={image.src}
      alt={image.alt}
      fill
      sizes={sizes}
      preload={preload}
      placeholder="blur"
      className={cn("object-cover", className)}
      style={{ objectPosition: image.position }}
      onLoad={onLoad}
    />
  );
}
