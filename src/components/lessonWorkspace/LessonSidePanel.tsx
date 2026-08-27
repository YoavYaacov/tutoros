import { FormField, inputClass } from "@/components/shared/FormField";
import { SaveIndicator, type SaveStatus } from "./SaveIndicator";
import { formatDate, formatTime } from "@/lib/format";
import type { Lesson } from "@/types/database";

interface Props {
  previousLesson: Lesson | undefined;
  topic: string;
  notes: string;
  homework: string;
  onChangeTopic: (value: string) => void;
  onChangeNotes: (value: string) => void;
  onChangeHomework: (value: string) => void;
  saveStatus: SaveStatus;
}

export function LessonSidePanel({
  previousLesson,
  topic,
  notes,
  homework,
  onChangeTopic,
  onChangeNotes,
  onChangeHomework,
  saveStatus,
}: Props) {
  return (
    <aside className="flex w-80 shrink-0 flex-col gap-4 overflow-y-auto border-r border-ink-100 bg-white p-4">
      {previousLesson && (
        <div className="rounded-card bg-surface p-3 text-sm">
          <p className="mb-1 text-xs font-medium text-ink-400">
            השיעור הקודם · {formatDate(previousLesson.scheduled_start)}{" "}
            {formatTime(previousLesson.scheduled_start)}
          </p>
          {previousLesson.topic && <p className="text-ink-700">נושא: {previousLesson.topic}</p>}
          {previousLesson.homework && <p className="text-ink-700">ש.בית: {previousLesson.homework}</p>}
          {!previousLesson.topic && !previousLesson.homework && (
            <p className="text-ink-400">אין פרטים נוספים</p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-ink-900">השיעור הנוכחי</h2>
        <SaveIndicator status={saveStatus} />
      </div>

      <FormField label="נושא">
        <input className={inputClass} value={topic} onChange={(e) => onChangeTopic(e.target.value)} />
      </FormField>
      <FormField label="הערות">
        <textarea
          className={inputClass}
          rows={4}
          value={notes}
          onChange={(e) => onChangeNotes(e.target.value)}
        />
      </FormField>
      <FormField label="שיעורי בית">
        <textarea
          className={inputClass}
          rows={3}
          value={homework}
          onChange={(e) => onChangeHomework(e.target.value)}
        />
      </FormField>
    </aside>
  );
}
