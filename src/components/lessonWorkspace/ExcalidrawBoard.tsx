import { useCallback, useEffect, useRef } from "react";
import { Excalidraw, serializeAsJSON } from "@excalidraw/excalidraw";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import type { AppState, BinaryFiles } from "@excalidraw/excalidraw/types";
import "@excalidraw/excalidraw/index.css";
import { useAutosaveLessonBoard } from "@/hooks/useLessonBoards";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import type { SaveStatus } from "./SaveIndicator";

interface SceneSnapshot {
  elements: readonly ExcalidrawElement[];
  appState: AppState;
  files: BinaryFiles;
}

interface Props {
  boardId: string;
  initialData: Record<string, unknown> | null;
  onStatusChange: (status: SaveStatus) => void;
  onApiReady?: (api: ExcalidrawImperativeAPI) => void;
}

export function ExcalidrawBoard({ boardId, initialData, onStatusChange, onApiReady }: Props) {
  const autosave = useAutosaveLessonBoard(boardId);
  const latestSceneRef = useRef<SceneSnapshot | null>(null);

  const doSave = useCallback(() => {
    if (!latestSceneRef.current) return;
    const { elements, appState, files } = latestSceneRef.current;
    onStatusChange("saving");
    const boardData = JSON.parse(serializeAsJSON(elements, appState, files, "database"));
    autosave.mutate(boardData, {
      onSuccess: () => onStatusChange("saved"),
      onError: () => onStatusChange("error"),
    });
  }, [autosave, onStatusChange]);

  const { debounced, flush } = useDebouncedCallback(doSave, 2500);

  // שומר את השינוי האחרון שממתין ב-debounce לפני עזיבת המסך (unmount/ניווט)
  useEffect(() => () => flush(), [flush]);

  function handleChange(elements: readonly ExcalidrawElement[], appState: AppState, files: BinaryFiles) {
    latestSceneRef.current = { elements, appState, files };
    onStatusChange("editing");
    debounced();
  }

  return (
    <div className="h-full w-full">
      <Excalidraw
        excalidrawAPI={onApiReady}
        initialData={initialData ? { ...initialData, scrollToContent: true } : undefined}
        onChange={handleChange}
        langCode="he"
        theme="light"
      />
    </div>
  );
}
