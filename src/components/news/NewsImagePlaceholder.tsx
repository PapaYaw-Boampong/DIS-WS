import { ContentIcon } from "@/components/ui/ContentIcon";
import { ResponsiveImage } from "@/components/ui/ResponsiveImage";
import { cn } from "@/lib/utils";
import type { NewsArticle } from "@/types/content";

type NewsImagePlaceholderProps = {
  article: NewsArticle;
  className?: string;
};

export function NewsImagePlaceholder({
  article,
  className,
}: NewsImagePlaceholderProps) {
  return (
    <div
      role={article.image ? undefined : "img"}
      aria-label={article.image ? undefined : article.imageDescription}
      className={cn(
        "pattern-checker relative flex min-h-64 items-center justify-center overflow-hidden rounded-card border border-curry-orange/10 bg-soft-cream",
        className,
      )}
    >
      {article.image ? (
        <ResponsiveImage
          image={article.image}
          sizes="(min-width: 1024px) 40vw, 100vw"
        />
      ) : (
        <>
          <div
            className="absolute size-60 rounded-full bg-curry-orange/10"
            aria-hidden="true"
          />
          <div className="relative flex flex-col items-center gap-4 px-8 text-center">
            <div className="flex size-20 items-center justify-center rounded-[1.5rem] bg-white text-curry-orange shadow-card">
              <ContentIcon name={article.icon} className="size-9" />
            </div>
            <span className="max-w-sm text-sm font-semibold text-charcoal/70">
              {article.category}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
