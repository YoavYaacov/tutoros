import { type ReactNode } from "react";

export function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="mb-3">
      <label className="mb-1 block text-sm font-medium text-ink-700">
        {label}
        {required && <span className="text-amber-600"> *</span>}
      </label>
      {children}
    </div>
  );
}

export const inputClass =
  "w-full rounded-lg border border-ink-100 px-3 py-2 text-sm text-ink-900 focus-visible:border-brand-600";
