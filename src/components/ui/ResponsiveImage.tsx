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
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const isLoaded = initiallyLoaded || loadedSource === source;
  const hasFailed = failedSource === source;

  async function handleLoad(event: SyntheticEvent<HTMLImageElement>) {
    try {
      await event.currentTarget.decode();
    } catch {
      // The load event still confirms the image is available if decoding
      // has already completed or the browser rejects a duplicate decode.
    }

    setLoadedSource(source);
    setFailedSource(null);
    onLoad?.();
  }

  function handleError() {
    setFailedSource(source);
    onError?.();
  }

  return (
    <>
      <span
        className={cn(
          "pointer-events-none absolute inset-0 bg-soft-cream bg-cover bg-center transition-opacity duration-[350ms] ease-out motion-reduce:transition-none",
          isLoaded && !hasFailed ? "opacity-0" : "opacity-100",
          className,
        )}
        style={{
          backgroundImage: image.src.blurDataURL
            ? `url("${image.src.blurDataURL}")`
            : undefined,
          backgroundPosition: image.position,
          backgroundSize: image.fit ?? "cover",
        }}
        aria-hidden="true"
      />
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes={sizes}
        quality={image.quality}
        preload={preload}
        fetchPriority={preload ? "high" : undefined}
        loading={preload ? undefined : loading}
        decoding="async"
        className={cn(
          "transition-[opacity,filter] duration-[350ms] ease-out motion-reduce:transition-none",
          image.fit === "contain" ? "object-contain" : "object-cover",
          isLoaded && !hasFailed
            ? "blur-0 opacity-100"
            : "blur-sm opacity-0",
          className,
        )}
        style={{ objectPosition: image.position }}
        onLoad={handleLoad}
        onError={handleError}
      />
    </>
  );
}
