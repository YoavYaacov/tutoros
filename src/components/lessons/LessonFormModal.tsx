import { FormEvent, useState } from "react";
import { Modal } from "@/components/shared/Modal";
import { FormField, inputClass } from "@/components/shared/FormField";
import { ErrorBanner, toErrorMessage } from "@/components/shared/Feedback";
import { useCreateLesson, useUpdateLesson } from "@/hooks/useLessons";
import { useCurrentPrice } from "@/hooks/usePricingAgreements";
import type { Lesson, LessonStatus } from "@/types/database";

interface Props {
  open: boolean;
  onClose: () => void;
  studentId: string;
  familyId: string;
  lesson?: Lesson;
  onSaved?: () => void;
}

function toLocalInputValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

export function LessonFormModal({ open, onClose, studentId, familyId, lesson, onSaved }: Props) {
  const isEdit = !!lesson;
  const { data: currentPrice } = useCurrentPrice(studentId);

  const defaultStart = new Date();
  defaultStart.setMinutes(0, 0, 0);
  defaultStart.setHours(defaultStart.getHours() + 1);
  const defaultDuration = currentPrice?.standard_duration ?? 60;
  const defaultEnd = new Date(defaultStart.getTime() + defaultDuration * 60_000);

  const [start, setStart] = useState(
    lesson ? toLocalInputValue(lesson.scheduled_start) : toLocalInputValue(defaultStart.toISOString()),
  );
  const [end, setEnd] = useState(
    lesson ? toLocalInputValue(lesson.scheduled_end) : toLocalInputValue(defaultEnd.toISOString()),
  );
  const [subject, setSubject] = useState(lesson?.subject ?? "מתמטיקה");
  const [topic, setTopic] = useState(lesson?.topic ?? "");
  const [status, setStatus] = useState<LessonStatus>(lesson?.status ?? "scheduled");
  const [error, setError] = useState<string | null>(null);

  const createMutation = useCreateLesson();
  const updateMutation = useUpdateLesson(lesson?.id ?? "");
  const submitting = createMutation.isPending || updateMutation.isPending;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const input = {
        student_id: studentId,
        family_id: familyId,
        scheduled_start: new Date(start).toISOString(),
        scheduled_end: new Date(end).toISOString(),
        subject: subject.trim() || null,
        topic: topic.trim() || null,
        status,
        // ננעל בזמן היצירה — לא מחושב מחדש ממחיר עתידי
        price_snapshot: currentPrice?.rate ?? lesson?.price_snapshot ?? null,
      };
      if (isEdit) {
        await updateMutation.mutateAsync(input);
      } else {
        await createMutation.mutateAsync(input);
      }
      onSaved?.();
      onClose();
    } catch (err) {
      setError(toErrorMessage(err));
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "עריכת שיעור" : "שיעור חדש"}>
      <form onSubmit={handleSubmit}>
        <p className="mb-3 text-xs text-ink-400">
          קביעה ידנית בשלב זה (ללא סנכרון Google Calendar — זה מגיע ב-Phase 5).
        </p>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="התחלה" required>
            <input
              type="datetime-local"
              className={inputClass}
              required
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </FormField>
          <FormField label="סיום" required>
            <input
              type="datetime-local"
              className={inputClass}
              required
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="מקצוע">
            <input className={inputClass} value={subject} onChange={(e) => setSubject(e.target.value)} />
          </FormField>
          <FormField label="נושא">
            <input className={inputClass} value={topic} onChange={(e) => setTopic(e.target.value)} />
          </FormField>
        </div>

        {isEdit && (
          <FormField label="סטטוס">
            <select
              className={inputClass}
              value={status}
              onChange={(e) => setStatus(e.target.value as LessonStatus)}
            >
              <option value="scheduled">מתוכנן</option>
              <option value="completed">התקיים</option>
              <option value="cancelled">בוטל</option>
              <option value="no_show">לא הגיע</option>
            </select>
          </FormField>
        )}

        {currentPrice && (
          <p className="mb-3 text-xs text-ink-400">
            מחיר שיינעל על השיעור: ₪{currentPrice.rate}
          </p>
        )}

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
