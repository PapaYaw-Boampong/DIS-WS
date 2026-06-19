"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";
import type { SiteImage } from "@/types/content";

type ResponsiveImageProps = {
  image: SiteImage;
  sizes: string;
  preload?: boolean;
  loading?: ImageProps["loading"];
  initiallyLoaded?: boolean;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
};

export function ResponsiveImage({
  image,
  sizes,
  preload = false,
  loading,
  initiallyLoaded = false,
  className,
  onLoad,
  onError,
}: ResponsiveImageProps) {
  const source = image.src.src;
  const [loadedSource, setLoadedSource] = useState<string | null>(
    initiallyLoaded ? source : null,
  );
  const isLoaded = initiallyLoaded || loadedSource === source;

  return (
    <Image
      src={image.src}
      alt={image.alt}
      fill
      sizes={sizes}
      preload={preload}
      loading={preload ? undefined : loading}
      className={cn(
        "object-cover",
        isLoaded ? "opacity-100" : "opacity-0",
        className,
      )}
      style={{ objectPosition: image.position }}
      onLoad={() => {
        setLoadedSource(source);
        onLoad?.();
      }}
      onError={onError}
    />
  );
}
