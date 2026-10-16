import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const controlClasses =
  "mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 text-charcoal outline-none transition focus:border-curry-orange focus:ring-4 focus:ring-curry-orange/10";

type FieldProps = {
  readonly label: string;
  readonly name: string;
  readonly required?: boolean;
  readonly hint?: string;
  readonly className?: string;
};

function Label({
  label,
  required,
  hint,
  className,
  children,
}: FieldProps & { readonly children: ReactNode }) {
  return (
    <label className={cn("block text-sm font-bold text-charcoal", className)}>
      <span>
        {label}
        {required ? (
          <span aria-hidden="true" className="ml-1 text-deep-orange">
            *
          </span>
        ) : null}
      </span>
      {children}
      {hint ? (
        <span className="mt-1.5 block text-xs font-medium text-muted-grey">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

export function TextField({
  type = "text",
  placeholder,
  defaultValue,
  ...field
}: FieldProps & {
  readonly type?: "text" | "email" | "tel" | "date" | "number";
  readonly placeholder?: string;
  readonly defaultValue?: string;
}) {
  return (
    <Label {...field}>
      <input
        type={type}
        name={field.name}
        required={field.required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className={cn(controlClasses, "font-normal")}
      />
    </Label>
  );
}

export function SelectField({
  options,
  defaultValue,
  ...field
}: FieldProps & {
  readonly options: readonly { readonly value: string; readonly label: string }[];
  readonly defaultValue?: string;
}) {
  return (
    <Label {...field}>
      <select
        name={field.name}
        required={field.required}
        defaultValue={defaultValue}
        className={cn(controlClasses, "font-normal")}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Label>
  );
}

export function TextAreaField({
  rows = 3,
  placeholder,
  ...field
}: FieldProps & {
  readonly rows?: number;
  readonly placeholder?: string;
}) {
  return (
    <Label {...field}>
      <textarea
        name={field.name}
        required={field.required}
        rows={rows}
        placeholder={placeholder}
        className={cn(controlClasses, "min-h-24 py-3 font-normal")}
      />
    </Label>
  );
}

export function FormSection({
  title,
  description,
  children,
}: {
  readonly title: string;
  readonly description?: string;
  readonly children: ReactNode;
}) {
  return (
    <section className="border-t border-border pt-6 first:border-t-0 first:pt-0">
      <h3 className="text-base font-extrabold text-charcoal">{title}</h3>
      {description ? (
        <p className="mt-1 text-sm leading-6 text-muted-grey">{description}</p>
      ) : null}
      <div className="mt-5 grid gap-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}
