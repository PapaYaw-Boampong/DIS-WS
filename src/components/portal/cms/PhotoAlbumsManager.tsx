"use client";

import { useState, useTransition } from "react";
import { ExternalLink, Images, Plus, Trash2 } from "lucide-react";

import {
  createPhotoAlbum,
  deletePhotoAlbum,
  updatePhotoAlbum,
} from "@/app/(portal)/portal/actions/cms";
import { ImagePicker } from "@/components/portal/cms/ImagePicker";
import { StatusBadge } from "@/components/portal/StatusBadge";
import type { CmsPhotoAlbum } from "@/lib/portal/data/cms";
import { cn } from "@/lib/utils";

type PhotoAlbumsManagerProps = {
  readonly albums: readonly CmsPhotoAlbum[];
};

const fieldClass =
  "mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal";

type ImageSelection = {
  imageId?: string | null;
  imageObjectKey?: string | null;
  imageAlt?: string | null;
};

export function PhotoAlbumsManager({ albums }: PhotoAlbumsManagerProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [pending, startTransition] = useTransition();
  const [cover, setCover] = useState<ImageSelection>({});

  function notify(ok: boolean, text: string) {
    setFailed(!ok);
    setMessage(text);
  }

  function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    startTransition(async () => {
      const result = await createPhotoAlbum({
        title: String(data.get("title") ?? "").trim(),
        description: String(data.get("description") ?? "").trim(),
        occasionLabel: String(data.get("occasionLabel") ?? "").trim(),
        albumUrl: String(data.get("albumUrl") ?? "").trim(),
        status: "draft",
        position: albums.length,
        ...cover,
      });

      if (!result.ok) {
        notify(false, result.error ?? "The album could not be saved.");
        return;
      }
      notify(
        true,
        "Album saved as a draft. Publish it to show it on the Student Life page.",
      );
      form.reset();
      setCover({});
    });
  }

  function togglePublish(album: CmsPhotoAlbum) {
    const next = album.status === "published" ? "draft" : "published";
    startTransition(async () => {
      const result = await updatePhotoAlbum(album.id, { status: next });
      notify(
        result.ok,
        result.ok
          ? next === "published"
            ? "Album published — families can see it now."
            : "Album unpublished and hidden from the website."
          : (result.error ?? "Could not change the album."),
      );
    });
  }

  function remove(album: CmsPhotoAlbum) {
    startTransition(async () => {
      const result = await deletePhotoAlbum(album.id);
      notify(
        result.ok,
        result.ok
          ? "Album removed from the website. The photos themselves are untouched."
          : "Could not remove the album.",
      );
    });
  }

  return (
    <div>
      <form onSubmit={handleCreate} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-bold text-charcoal">
            Album title
            <input
              name="title"
              required
              placeholder="e.g. Graduation 2026"
              className={fieldClass}
            />
          </label>
          <label className="block text-sm font-bold text-charcoal">
            Occasion
            <input
              name="occasionLabel"
              placeholder="e.g. July 2026"
              className={fieldClass}
            />
          </label>
        </div>

        <label className="block text-sm font-bold text-charcoal">
          Google Photos share link
          <input
            name="albumUrl"
            required
            inputMode="url"
            placeholder="https://photos.app.goo.gl/…"
            className={fieldClass}
          />
          <span className="mt-2 block text-sm leading-6 font-normal text-muted-grey">
            In Google Photos open the album, choose Share, then Create link and
            copy it. Only Google Photos links are accepted — the school website
            links out to this address, so it has to be one you trust.
          </span>
        </label>

        <label className="block text-sm font-bold text-charcoal">
          Short description
          <textarea
            name="description"
            rows={2}
            placeholder="What families will find in this album."
            className="mt-2 w-full rounded-2xl border border-border bg-white p-4 font-normal"
          />
        </label>

        <div>
          <p className="text-sm font-bold text-charcoal">Cover image</p>
          <p className="mt-1 text-sm leading-6 text-muted-grey">
            Optional. Choose one photo to represent the album on the website.
          </p>
          <div className="mt-3">
            <ImagePicker value={cover} onChange={setCover} />
          </div>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-curry-orange px-6 font-bold text-white transition-colors hover:bg-deep-orange disabled:opacity-40"
        >
          <Plus aria-hidden="true" className="size-5" />
          {pending ? "Saving…" : "Add album"}
        </button>
      </form>

      {message ? (
        <p
          role="status"
          className={cn(
            "mt-5 rounded-2xl border p-4 text-sm leading-6 font-semibold text-charcoal",
            failed
              ? "border-red-300 bg-red-50"
              : "border-curry-orange/25 bg-soft-cream",
          )}
        >
          {message}
        </p>
      ) : null}

      <ul className="mt-8 space-y-3">
        {albums.map((album) => (
          <li
            key={album.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-soft-white p-4"
          >
            <div className="min-w-0">
              <p className="font-bold text-charcoal">{album.title}</p>
              <p className="mt-0.5 text-sm text-muted-grey">
                {album.occasionLabel ? `${album.occasionLabel} · ` : ""}
                <a
                  href={album.albumUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1 font-semibold text-deep-orange hover:underline"
                >
                  Open album
                  <ExternalLink aria-hidden="true" className="size-3.5" />
                </a>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <StatusBadge
                variant={album.status === "published" ? "success" : "warning"}
              >
                {album.status === "published" ? "Published" : "Draft"}
              </StatusBadge>
              <button
                type="button"
                onClick={() => togglePublish(album)}
                disabled={pending}
                className="text-sm font-bold text-deep-orange transition-colors hover:text-curry-orange disabled:opacity-40"
              >
                {album.status === "published" ? "Unpublish" : "Publish"}
              </button>
              <button
                type="button"
                onClick={() => remove(album)}
                disabled={pending}
                aria-label={`Remove ${album.title}`}
                className="text-sm font-bold text-red-600 transition-colors hover:text-red-700 disabled:opacity-40"
              >
                <Trash2 aria-hidden="true" className="size-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {albums.length === 0 ? (
        <p className="mt-8 flex items-center gap-2 text-sm text-muted-grey">
          <Images aria-hidden="true" className="size-4" />
          No albums shared yet.
        </p>
      ) : null}
    </div>
  );
}
