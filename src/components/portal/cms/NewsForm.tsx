"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Save, Trash2 } from "lucide-react";

import { IconSelect } from "@/components/portal/cms/IconSelect";
import { ImagePicker, type ImageValue } from "@/components/portal/cms/ImagePicker";
import {
  createNews,
  deleteNews,
  updateNews,
  type NewsInput,
} from "@/app/(portal)/portal/actions/cms";
import type { CmsNewsPost } from "@/lib/portal/data/cms";
import { portalRoutes } from "@/lib/portal/routes";

type Section = { heading: string; paragraphsText: string };

type NewsFormProps = {
  readonly post?: CmsNewsPost;
};

const fieldClass =
  "mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal";
const labelClass = "block text-sm font-bold text-charcoal";

function sectionsFromPost(post?: CmsNewsPost): Section[] {
  if (!post || post.body.length === 0) {
    return [{ heading: "", paragraphsText: "" }];
  }
  return post.body.map((section) => ({
    heading: section.heading ?? "",
    paragraphsText: section.paragraphs.join("\n\n"),
  }));
}

export function NewsForm({ post }: NewsFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [category, setCategory] = useState(post?.category ?? "Updates");
  const [icon, setIcon] = useState(post?.icon ?? "newspaper");
  const [publishedLabel, setPublishedLabel] = useState(
    post?.publishedLabel ?? "School Notice",
  );
  const [imageDescription, setImageDescription] = useState(
    post?.imageDescription ?? "",
  );
  const [status, setStatus] = useState<"draft" | "published">(
    post?.status ?? "draft",
  );
  const [image, setImage] = useState<ImageValue>({
    imageId: post?.imageId ?? null,
    imageObjectKey: post?.imageObjectKey ?? null,
    imageAlt: post?.imageAlt ?? null,
  });
  const [sections, setSections] = useState<Section[]>(sectionsFromPost(post));

  function buildInput(): NewsInput | null {
    const body = sections
      .map((section) => ({
        heading: section.heading.trim() || undefined,
        paragraphs: section.paragraphsText
          .split(/\n\s*\n/)
          .map((paragraph) => paragraph.trim())
          .filter(Boolean),
      }))
      .filter((section) => section.paragraphs.length > 0);

    if (!title.trim() || !excerpt.trim() || body.length === 0) {
      setMessage(
        "Add a title, an excerpt, and at least one body paragraph before saving.",
      );
      return null;
    }

    return {
      title: title.trim(),
      slug: slug.trim() || undefined,
      excerpt: excerpt.trim(),
      category: category.trim() || "Updates",
      icon,
      publishedLabel: publishedLabel.trim() || "School Notice",
      imageDescription: imageDescription.trim(),
      body,
      status,
      imageId: image.imageId ?? null,
      imageObjectKey: image.imageObjectKey ?? null,
      imageAlt: image.imageAlt ?? null,
    };
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = buildInput();
    if (!input) return;

    startTransition(async () => {
      const result = post
        ? await updateNews(post.id, input)
        : await createNews(input);

      if (!result.ok) {
        setMessage(
          result.error === "slug_taken"
            ? "That web address (slug) is already used by another article."
            : result.error === "backend_required"
              ? "Publishing requires the live backend (USE_REAL_PORTAL_AUTH)."
              : "Could not save the article. Please try again.",
        );
        return;
      }

      if (post) {
        setMessage("Saved. Changes are live on the website.");
        router.refresh();
      } else {
        router.push(portalRoutes.adminWebsiteNews);
        router.refresh();
      }
    });
  }

  function handleDelete() {
    if (!post) return;
    startTransition(async () => {
      const result = await deleteNews(post.id);
      if (!result.ok) {
        setMessage("Could not delete the article.");
        return;
      }
      router.push(portalRoutes.adminWebsiteNews);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className={labelClass}>
          Title
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className={fieldClass}
            placeholder="Example: Sports Day 2026"
          />
        </label>
        <label className={labelClass}>
          Web address (slug){" "}
          <span className="font-normal text-muted-grey">— optional</span>
          <input
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            className={fieldClass}
            placeholder="auto-generated from the title"
          />
        </label>
      </div>

      <label className={labelClass}>
        Excerpt
        <textarea
          value={excerpt}
          onChange={(event) => setExcerpt(event.target.value)}
          rows={2}
          className={`${fieldClass} py-3`}
          placeholder="A short summary shown on the news list and previews."
        />
      </label>

      <div className="grid gap-5 sm:grid-cols-3">
        <label className={labelClass}>
          Category
          <input
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className={fieldClass}
          />
        </label>
        <label className={labelClass}>
          Label
          <input
            value={publishedLabel}
            onChange={(event) => setPublishedLabel(event.target.value)}
            className={fieldClass}
            placeholder="e.g. School Notice"
          />
        </label>
        <label className={labelClass} htmlFor="news-icon">
          Icon
          <IconSelect
            id="news-icon"
            name="icon"
            value={icon}
            onChange={setIcon}
          />
        </label>
      </div>

      <label className={labelClass}>
        Placeholder description{" "}
        <span className="font-normal text-muted-grey">
          — shown with the icon when no image is set
        </span>
        <input
          value={imageDescription}
          onChange={(event) => setImageDescription(event.target.value)}
          className={fieldClass}
        />
      </label>

      <div>
        <span className={labelClass}>Image</span>
        <div className="mt-2">
          <ImagePicker value={image} onChange={setImage} />
        </div>
      </div>

      <fieldset className="space-y-4">
        <legend className="text-sm font-bold text-charcoal">Article body</legend>
        {sections.map((section, index) => (
          <div
            key={index}
            className="space-y-3 rounded-2xl border border-border bg-soft-white p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-bold tracking-[0.12em] text-muted-grey uppercase">
                Section {index + 1}
              </span>
              {sections.length > 1 ? (
                <button
                  type="button"
                  onClick={() =>
                    setSections((prev) => prev.filter((_, i) => i !== index))
                  }
                  className="inline-flex items-center gap-1 text-xs font-bold text-deep-orange hover:underline"
                >
                  <Trash2 aria-hidden="true" className="size-3.5" />
                  Remove
                </button>
              ) : null}
            </div>
            <label className="block text-xs font-bold text-charcoal">
              Heading{" "}
              <span className="font-normal text-muted-grey">— optional</span>
              <input
                value={section.heading}
                onChange={(event) =>
                  setSections((prev) =>
                    prev.map((item, i) =>
                      i === index
                        ? { ...item, heading: event.target.value }
                        : item,
                    ),
                  )
                }
                className={fieldClass}
              />
            </label>
            <label className="block text-xs font-bold text-charcoal">
              Paragraphs{" "}
              <span className="font-normal text-muted-grey">
                — separate paragraphs with a blank line
              </span>
              <textarea
                value={section.paragraphsText}
                onChange={(event) =>
                  setSections((prev) =>
                    prev.map((item, i) =>
                      i === index
                        ? { ...item, paragraphsText: event.target.value }
                        : item,
                    ),
                  )
                }
                rows={5}
                className={`${fieldClass} py-3`}
              />
            </label>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            setSections((prev) => [...prev, { heading: "", paragraphsText: "" }])
          }
          className="inline-flex items-center gap-2 rounded-full border border-curry-orange px-4 py-2 text-sm font-bold text-deep-orange transition-colors hover:bg-soft-cream"
        >
          <Plus aria-hidden="true" className="size-4" />
          Add section
        </button>
      </fieldset>

      <div className="flex flex-wrap items-center gap-4 border-t border-border pt-6">
        <label className={labelClass}>
          Status
          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as "draft" | "published")
            }
            className={`${fieldClass} min-w-40`}
          >
            <option value="draft">Draft (hidden)</option>
            <option value="published">Published (live)</option>
          </select>
        </label>
        <button
          type="submit"
          disabled={pending}
          className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-curry-orange px-6 font-bold text-white transition-colors hover:bg-deep-orange disabled:opacity-60"
        >
          <Save aria-hidden="true" className="size-5" />
          {pending ? "Saving…" : post ? "Save changes" : "Create article"}
        </button>
        {post ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={pending}
            className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full border border-red-200 px-5 font-bold text-red-700 transition-colors hover:bg-red-50 disabled:opacity-60"
          >
            <Trash2 aria-hidden="true" className="size-5" />
            Delete
          </button>
        ) : null}
      </div>

      {message ? (
        <p
          role="status"
          className="rounded-2xl border border-curry-orange/25 bg-soft-cream p-4 text-sm font-semibold text-charcoal"
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
