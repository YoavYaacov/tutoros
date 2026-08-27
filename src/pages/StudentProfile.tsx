import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useStudent } from "@/hooks/useStudents";
import { useFamily } from "@/hooks/useFamilies";
import { useStudentsByFamily } from "@/hooks/useStudents";
import { useCurrentPrice, usePricingHistory } from "@/hooks/usePricingAgreements";
import { useLessonsByStudent } from "@/hooks/useLessons";
import { StudentFormModal } from "@/components/students/StudentFormModal";
import { PricingAgreementFormModal } from "@/components/pricing/PricingAgreementFormModal";
import { LessonFormModal } from "@/components/lessons/LessonFormModal";
import { LoadingBlock, ErrorBanner, ActiveBadge, toErrorMessage } from "@/components/shared/Feedback";
import { formatDate, formatTime, statusLabel, statusColorClass } from "@/lib/format";
import type { Lesson } from "@/types/database";

export default function StudentProfile() {
  const { id } = useParams<{ id: string }>();
  const { data: student, isLoading, error } = useStudent(id);
  const { data: family } = useFamily(student?.family_id);
  const { data: siblings } = useStudentsByFamily(student?.family_id);
  const { data: currentPrice } = useCurrentPrice(id);
  const { data: history } = usePricingHistory(id);

  const [editOpen, setEditOpen] = useState(false);
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | undefined>(undefined);

  function openNewLesson() {
    setEditingLesson(undefined);
    setLessonModalOpen(true);
  }
  function openEditLesson(lesson: Lesson) {
    setEditingLesson(lesson);
    setLessonModalOpen(true);
  }

  const { data: lessons } = useLessonsByStudent(id);

  if (isLoading) return <LoadingBlock />;
  if (error) return <ErrorBanner message={toErrorMessage(error)} />;
  if (!student) return <ErrorBanner message="התלמיד לא נמצא" />;

  const siblingCount = (siblings?.length ?? 1) - 1;

  return (
    <div>
      <Link to="/students" className="mb-4 inline-block text-sm text-ink-400 hover:text-brand-700">
        ← חזרה לתלמידים
      </Link>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <h1 className="text-2xl font-bold text-ink-900">
              {student.first_name} {student.last_name}
            </h1>
            <ActiveBadge active={student.active} />
          </div>
          <p className="text-sm text-ink-400">
            {student.grade && `כיתה ${student.grade}`}
            {student.school && ` · ${student.school}`}
            {student.subjects.length > 0 && ` · ${student.subjects.join(", ")}`}
          </p>
        </div>
        <button
          onClick={() => setEditOpen(true)}
          className="rounded-lg px-3 py-2 text-sm font-medium text-ink-700 ring-1 ring-ink-100 hover:bg-ink-50"
        >
          ערוך פרטים
        </button>
      </div>

      {/* קישור למשפחה + אחים — דרישה מפורשת במסמך האב */}
      {family && (
        <Link
          to={`/families/${family.id}`}
          className="mb-6 block rounded-card bg-brand-50 p-4 text-sm text-brand-700 ring-1 ring-brand-100 hover:ring-brand-400"
        >
          משפחת {family.family_name}
          {siblingCount > 0 && ` — ${siblingCount + 1} תלמידים במערכת`}
          {" · "}
          <span className="underline">מעבר לכרטיס המשפחה ←</span>
        </Link>
      )}

      {/* פעולות מהירות — Zoom/Drive/לוח יופעלו ב-Phase 4-5. קביעת שיעור ידנית כבר זמינה */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          disabled
          className="cursor-not-allowed rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white opacity-50"
          title="יופעל ב-Phase 4 (Lesson Workspace)"
        >
          התחל שיעור
        </button>
        <button
          onClick={openNewLesson}
          className="rounded-lg px-4 py-2 text-sm font-medium text-ink-700 ring-1 ring-ink-100 hover:bg-ink-50"
        >
          + קבע שיעור
        </button>
        <button
          disabled
          className="cursor-not-allowed rounded-lg px-4 py-2 text-sm font-medium text-ink-400 ring-1 ring-ink-100 opacity-50"
          title="יופעל ב-Phase 5 (Zoom)"
        >
          Zoom
        </button>
        <button
          disabled
          className="cursor-not-allowed rounded-lg px-4 py-2 text-sm font-medium text-ink-400 ring-1 ring-ink-100 opacity-50"
          title="יופעל ב-Phase 5 (Google Drive)"
        >
          Drive
        </button>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-ink-900">מחיר ותשלום</h2>
        <button
          onClick={() => setPriceModalOpen(true)}
          className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          + הסכם מחיר חדש
        </button>
      </div>

      <div className="mb-6 rounded-card bg-white p-4 ring-1 ring-ink-100">
        {currentPrice ? (
          <p className="text-sm text-ink-700">
            מחיר נוכחי: <span className="font-bold text-ink-900">₪{currentPrice.rate}</span> ל-
            {currentPrice.standard_duration} דקות (בתוקף מ-{currentPrice.valid_from})
          </p>
        ) : (
          <p className="text-sm text-ink-400">אין הסכם מחיר פעיל כרגע.</p>
        )}
      </div>

      {history && history.length > 0 && (
        <div className="mb-6 overflow-hidden rounded-card bg-white ring-1 ring-ink-100">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-right text-ink-400">
              <tr>
                <th className="px-4 py-2 font-medium">מחיר</th>
                <th className="px-4 py-2 font-medium">משך</th>
                <th className="px-4 py-2 font-medium">בתוקף מ-</th>
                <th className="px-4 py-2 font-medium">בתוקף עד</th>
              </tr>
            </thead>
            <tbody>
              {history.map((agreement) => (
                <tr key={agreement.id} className="border-t border-ink-100">
                  <td className="px-4 py-2 text-ink-900">₪{agreement.rate}</td>
                  <td className="px-4 py-2 text-ink-700">{agreement.standard_duration} דק'</td>
                  <td className="px-4 py-2 text-ink-700">{agreement.valid_from}</td>
                  <td className="px-4 py-2 text-ink-700">{agreement.valid_until ?? "היום"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* שיעור אחרון / עתידיים / היסטוריה */}
      {(() => {
        const now = new Date();
        const past = (lessons ?? []).filter((l) => new Date(l.scheduled_start) <= now);
        const future = (lessons ?? [])
          .filter((l) => new Date(l.scheduled_start) > now)
          .sort((a, b) => a.scheduled_start.localeCompare(b.scheduled_start));
        const lastLesson = past[0]; // lessons already sorted desc by scheduled_start

        return (
          <>
            <h2 className="mb-3 text-lg font-bold text-ink-900">השיעור האחרון</h2>
            {lastLesson ? (
              <div className="mb-6 rounded-card bg-white p-4 ring-1 ring-ink-100">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium text-ink-900">
                    {formatDate(lastLesson.scheduled_start)} · {formatTime(lastLesson.scheduled_start)}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColorClass(lastLesson.status)}`}>
                    {statusLabel(lastLesson.status)}
                  </span>
                </div>
                {lastLesson.topic && <p className="text-sm text-ink-700">נושא: {lastLesson.topic}</p>}
                {lastLesson.lesson_notes && (
                  <p className="mt-1 text-sm text-ink-700">הערות: {lastLesson.lesson_notes}</p>
                )}
                {lastLesson.homework && (
                  <p className="mt-1 text-sm text-ink-700">שיעורי בית: {lastLesson.homework}</p>
                )}
              </div>
            ) : (
              <div className="mb-6 rounded-card border border-dashed border-ink-100 bg-white p-6 text-center text-ink-400">
                עדיין לא היו שיעורים.
              </div>
            )}

            <h2 className="mb-3 text-lg font-bold text-ink-900">
              שיעורים עתידיים {future.length > 0 && `(${future.length})`}
            </h2>
            {future.length === 0 ? (
              <div className="mb-6 rounded-card border border-dashed border-ink-100 bg-white p-6 text-center text-ink-400">
                אין שיעורים עתידיים מתוכננים.
              </div>
            ) : (
              <div className="mb-6 space-y-2">
                {future.map((lesson) => (
                  <div
                    key={lesson.id}
                    onClick={() => openEditLesson(lesson)}
                    className="flex cursor-pointer items-center justify-between rounded-card bg-white p-3 text-sm ring-1 ring-ink-100 hover:ring-brand-400"
                  >
                    <span className="text-ink-700">
                      {formatDate(lesson.scheduled_start)} · {formatTime(lesson.scheduled_start)}
                    </span>
                    <span className="text-ink-400">{lesson.subject}</span>
                  </div>
                ))}
              </div>
            )}

            <h2 className="mb-3 text-lg font-bold text-ink-900">היסטוריית שיעורים</h2>
            {past.length === 0 ? (
              <div className="rounded-card border border-dashed border-ink-100 bg-white p-6 text-center text-ink-400">
                אין עדיין היסטוריה.
              </div>
            ) : (
              <div className="overflow-hidden rounded-card bg-white ring-1 ring-ink-100">
                <table className="w-full text-sm">
                  <thead className="bg-ink-50 text-right text-ink-400">
                    <tr>
                      <th className="px-4 py-2 font-medium">תאריך</th>
                      <th className="px-4 py-2 font-medium">נושא</th>
                      <th className="px-4 py-2 font-medium">סטטוס</th>
                      <th className="px-4 py-2 font-medium">מחיר</th>
                    </tr>
                  </thead>
                  <tbody>
                    {past.map((lesson) => (
                      <tr
                        key={lesson.id}
                        onClick={() => openEditLesson(lesson)}
                        className="cursor-pointer border-t border-ink-100 hover:bg-ink-50"
                      >
                        <td className="px-4 py-2 text-ink-700">
                          {formatDate(lesson.scheduled_start)} {formatTime(lesson.scheduled_start)}
                        </td>
                        <td className="px-4 py-2 text-ink-700">{lesson.topic ?? "—"}</td>
                        <td className="px-4 py-2">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColorClass(lesson.status)}`}>
                            {statusLabel(lesson.status)}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-ink-700">
                          {lesson.price_snapshot != null ? `₪${lesson.price_snapshot}` : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        );
      })()}

      <StudentFormModal open={editOpen} onClose={() => setEditOpen(false)} student={student} />
      <PricingAgreementFormModal
        open={priceModalOpen}
        onClose={() => setPriceModalOpen(false)}
        studentId={student.id}
        familyId={student.family_id}
      />
      <LessonFormModal
        open={lessonModalOpen}
        onClose={() => setLessonModalOpen(false)}
        studentId={student.id}
        familyId={student.family_id}
        lesson={editingLesson}
      />
    </div>
  );
}
