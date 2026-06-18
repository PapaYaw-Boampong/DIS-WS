import { ContentIcon } from "@/components/ui/ContentIcon";
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
      role="img"
      aria-label={article.imageDescription}
      className={cn(
        "pattern-checker relative flex min-h-64 items-center justify-center overflow-hidden rounded-card border border-curry-orange/10 bg-soft-cream",
        className,
      )}
    >
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
    </div>
  );
}
