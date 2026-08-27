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

export function formatCurrency(amount: number): string {
  return `₪${amount.toLocaleString("he-IL", { maximumFractionDigits: 2 })}`;
}

const HEBREW_MONTHS = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
];

/** ממיר billing_period בפורמט "YYYY-MM" לתצוגה קריאה כמו "אוגוסט 2026" */
export function formatBillingPeriod(period: string): string {
  const [year, month] = period.split("-");
  const monthName = HEBREW_MONTHS[Number(month) - 1];
  return monthName ? `${monthName} ${year}` : period;
}

const CHARGE_STATUS_LABELS: Record<string, string> = {
  unpaid: "לא שולם",
  partial: "שולם חלקית",
  paid: "שולם",
  not_due: "טרם לחיוב",
};

export function chargeStatusLabel(status: string): string {
  return CHARGE_STATUS_LABELS[status] ?? status;
}

const CHARGE_STATUS_COLORS: Record<string, string> = {
  unpaid: "bg-amber-50 text-amber-600",
  partial: "bg-brand-50 text-brand-700",
  paid: "bg-ink-100 text-ink-700",
  not_due: "bg-ink-100 text-ink-400",
};

export function chargeStatusColorClass(status: string): string {
  return CHARGE_STATUS_COLORS[status] ?? "bg-ink-100 text-ink-700";
}
