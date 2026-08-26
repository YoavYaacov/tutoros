import { FormEvent, useState } from "react";
import { Modal } from "@/components/shared/Modal";
import { FormField, inputClass } from "@/components/shared/FormField";
import { ErrorBanner, toErrorMessage } from "@/components/shared/Feedback";
import { useCreatePricingAgreement } from "@/hooks/usePricingAgreements";

interface Props {
  open: boolean;
  onClose: () => void;
  studentId: string;
  familyId: string;
  onSaved?: () => void;
}

export function PricingAgreementFormModal({ open, onClose, studentId, familyId, onSaved }: Props) {
  const [rate, setRate] = useState("");
  const [standardDuration, setStandardDuration] = useState("60");
  const [validFrom, setValidFrom] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const createMutation = useCreatePricingAgreement(studentId);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createMutation.mutateAsync({
        student_id: studentId,
        family_id: familyId,
        rate: Number(rate),
        standard_duration: Number(standardDuration),
        valid_from: validFrom,
        notes: notes.trim() || null,
      });
      onSaved?.();
      onClose();
      setRate("");
      setNotes("");
    } catch (err) {
      setError(toErrorMessage(err));
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="הסכם מחיר חדש">
      <p className="mb-3 text-xs text-ink-400">
        הסכם מחיר קודם (אם קיים וללא תאריך סיום) ייסגר אוטומטית יום לפני תחילת ההסכם החדש.
        שיעורים היסטוריים לא ישתנו.
      </p>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="מחיר לשיעור (₪)" required>
            <input
              type="number"
              min={0}
              step="1"
              className={inputClass}
              required
              autoFocus
              value={rate}
              onChange={(e) => setRate(e.target.value)}
            />
          </FormField>
          <FormField label="משך שיעור (דקות)" required>
            <input
              type="number"
              min={1}
              className={inputClass}
              required
              value={standardDuration}
              onChange={(e) => setStandardDuration(e.target.value)}
            />
          </FormField>
        </div>

        <FormField label="בתוקף החל מ-" required>
          <input
            type="date"
            className={inputClass}
            required
            value={validFrom}
            onChange={(e) => setValidFrom(e.target.value)}
          />
        </FormField>

        <FormField label="הערות">
          <textarea
            className={inputClass}
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
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
            disabled={createMutation.isPending}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {createMutation.isPending ? "שומר..." : "שמור"}
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
