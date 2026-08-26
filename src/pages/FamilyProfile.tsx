import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useFamily } from "@/hooks/useFamilies";
import { useStudentsByFamily } from "@/hooks/useStudents";
import { FamilyFormModal } from "@/components/families/FamilyFormModal";
import { StudentFormModal } from "@/components/students/StudentFormModal";
import { LoadingBlock, ErrorBanner, ActiveBadge, toErrorMessage } from "@/components/shared/Feedback";

export default function FamilyProfile() {
  const { id } = useParams<{ id: string }>();
  const { data: family, isLoading, error } = useFamily(id);
  const { data: students } = useStudentsByFamily(id);

  const [editOpen, setEditOpen] = useState(false);
  const [addStudentOpen, setAddStudentOpen] = useState(false);

  if (isLoading) return <LoadingBlock />;
  if (error) return <ErrorBanner message={toErrorMessage(error)} />;
  if (!family) return <ErrorBanner message="המשפחה לא נמצאה" />;

  return (
    <div>
      <Link to="/families" className="mb-4 inline-block text-sm text-ink-400 hover:text-brand-700">
        ← חזרה למשפחות
      </Link>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <h1 className="text-2xl font-bold text-ink-900">משפחת {family.family_name}</h1>
            <ActiveBadge active={family.active} />
          </div>
          <p className="text-sm text-ink-400">
            הורה/משלם: {family.payer_name}
            {family.phone && ` · ${family.phone}`}
            {family.email && ` · ${family.email}`}
          </p>
        </div>
        <button
          onClick={() => setEditOpen(true)}
          className="rounded-lg px-3 py-2 text-sm font-medium text-ink-700 ring-1 ring-ink-100 hover:bg-ink-50"
        >
          ערוך פרטים
        </button>
      </div>

      {family.notes && (
        <div className="mb-6 rounded-card bg-white p-4 text-sm text-ink-700 ring-1 ring-ink-100">
          {family.notes}
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-ink-900">
          ילדים במשפחה {students ? `(${students.length})` : ""}
        </h2>
        <button
          onClick={() => setAddStudentOpen(true)}
          className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          + תלמיד חדש
        </button>
      </div>

      {students && students.length === 0 && (
        <div className="rounded-card border border-dashed border-ink-100 bg-white p-6 text-center text-ink-400">
          אין עדיין תלמידים במשפחה זו.
        </div>
      )}

      {students && students.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {students.map((student) => (
            <Link
              key={student.id}
              to={`/students/${student.id}`}
              className="rounded-card bg-white p-4 ring-1 ring-ink-100 transition hover:ring-brand-400"
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="font-medium text-ink-900">
                  {student.first_name} {student.last_name}
                </span>
                <ActiveBadge active={student.active} />
              </div>
              <p className="text-xs text-ink-400">
                {student.grade && `כיתה ${student.grade}`}
                {student.subjects.length > 0 && ` · ${student.subjects.join(", ")}`}
              </p>
            </Link>
          ))}
        </div>
      )}

      {/* Placeholder למקום שיציג בעתיד (Phase 2b/3): שיעורים בתקופה, חיובים, תשלומים, יתרה */}
      <div className="mt-6 rounded-card border border-dashed border-ink-100 bg-white p-6 text-center text-sm text-ink-400">
        חיובים, תשלומים ויתרת המשפחה יתווספו ב-Phase 3 (פיננסים).
      </div>

      <FamilyFormModal open={editOpen} onClose={() => setEditOpen(false)} family={family} />
      <StudentFormModal
        open={addStudentOpen}
        onClose={() => setAddStudentOpen(false)}
        fixedFamilyId={family.id}
      />
    </div>
  );
}
