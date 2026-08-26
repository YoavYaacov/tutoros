import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useStudent } from "@/hooks/useStudents";
import { useFamily } from "@/hooks/useFamilies";
import { useStudentsByFamily } from "@/hooks/useStudents";
import { useCurrentPrice, usePricingHistory } from "@/hooks/usePricingAgreements";
import { StudentFormModal } from "@/components/students/StudentFormModal";
import { PricingAgreementFormModal } from "@/components/pricing/PricingAgreementFormModal";
import { LoadingBlock, ErrorBanner, ActiveBadge, toErrorMessage } from "@/components/shared/Feedback";

export default function StudentProfile() {
  const { id } = useParams<{ id: string }>();
  const { data: student, isLoading, error } = useStudent(id);
  const { data: family } = useFamily(student?.family_id);
  const { data: siblings } = useStudentsByFamily(student?.family_id);
  const { data: currentPrice } = useCurrentPrice(id);
  const { data: history } = usePricingHistory(id);

  const [editOpen, setEditOpen] = useState(false);
  const [priceModalOpen, setPriceModalOpen] = useState(false);

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

      {/* פעולות מהירות — placeholders ל-Zoom/Drive/לוח שיתחברו ב-Phase 4-5 */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          disabled
          className="cursor-not-allowed rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white opacity-50"
          title="יופעל ב-Phase 4 (Lesson Workspace)"
        >
          התחל שיעור
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
          title="יופעל ב-Phase 5 (Google Calendar)"
        >
          קבע שיעור
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

      {/* Placeholder לשיעור אחרון/עתידיים/היסטוריה — Phase 2b */}
      <div className="rounded-card border border-dashed border-ink-100 bg-white p-6 text-center text-sm text-ink-400">
        השיעור האחרון, שיעורים עתידיים והיסטוריית שיעורים יתווספו בחלק הבא של Phase 2.
      </div>

      <StudentFormModal open={editOpen} onClose={() => setEditOpen(false)} student={student} />
      <PricingAgreementFormModal
        open={priceModalOpen}
        onClose={() => setPriceModalOpen(false)}
        studentId={student.id}
        familyId={student.family_id}
      />
    </div>
  );
}
