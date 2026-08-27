import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as lessonsApi from "@/lib/api/lessons";
import type { Lesson, LessonInput, LessonStatus } from "@/types/database";

function startEndOfDay(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

export function useTodayLessons() {
  const { start, end } = startEndOfDay(new Date());
  return useQuery({
    queryKey: ["lessons", "range", start, end],
    queryFn: () => lessonsApi.listLessonsInRange(start, end),
  });
}

export function useUpcomingLessons(limit = 10) {
  return useQuery({
    queryKey: ["lessons", "upcoming", limit],
    queryFn: () => lessonsApi.listUpcomingLessons(limit),
  });
}

export function useLessonsByStudent(studentId: string | undefined) {
  return useQuery({
    queryKey: ["lessons", "byStudent", studentId],
    queryFn: () => lessonsApi.listLessonsByStudent(studentId as string),
    enabled: !!studentId,
  });
}

export function useLesson(id: string | undefined) {
  return useQuery({
    queryKey: ["lessons", id],
    queryFn: () => lessonsApi.getLesson(id as string),
    enabled: !!id,
  });
}

function invalidateAllLessonQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["lessons"] });
}

export function useCreateLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LessonInput) => lessonsApi.createLesson(input),
    onSuccess: () => invalidateAllLessonQueries(queryClient),
  });
}

export function useUpdateLesson(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<LessonInput>) => lessonsApi.updateLesson(id, input),
    onSuccess: () => invalidateAllLessonQueries(queryClient),
  });
}

export function useUpdateLessonStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: LessonStatus }) =>
      lessonsApi.updateLessonStatus(id, status),
    onSuccess: () => invalidateAllLessonQueries(queryClient),
  });
}

export function useStartLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => lessonsApi.startLesson(id),
    onSuccess: () => invalidateAllLessonQueries(queryClient),
  });
}

/**
 * שמירה אוטומטית של שדות שיעור (נושא/הערות/ש.בית) מ-Lesson Workspace, בקצב גבוה (debounced).
 * בכוונה לא עושה invalidateQueries כמו שאר המוטציות — זה היה גורם ל-refetch שמתחרה בעריכה חיה
 * של המשתמש. משתמשים ב-setQueryData עם התוצאה שכבר חזרה מהשרת במקום.
 */
export function useAutosaveLessonFields(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<LessonInput>) => lessonsApi.updateLesson(id, input),
    onSuccess: (updated) => {
      queryClient.setQueryData<Lesson>(["lessons", id], updated);
    },
  });
}
