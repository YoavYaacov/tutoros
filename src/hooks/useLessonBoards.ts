import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as lessonBoardsApi from "@/lib/api/lessonBoards";
import type { LessonBoard } from "@/types/database";

export function useLessonBoard(lessonId: string | undefined) {
  return useQuery({
    queryKey: ["lessonBoards", "byLesson", lessonId],
    queryFn: () => lessonBoardsApi.getLessonBoardByLessonId(lessonId as string),
    enabled: !!lessonId,
  });
}

export function usePreviousBoardData(studentId: string | undefined, excludeLessonId: string | undefined) {
  return useQuery({
    queryKey: ["lessonBoards", "previous", studentId, excludeLessonId],
    queryFn: () => lessonBoardsApi.getPreviousBoardDataForStudent(studentId as string, excludeLessonId as string),
    enabled: !!studentId && !!excludeLessonId,
  });
}

/** יצירת לוח היא פעולה חד-פעמית לשיעור (לא צ'אטית) — invalidate רגיל */
export function useCreateLessonBoard(lessonId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ studentId, boardData }: { studentId: string; boardData?: Record<string, unknown> }) =>
      lessonBoardsApi.createLessonBoard(lessonId, studentId, boardData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessonBoards", "byLesson", lessonId] });
      queryClient.invalidateQueries({ queryKey: ["lessons", lessonId] });
    },
  });
}

/**
 * שמירה אוטומטית של תוכן הלוח (Excalidraw scene), בקצב גבוה (debounced) תוך כדי ציור.
 * כמו useAutosaveLessonFields — בכוונה setQueryData ולא invalidate, כדי לא "לרענן" את הלוח
 * מתחת ליד המשתמש באמצע עריכה (זה גם היה מאפס zoom/selection ב-Excalidraw).
 */
export function useAutosaveLessonBoard(boardId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (boardData: Record<string, unknown>) =>
      lessonBoardsApi.updateLessonBoardData(boardId as string, boardData),
    onSuccess: (updated) => {
      queryClient.setQueryData<LessonBoard>(["lessonBoards", "byLesson", updated.lesson_id], updated);
    },
  });
}
