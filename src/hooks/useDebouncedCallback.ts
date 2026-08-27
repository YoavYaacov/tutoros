import { useCallback, useEffect, useRef } from "react";

/**
 * מחזיר גרסה "מבוזרת בזמן" (debounced) של פונקציה, פלוס flush() לביצוע מיידי —
 * חשוב לקרוא ל-flush לפני עזיבת מסך/unmount, כדי לא לאבד שינוי אחרון שממתין ב-debounce.
 */
export function useDebouncedCallback<A extends unknown[]>(fn: (...args: A) => void, delayMs: number) {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const debounced = useCallback(
    (...args: A) => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => fnRef.current(...args), delayMs);
    },
    [delayMs],
  );

  const flush = useCallback((...args: A) => {
    clearTimeout(timeoutRef.current);
    fnRef.current(...args);
  }, []);

  return { debounced, flush };
}
