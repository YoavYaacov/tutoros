import { FormEvent, useState } from "react";
import { Modal } from "@/components/shared/Modal";
import { FormField, inputClass } from "@/components/shared/FormField";
import { ErrorBanner, toErrorMessage } from "@/components/shared/Feedback";
import { useCreateFamily, useUpdateFamily } from "@/hooks/useFamilies";
import type { Family } from "@/types/database";

interface Props {
  open: boolean;
  onClose: () => void;
  /** אם קיים — עריכה, אחרת יצירה */
  family?: Family;
  onSaved?: (family: Family) => void;
}

export function FamilyFormModal({ open, onClose, family, onSaved }: Props) {
  const isEdit = !!family;
  const [familyName, setFamilyName] = useState(family?.family_name ?? "");
  const [payerName, setPayerName] = useState(family?.payer_name ?? "");
  const [phone, setPhone] = useState(family?.phone ?? "");
  const [email, setEmail] = useState(family?.email ?? "");
  const [notes, setNotes] = useState(family?.notes ?? "");
  const [error, setError] = useState<string | null>(null);

  const createMutation = useCreateFamily();
  const updateMutation = useUpdateFamily(family?.id ?? "");
  const submitting = createMutation.isPending || updateMutation.isPending;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const input = {
        family_name: familyName.trim(),
        payer_name: payerName.trim(),
        phone: phone.trim() || null,
        email: email.trim() || null,
        notes: notes.trim() || null,
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
    <Modal open={open} onClose={onClose} title={isEdit ? "עריכת משפחה" : "משפחה חדשה"}>
      <form onSubmit={handleSubmit}>
        <FormField label="שם משפחה" required>
          <input
            className={inputClass}
            required
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
            autoFocus
          />
        </FormField>
        <FormField label="שם ההורה/המשלם" required>
          <input
            className={inputClass}
            required
            value={payerName}
            onChange={(e) => setPayerName(e.target.value)}
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
        <FormField label="אימייל">
          <input
            type="email"
            className={inputClass}
            dir="ltr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
