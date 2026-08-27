import { Link } from "react-router-dom";
import { useTodayLessons, useUpcomingLessons } from "@/hooks/useLessons";
import { useStudents } from "@/hooks/useStudents";
import { useAllFamilyBalances } from "@/hooks/usePayments";
import { LoadingBlock, ErrorBanner, toErrorMessage } from "@/components/shared/Feedback";
import { formatTime, formatDate, formatCurrency, statusLabel, statusColorClass } from "@/lib/format";

export default function Dashboard() {
  const { data: todayLessons, isLoading, error } = useTodayLessons();
  const { data: upcoming } = useUpcomingLessons(5);
  const { data: students } = useStudents();
  const { data: familyBalances } = useAllFamilyBalances();

  const studentById = new Map((students ?? []).map((s) => [s.id, s]));

  // KPI בסיסי — רק לשיעורי היום (KPI פיננסי מוצג בנפרד למטה)
  const completedToday = (todayLessons ?? []).filter((l) => l.status === "completed").length;
  const scheduledToday = (todayLessons ?? []).filter((l) => l.status === "scheduled").length;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink-900">היום שלך</h1>
        <span className="text-sm text-ink-400">{formatDate(new Date().toISOString())}</span>
      </div>

      {/* KPI בסיסי */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-card bg-white p-4 ring-1 ring-ink-100">
          <p className="text-xs text-ink-400">שיעורי היום</p>
          <p className="text-xl font-bold text-ink-900">{todayLessons?.length ?? 0}</p>
        </div>
        <div className="rounded-card bg-white p-4 ring-1 ring-ink-100">
          <p className="text-xs text-ink-400">התקיימו</p>
          <p className="text-xl font-bold text-ink-900">{completedToday}</p>
        </div>
        <div className="rounded-card bg-white p-4 ring-1 ring-ink-100">
          <p className="text-xs text-ink-400">ממתינים</p>
          <p className="text-xl font-bold text-ink-900">{scheduledToday}</p>
        </div>
        <div className="rounded-card bg-white p-4 ring-1 ring-ink-100">
          <p className="text-xs text-ink-400">שיעורים עתידיים</p>
          <p className="text-xl font-bold text-ink-900">{upcoming?.length ?? 0}</p>
        </div>
      </div>

      <h2 className="mb-3 text-lg font-bold text-ink-900">שיעורי היום</h2>

      {isLoading && <LoadingBlock />}
      {error && <ErrorBanner message={toErrorMessage(error)} />}

      {todayLessons && todayLessons.length === 0 && (
        <div className="mb-6 rounded-card border border-dashed border-ink-100 bg-white p-8 text-center text-ink-400">
          אין שיעורים מתוכננים להיום.
        </div>
      )}

      {todayLessons && todayLessons.length > 0 && (
        <div className="mb-8 space-y-2">
          {todayLessons.map((lesson) => {
            const student = studentById.get(lesson.student_id);
            return (
              <div
                key={lesson.id}
                className="flex items-center justify-between rounded-card bg-white p-4 ring-1 ring-ink-100"
              >
                <div className="flex items-center gap-4">
                  <span className="w-14 shrink-0 font-mono text-sm text-ink-700">
                    {formatTime(lesson.scheduled_start)}
                  </span>
                  <div>
                    <Link
                      to={student ? `/students/${student.id}` : "#"}
                      className="font-medium text-brand-700 hover:underline"
                    >
                      {student ? `${student.first_name} ${student.last_name}` : "תלמיד"}
                    </Link>
                    <p className="text-xs text-ink-400">
                      {student?.grade && `כיתה ${student.grade} · `}
                      {lesson.subject}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColorClass(lesson.status)}`}>
                    {statusLabel(lesson.status)}
                  </span>
                  {student && (
                    <Link
                      to={`/students/${student.id}`}
                      className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
                    >
                      פתח תלמיד
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <h2 className="mb-3 text-lg font-bold text-ink-900">שיעורים קרובים</h2>
      {upcoming && upcoming.length === 0 && (
        <div className="rounded-card border border-dashed border-ink-100 bg-white p-6 text-center text-ink-400">
          אין שיעורים עתידיים מתוכננים.
        </div>
      )}
      {upcoming && upcoming.length > 0 && (
        <div className="space-y-2">
          {upcoming.map((lesson) => {
            const student = studentById.get(lesson.student_id);
            return (
              <div
                key={lesson.id}
                className="flex items-center justify-between rounded-card bg-white p-3 text-sm ring-1 ring-ink-100"
              >
                <span className="text-ink-700">
                  {formatDate(lesson.scheduled_start)} · {formatTime(lesson.scheduled_start)}
                </span>
                <Link
                  to={student ? `/students/${student.id}` : "#"}
                  className="font-medium text-brand-700 hover:underline"
                >
                  {student ? `${student.first_name} ${student.last_name}` : "תלמיד"}
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {(() => {
        const balancesOwed = (familyBalances ?? []).filter((b) => b.balance > 0);
        const totalOutstanding = balancesOwed.reduce((sum, b) => sum + b.balance, 0);
        return (
          <div className="mt-8 flex items-center justify-between rounded-card bg-white p-4 ring-1 ring-ink-100">
            <div>
              <p className="text-xs text-ink-400">יתרה פתוחה לגבייה</p>
              <p className={`text-xl font-bold ${totalOutstanding ? "text-amber-600" : "text-ink-900"}`}>
                {formatCurrency(totalOutstanding)}
              </p>
              {balancesOwed.length > 0 && (
                <p className="text-xs text-ink-400">{balancesOwed.length} משפחות עם יתרה פתוחה</p>
              )}
            </div>
            <Link
              to="/payments"
              className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              למסך תשלומים
            </Link>
          </div>
        );
      })()}
    </div>
  );
}
