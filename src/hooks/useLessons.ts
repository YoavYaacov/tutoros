import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as lessonsApi from "@/lib/api/lessons";
import type { LessonInput, LessonStatus } from "@/types/database";

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
