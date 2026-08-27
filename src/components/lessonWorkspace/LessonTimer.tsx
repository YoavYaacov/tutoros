import { useEffect, useState } from "react";

function formatElapsed(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

/** שעון עצר פשוט מ-actual_start — סופר קדימה בלבד, בלי התראה כשחורגים מהזמן המתוכנן */
export function LessonTimer({ startIso }: { startIso: string }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const elapsedMs = now - new Date(startIso).getTime();

  return (
    <span className="font-mono text-sm font-semibold text-ink-900" dir="ltr">
      {formatElapsed(elapsedMs)}
    </span>
  );
}
