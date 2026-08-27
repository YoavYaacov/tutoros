import { FormEvent, useEffect, useState } from "react";
import { Modal } from "@/components/shared/Modal";
import { FormField, inputClass } from "@/components/shared/FormField";
import { ErrorBanner, toErrorMessage } from "@/components/shared/Feedback";
import { useRecordPayment } from "@/hooks/usePayments";
import { formatCurrency } from "@/lib/format";

interface Props {
  open: boolean;
  onClose: () => void;
  familyId: string;
  balance: number;
  onSaved?: () => void;
}

export function PaymentFormModal({ open, onClose, familyId, balance, onSaved }: Props) {
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recordMutation = useRecordPayment();

  // מאתחל את הטופס עם היתרה העדכנית בכל פתיחה מחדש (המודל נשאר mounted גם כשסגור)
  useEffect(() => {
    if (open) {
      setAmount(balance > 0 ? String(balance) : "");
      setError(null);
    }
  }, [open, balance]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const numericAmount = Number(amount);
    if (numericAmount > balance) {
      setError(`הסכום גבוה מהיתרה הפתוחה (${formatCurrency(balance)})`);
      return;
    }
    try {
      await recordMutation.mutateAsync({
        family_id: familyId,
        amount: numericAmount,
        payment_date: paymentDate,
        payment_method: paymentMethod.trim() || null,
        reference: reference.trim() || null,
        notes: notes.trim() || null,
      });
      onSaved?.();
      onClose();
    } catch (err) {
      setError(toErrorMessage(err));
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="סימון תשלום">
      <p className="mb-3 text-xs text-ink-400">
        יתרה פתוחה כרגע: <span className="font-semibold text-ink-700">{formatCurrency(balance)}</span>.
        התשלום ישויך אוטומטית לחיובים הפתוחים של המשפחה, מהישן לחדש.
      </p>
      <form onSubmit={handleSubmit}>
        <FormField label="סכום (₪)" required>
          <input
            type="number"
            min={0}
            max={balance}
            step="1"
            className={inputClass}
            required
            autoFocus
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="תאריך תשלום" required>
            <input
              type="date"
              className={inputClass}
              required
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />
          </FormField>
          <FormField label="אמצעי תשלום">
            <input
              type="text"
              className={inputClass}
              placeholder="ביט / העברה / מזומן"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
          </FormField>
        </div>

        <FormField label="אסמכתא">
          <input
            type="text"
            className={inputClass}
            value={reference}
            onChange={(e) => setReference(e.target.value)}
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
            disabled={recordMutation.isPending || balance <= 0}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {recordMutation.isPending ? "שומר..." : "שמור תשלום"}
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
