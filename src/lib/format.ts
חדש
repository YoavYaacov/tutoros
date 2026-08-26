export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit", year: "numeric" });
}

const STATUS_LABELS: Record<string, string> = {
  scheduled: "מתוכנן",
  completed: "התקיים",
  cancelled: "בוטל",
  no_show: "לא הגיע",
};

export function statusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

const STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-brand-50 text-brand-700",
  completed: "bg-ink-100 text-ink-700",
  cancelled: "bg-amber-50 text-amber-600",
  no_show: "bg-amber-50 text-amber-600",
};

export function statusColorClass(status: string): string {
  return STATUS_COLORS[status] ?? "bg-ink-100 text-ink-700";
}
