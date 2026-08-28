import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useLesson, useAutosaveLessonFields, useLessonsByStudent } from "@/hooks/useLessons";
import { useStudent } from "@/hooks/useStudents";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import { LessonSidePanel } from "@/components/lessonWorkspace/LessonSidePanel";
import { LessonTimer } from "@/components/lessonWorkspace/LessonTimer";
import { SaveIndicator, type SaveStatus } from "@/components/lessonWorkspace/SaveIndicator";
import { EndLessonModal } from "@/components/lessonWorkspace/EndLessonModal";
import { LoadingBlock, ErrorBanner, toErrorMessage } from "@/components/shared/Feedback";

// TODO: להעביר להגדרות כשמסך ההגדרות ייבנה (אותו דפוס מתוכנן ל-Zoom ב-Phase 5) —
// כרגע קישור קבוע לדשבורד iDroo; אם יש לך חדר קבוע שאתה תמיד חוזר אליו, תגיד לי ונקבע אותו כאן ישירות.
const IDROO_URL = "https://app.idroo.com/";

export default function LessonWorkspace() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();

  const { data: lesson, isLoading: lessonLoading, error: lessonError } = useLesson(lessonId);
  const { data: student } = useStudent(lesson?.student_id);
  const { data: allStudentLessons } = useLessonsByStudent(lesson?.student_id);

  const [endModalOpen, setEndModalOpen] = useState(false);

  // שדות השיעור (נושא/הערות/ש.בית) — state מקומי שנטען פעם אחת מהשיעור, לא מסתנכרן מחדש בכל refetch
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [homework, setHomework] = useState("");
  const [fieldsStatus, setFieldsStatus] = useState<SaveStatus>("saved");
  const fieldsSeededRef = useRef(false);
  const fieldsLatestRef = useRef({ topic: "", lesson_notes: "", homework: "" });

  useEffect(() => {
    if (fieldsSeededRef.current || !lesson) return;
    fieldsSeededRef.current = true;
    setTopic(lesson.topic ?? "");
    setNotes(lesson.lesson_notes ?? "");
    setHomework(lesson.homework ?? "");
    fieldsLatestRef.current = {
      topic: lesson.topic ?? "",
      lesson_notes: lesson.lesson_notes ?? "",
      homework: lesson.homework ?? "",
    };
  }, [lesson]);

  const autosaveFields = useAutosaveLessonFields(lessonId ?? "");
  const doSaveFields = useCallback(() => {
    setFieldsStatus("saving");
    autosaveFields.mutate(fieldsLatestRef.current, {
      onSuccess: () => setFieldsStatus("saved"),
      onError: () => setFieldsStatus("error"),
    });
  }, [autosaveFields]);
  const { debounced: debouncedFieldsSave, flush: flushFieldsSave } = useDebouncedCallback(doSaveFields, 2000);
  useEffect(() => () => flushFieldsSave(), [flushFieldsSave]);

  function handleTopicChange(value: string) {
    setTopic(value);
    fieldsLatestRef.current = { ...fieldsLatestRef.current, topic: value };
    setFieldsStatus("editing");
    debouncedFieldsSave();
  }
  function handleNotesChange(value: string) {
    setNotes(value);
    fieldsLatestRef.current = { ...fieldsLatestRef.current, lesson_notes: value };
    setFieldsStatus("editing");
    debouncedFieldsSave();
  }
  function handleHomeworkChange(value: string) {
    setHomework(value);
    fieldsLatestRef.current = { ...fieldsLatestRef.current, homework: value };
    setFieldsStatus("editing");
    debouncedFieldsSave();
  }

  if (lessonLoading) return <LoadingBlock />;
  if (lessonError) return <ErrorBanner message={toErrorMessage(lessonError)} />;
  if (!lesson) return <ErrorBanner message="השיעור לא נמצא" />;

  const previousLesson = (allStudentLessons ?? [])
    .filter((l) => l.id !== lesson.id && new Date(l.scheduled_start) < new Date(lesson.scheduled_start))
    .sort((a, b) => b.scheduled_start.localeCompare(a.scheduled_start))[0];

  return (
    <div className="flex h-screen flex-col bg-surface">
      <header className="flex items-center justify-between border-b border-ink-100 bg-white px-4 py-2">
        <div className="flex items-center gap-3">
          <Link to={`/students/${lesson.student_id}`} className="text-sm text-ink-400 hover:text-brand-700">
            ← חזרה לתלמיד
          </Link>
          <span className="font-bold text-ink-900">
            {student ? `${student.first_name} ${student.last_name}` : "..."}
          </span>
          {lesson.subject && <span className="text-sm text-ink-400">{lesson.subject}</span>}
        </div>

        <div className="flex items-center gap-4">
          {lesson.actual_start && <LessonTimer startIso={lesson.actual_start} />}
          <SaveIndicator status={fieldsStatus} />
          <button
            onClick={() => setEndModalOpen(true)}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            סיום שיעור
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <LessonSidePanel
          previousLesson={previousLesson}
          topic={topic}
          notes={notes}
          homework={homework}
          onChangeTopic={handleTopicChange}
          onChangeNotes={handleNotesChange}
          onChangeHomework={handleHomeworkChange}
          saveStatus={fieldsStatus}
        />

        <main className="flex min-w-0 flex-1 flex-col items-center justify-center gap-3">
          <a
            href={IDROO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-brand-600 px-6 py-3 text-lg font-semibold text-white hover:bg-brand-700"
          >
            פתח לוח iDroo
          </a>
          <p className="max-w-xs text-center text-sm text-ink-400">
            הלוח נפתח בטאב נפרד. כדי לחזור לכאן ולעדכן הערות/שיעורי בית או לסיים את השיעור — פשוט
            תחליף טאב.
          </p>
        </main>
      </div>

      {lesson.actual_start && (
        <EndLessonModal
          open={endModalOpen}
          onClose={() => setEndModalOpen(false)}
          lessonId={lesson.id}
          actualStartIso={lesson.actual_start}
          initialTopic={topic}
          initialNotes={notes}
          initialHomework={homework}
          onSaved={() => navigate(`/students/${lesson.student_id}`)}
        />
      )}
    </div>
  );
}
