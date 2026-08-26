export function LoadingBlock({ label = "טוען..." }: { label?: string }) {
  return <div className="py-10 text-center text-sm text-ink-400">{label}</div>;
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-600" role="alert">
      {message}
    </div>
  );
}

export function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
        active ? "bg-brand-50 text-brand-700" : "bg-ink-100 text-ink-400"
      }`}
    >
      {active ? "פעיל" : "לא פעיל"}
    </span>
  );
}

/** מייצר הודעת שגיאה קריאה ל-Supabase/PostgREST errors, ולא רק error.message גולמי */
export function toErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null && "message" in err) {
    return String((err as { message: unknown }).message);
  }
  return "אירעה שגיאה. נסה שוב.";
}
