"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { ImageOff, Loader2, Upload, X } from "lucide-react";

import { uploadCmsImage } from "@/app/(portal)/portal/actions/cms";
import { galleryImages } from "@/lib/images";
import { cn } from "@/lib/utils";

export type ImageValue = {
  imageId?: string | null;
  imageObjectKey?: string | null;
  imageAlt?: string | null;
};

type ImagePickerProps = {
  readonly value: ImageValue;
  readonly onChange: (value: ImageValue) => void;
};

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

function readAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.onerror = () => reject(new Error("read_failed"));
    reader.readAsDataURL(file);
  });
}

export function ImagePicker({ value, onChange }: ImagePickerProps) {
  const [tab, setTab] = useState<"gallery" | "upload">("gallery");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const selectedGallery = useMemo(
    () => galleryImages.find((image) => image.id === value.imageId),
    [value.imageId],
  );

  const previewUrl = selectedGallery
    ? selectedGallery.src.src
    : value.imageObjectKey
      ? `/cms-image/${value.imageObjectKey}`
      : null;

  function clear() {
    onChange({ imageId: null, imageObjectKey: null, imageAlt: null });
  }

  function pickGallery(id: string, alt: string) {
    onChange({ imageId: id, imageObjectKey: null, imageAlt: alt });
  }

  function handleUpload(file: File) {
    setError(null);
    if (!/^image\/(png|jpe?g|webp|gif)$/i.test(file.type)) {
      setError("Choose a PNG, JPG, WebP or GIF image.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("That image is larger than 8MB.");
      return;
    }
    startTransition(async () => {
      const dataBase64 = await readAsBase64(file);
      const result = await uploadCmsImage({
        fileName: file.name,
        mimeType: file.type,
        dataBase64,
      });
      if (!result.ok || !result.ref) {
        setError(
          result.error === "backend_required"
            ? "Uploading requires the live backend."
            : "Could not upload the image.",
        );
        return;
      }
      onChange({
        imageObjectKey: result.ref,
        imageId: null,
        imageAlt: value.imageAlt ?? "",
      });
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        {previewUrl ? (
          <div className="relative size-24 shrink-0 overflow-hidden rounded-xl border border-border bg-soft-cream">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Selected"
              className="size-full object-cover"
            />
          </div>
        ) : (
          <div className="flex size-24 shrink-0 items-center justify-center rounded-xl border border-dashed border-border bg-soft-cream text-muted-grey">
            <ImageOff aria-hidden="true" className="size-6" />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-charcoal">
            {previewUrl ? "Image selected" : "No image (an icon is shown)"}
          </p>
          {previewUrl ? (
            <button
              type="button"
              onClick={clear}
              className="mt-1 inline-flex items-center gap-1 text-sm font-bold text-red-700 hover:underline"
            >
              <X aria-hidden="true" className="size-3.5" />
              Remove image
            </button>
          ) : null}
        </div>
      </div>

      <div className="inline-flex rounded-full border border-border p-1">
        {(["gallery", "upload"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setTab(option)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-bold capitalize transition-colors",
              tab === option
                ? "bg-curry-orange text-white"
                : "text-muted-grey hover:text-charcoal",
            )}
          >
            {option === "gallery" ? "Choose from gallery" : "Upload"}
          </button>
        ))}
      </div>

      {tab === "gallery" ? (
        <div className="grid max-h-72 grid-cols-3 gap-2 overflow-y-auto rounded-2xl border border-border bg-soft-white p-2 sm:grid-cols-4">
          {galleryImages.map((image) => (
            <button
              key={image.id}
              type="button"
              onClick={() => pickGallery(image.id, image.alt)}
              className={cn(
                "relative aspect-square overflow-hidden rounded-lg border-2 transition-colors",
                value.imageId === image.id
                  ? "border-curry-orange"
                  : "border-transparent hover:border-curry-orange/40",
              )}
              title={image.title}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.src.src}
                alt={image.alt}
                loading="lazy"
                className="size-full object-cover"
              />
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-3 rounded-2xl border border-border bg-soft-white p-4">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) handleUpload(file);
              event.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={pending}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-curry-orange px-5 font-bold text-deep-orange transition-colors hover:bg-soft-cream disabled:opacity-60"
          >
            {pending ? (
              <Loader2 aria-hidden="true" className="size-5 animate-spin" />
            ) : (
              <Upload aria-hidden="true" className="size-5" />
            )}
            {pending ? "Uploading…" : "Choose an image from your computer"}
          </button>
          <p className="text-xs text-muted-grey">PNG, JPG, WebP or GIF, up to 8MB.</p>
        </div>
      )}

      {previewUrl ? (
        <label className="block text-sm font-bold text-charcoal">
          Image description (for accessibility)
          <input
            value={value.imageAlt ?? ""}
            onChange={(event) =>
              onChange({ ...value, imageAlt: event.target.value })
            }
            className="mt-2 min-h-11 w-full rounded-2xl border border-border bg-white px-4 font-normal"
            placeholder="Describe the image"
          />
        </label>
      ) : null}

      {error ? (
        <p role="status" className="text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
