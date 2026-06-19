import Link from "next/link";
import type {
  ButtonHTMLAttributes,
  MouseEventHandler,
  ReactNode,
} from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "text";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = {
  children: ReactNode;
  className?: string;
  href?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  onLinkClick?: MouseEventHandler<HTMLAnchorElement>;
  ariaLabel?: string;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-curry-orange text-white shadow-sm hover:bg-deep-orange focus-visible:outline-curry-orange",
  secondary:
    "border border-curry-orange bg-white text-curry-orange hover:bg-soft-cream",
  text: "px-0 text-curry-orange hover:text-deep-orange",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-10 px-5 text-sm",
  md: "min-h-12 px-7 text-sm",
  lg: "min-h-14 px-8 text-base",
};

export function Button({
  children,
  className,
  href,
  variant = "primary",
  size = "md",
  type = "button",
  disabled = false,
  onClick,
  onLinkClick,
  ariaLabel,
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center rounded-full font-semibold transition-colors duration-200",
    "focus-visible:outline-2 focus-visible:outline-offset-3",
    variantClasses[variant],
    variant === "text" ? "min-h-0" : sizeClasses[size],
    disabled && "pointer-events-none opacity-50",
    className,
  );

  if (href) {
    return (
      <Link
        className={classes}
        href={href}
        aria-label={ariaLabel}
        onClick={onLinkClick}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      className={classes}
      type={type}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
