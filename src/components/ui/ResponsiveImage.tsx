"use client";

import Image, { type ImageProps } from "next/image";
import { type SyntheticEvent, useState } from "react";

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

  async function handleLoad(event: SyntheticEvent<HTMLImageElement>) {
    try {
      await event.currentTarget.decode();
    } catch {
      // The load event still confirms the image is available if decoding
      // has already completed or the browser rejects a duplicate decode.
    }

    setLoadedSource(source);
    onLoad?.();
  }

  return (
    <Image
      src={image.src}
      alt={image.alt}
      fill
      sizes={sizes}
      preload={preload}
      loading={preload ? undefined : loading}
      className={cn(
        "object-cover transition-opacity duration-300 ease-out motion-reduce:transition-none",
        isLoaded ? "opacity-100" : "opacity-0",
        className,
      )}
      style={{ objectPosition: image.position }}
      onLoad={handleLoad}
      onError={onError}
    />
  );
}
