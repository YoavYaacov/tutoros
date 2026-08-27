export type SaveStatus = "editing" | "saving" | "saved" | "error";

const LABELS: Record<SaveStatus, string> = {
  editing: "עריכה...",
  saving: "שומר...",
  saved: "נשמר",
  error: "שגיאת שמירה",
};

const DOT_COLORS: Record<SaveStatus, string> = {
  editing: "bg-ink-400",
  saving: "bg-brand-400",
  saved: "bg-brand-600",
  error: "bg-amber-600",
};

export function SaveIndicator({ status }: { status: SaveStatus }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-ink-400">
      <span className={`h-1.5 w-1.5 rounded-full ${DOT_COLORS[status]}`} />
      {LABELS[status]}
    </span>
  );
}
