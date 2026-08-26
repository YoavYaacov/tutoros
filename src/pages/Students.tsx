import { useState } from "react";
import { Link } from "react-router-dom";
import { useStudents } from "@/hooks/useStudents";
import { useFamilies } from "@/hooks/useFamilies";
import { StudentFormModal } from "@/components/students/StudentFormModal";
import { LoadingBlock, ErrorBanner, ActiveBadge, toErrorMessage } from "@/components/shared/Feedback";

export default function Students() {
  const { data: students, isLoading, error } = useStudents();
  const { data: families } = useFamilies();
  const [modalOpen, setModalOpen] = useState(false);

  const familyNameById = new Map((families ?? []).map((f) => [f.id, f.family_name]));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink-900">תלמידים</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          + תלמיד חדש
        </button>
      </div>

      {isLoading && <LoadingBlock />}
      {error && <ErrorBanner message={toErrorMessage(error)} />}

      {students && students.length === 0 && (
        <div className="rounded-card border border-dashed border-ink-100 bg-white p-8 text-center text-ink-400">
          עדיין אין תלמידים. לחץ על "תלמיד חדש" כדי להתחיל.
        </div>
      )}

      {students && students.length > 0 && (
        <div className="overflow-hidden rounded-card bg-white ring-1 ring-ink-100">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-right text-ink-400">
              <tr>
                <th className="px-4 py-3 font-medium">תלמיד</th>
                <th className="px-4 py-3 font-medium">משפחה</th>
                <th className="px-4 py-3 font-medium">כיתה</th>
                <th className="px-4 py-3 font-medium">מקצועות</th>
                <th className="px-4 py-3 font-medium">סטטוס</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className="border-t border-ink-100 hover:bg-ink-50">
                  <td className="px-4 py-3">
                    <Link
                      to={`/students/${student.id}`}
                      className="font-medium text-brand-700 hover:underline"
                    >
                      {student.first_name} {student.last_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-700">
                    {familyNameById.get(student.family_id) ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-ink-700">{student.grade ?? "—"}</td>
                  <td className="px-4 py-3 text-ink-700">{student.subjects.join(", ") || "—"}</td>
                  <td className="px-4 py-3">
                    <ActiveBadge active={student.active} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <StudentFormModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
