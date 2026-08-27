import { Modal } from "@/components/shared/Modal";

interface Props {
  open: boolean;
  onChooseBlank: () => void;
  onChoosePrevious: () => void;
}

export function BoardStartChoiceModal({ open, onChooseBlank, onChoosePrevious }: Props) {
  return (
    <Modal open={open} onClose={onChooseBlank} title="איך להתחיל את הלוח?">
      <p className="mb-4 text-sm text-ink-700">
        נמצא לוח משיעור קודם של התלמיד. אפשר להתחיל ממנו, או בלוח ריק חדש.
      </p>
      <div className="flex justify-start gap-2">
        <button
          onClick={onChoosePrevious}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          המשך מהשיעור הקודם
        </button>
        <button
          onClick={onChooseBlank}
          className="rounded-lg px-4 py-2 text-sm font-medium text-ink-700 ring-1 ring-ink-100 hover:bg-ink-50"
        >
          לוח חדש
        </button>
      </div>
    </Modal>
  );
}
