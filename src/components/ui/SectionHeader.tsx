import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow ? (
        <p className="mb-3 text-sm font-extrabold tracking-[0.18em] text-curry-orange uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-balance text-3xl font-extrabold tracking-[-0.03em] text-charcoal sm:text-4xl lg:text-[2.625rem] lg:leading-[1.15]">
        {title}
      </h2>
      {description ? (
        <p className="mt-5 text-lg leading-8 text-muted-grey">{description}</p>
      ) : null}
    </div>
  );
}
