import { FormEvent, useState } from "react";
import { Modal } from "@/components/shared/Modal";
import { FormField, inputClass } from "@/components/shared/FormField";
import { ErrorBanner, toErrorMessage } from "@/components/shared/Feedback";
import { useCreateStudent, useUpdateStudent } from "@/hooks/useStudents";
import { useFamilies } from "@/hooks/useFamilies";
import type { Student } from "@/types/database";

interface Props {
  open: boolean;
  onClose: () => void;
  student?: Student;
  /** אם נפתח מתוך כרטיס משפחה — לנעול את המשפחה מראש */
  fixedFamilyId?: string;
  onSaved?: (student: Student) => void;
}

export function StudentFormModal({ open, onClose, student, fixedFamilyId, onSaved }: Props) {
  const isEdit = !!student;
  const { data: families } = useFamilies();

  const [familyId, setFamilyId] = useState(student?.family_id ?? fixedFamilyId ?? "");
  const [firstName, setFirstName] = useState(student?.first_name ?? "");
  const [lastName, setLastName] = useState(student?.last_name ?? "");
  const [grade, setGrade] = useState(student?.grade ?? "");
  const [school, setSchool] = useState(student?.school ?? "");
  const [subjects, setSubjects] = useState(student?.subjects?.join(", ") ?? "");
  const [phone, setPhone] = useState(student?.phone ?? "");
  const [error, setError] = useState<string | null>(null);

  const createMutation = useCreateStudent();
  const updateMutation = useUpdateStudent(student?.id ?? "");
  const submitting = createMutation.isPending || updateMutation.isPending;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!familyId) {
      setError("יש לבחור משפחה");
      return;
    }
    try {
      const input = {
        family_id: familyId,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        grade: grade.trim() || null,
        school: school.trim() || null,
        subjects: subjects
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        phone: phone.trim() || null,
      };
      const saved = isEdit
        ? await updateMutation.mutateAsync(input)
        : await createMutation.mutateAsync(input);
      onSaved?.(saved);
      onClose();
    } catch (err) {
      setError(toErrorMessage(err));
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "עריכת תלמיד" : "תלמיד חדש"}>
      <form onSubmit={handleSubmit}>
        {!fixedFamilyId && (
          <FormField label="משפחה" required>
            <select
              className={inputClass}
              required
              value={familyId}
              onChange={(e) => setFamilyId(e.target.value)}
            >
              <option value="">בחר משפחה...</option>
              {families?.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.family_name}
                </option>
              ))}
            </select>
          </FormField>
        )}

        <div className="grid grid-cols-2 gap-3">
          <FormField label="שם פרטי" required>
            <input
              className={inputClass}
              required
              autoFocus
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </FormField>
          <FormField label="שם משפחה" required>
            <input
              className={inputClass}
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="כיתה">
            <input className={inputClass} value={grade} onChange={(e) => setGrade(e.target.value)} />
          </FormField>
          <FormField label="בית ספר">
            <input
              className={inputClass}
              value={school}
              onChange={(e) => setSchool(e.target.value)}
            />
          </FormField>
        </div>

        <FormField label="מקצועות (מופרדים בפסיק)">
          <input
            className={inputClass}
            placeholder="מתמטיקה, פיזיקה"
            value={subjects}
            onChange={(e) => setSubjects(e.target.value)}
          />
        </FormField>

        <FormField label="טלפון">
          <input
            className={inputClass}
            dir="ltr"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </FormField>

        {error && (
          <div className="mb-3">
            <ErrorBanner message={error} />
          </div>
        )}

        <div className="mt-4 flex justify-start gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {submitting ? "שומר..." : "שמור"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-ink-400 hover:bg-ink-50"
          >
            ביטול
          </button>
        </div>
      </form>
    </Modal>
  );
}
