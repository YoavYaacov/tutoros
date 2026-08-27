import { FormEvent, useEffect, useState } from "react";
import { Modal } from "@/components/shared/Modal";
import { FormField, inputClass } from "@/components/shared/FormField";
import { ErrorBanner, toErrorMessage } from "@/components/shared/Feedback";
import { useUpdateLesson } from "@/hooks/useLessons";

interface Props {
  open: boolean;
  onClose: () => void;
  lessonId: string;
  actualStartIso: string;
  initialTopic: string;
  initialNotes: string;
  initialHomework: string;
  onSaved: () => void;
}

export function EndLessonModal({
  open,
  onClose,
  lessonId,
  actualStartIso,
  initialTopic,
  initialNotes,
  initialHomework,
  onSaved,
}: Props) {
  const [duration, setDuration] = useState("");
  const [topic, setTopic] = useState(initialTopic);
  const [notes, setNotes] = useState(initialNotes);
  const [homework, setHomework] = useState(initialHomework);
  const [error, setError] = useState<string | null>(null);

  // המודל הזה נשאר mounted ברקע (open=false) מרגע כניסה ל-Workspace, אז לא ניתן להסתמך על ה-mount
  // הראשוני לחישוב משך זמן/ערכים עדכניים — מאתחלים מחדש בכל פתיחה בפועל
  useEffect(() => {
    if (!open) return;
    const computedMinutes = Math.max(
      1,
      Math.round((Date.now() - new Date(actualStartIso).getTime()) / 60_000),
    );
    setDuration(String(computedMinutes));
    setTopic(initialTopic);
    setNotes(initialNotes);
    setHomework(initialHomework);
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const updateMutation = useUpdateLesson(lessonId);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await updateMutation.mutateAsync({
        status: "completed",
        actual_end: new Date().toISOString(),
        actual_duration: Number(duration),
        topic: topic.trim() || null,
        lesson_notes: notes.trim() || null,
        homework: homework.trim() || null,
      });
      onSaved();
    } catch (err) {
      setError(toErrorMessage(err));
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="סיום שיעור">
      <form onSubmit={handleSubmit}>
        <FormField label="משך השיעור בפועל (דקות)" required>
          <input
            type="number"
            min={1}
            className={inputClass}
            required
            autoFocus
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        </FormField>
        <FormField label="נושא">
          <input className={inputClass} value={topic} onChange={(e) => setTopic(e.target.value)} />
        </FormField>
        <FormField label="הערות">
          <textarea
            className={inputClass}
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </FormField>
        <FormField label="שיעורי בית">
          <textarea
            className={inputClass}
            rows={3}
            value={homework}
            onChange={(e) => setHomework(e.target.value)}
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
            disabled={updateMutation.isPending}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {updateMutation.isPending ? "שומר..." : "סיים שיעור"}
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
