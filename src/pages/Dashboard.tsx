export default function Dashboard() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink-900">היום שלך</h1>
        <button className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
          התחל שיעור
        </button>
      </div>

      <div className="rounded-card border border-dashed border-ink-100 bg-white p-8 text-center text-ink-400">
        Timeline של שיעורי היום, שיעורים קרובים, תשלומים פתוחים ו-KPI יתווספו ב-Phase 2
        <br />
        (ניהול ליבה — Families / Students / Lessons / Dashboard).
      </div>
    </div>
  );
}
