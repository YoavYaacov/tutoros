import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as studentsApi from "@/lib/api/students";
import type { StudentInput } from "@/types/database";

export function useStudents() {
  return useQuery({ queryKey: ["students"], queryFn: studentsApi.listStudents });
}

export function useStudentsByFamily(familyId: string | undefined) {
  return useQuery({
    queryKey: ["students", "byFamily", familyId],
    queryFn: () => studentsApi.listStudentsByFamily(familyId as string),
    enabled: !!familyId,
  });
}

export function useStudent(id: string | undefined) {
  return useQuery({
    queryKey: ["students", id],
    queryFn: () => studentsApi.getStudent(id as string),
    enabled: !!id,
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: StudentInput) => studentsApi.createStudent(input),
    onSuccess: (student) => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["students", "byFamily", student.family_id] });
    },
  });
}

export function useUpdateStudent(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<StudentInput>) => studentsApi.updateStudent(id, input),
    onSuccess: (student) => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["students", id] });
      queryClient.invalidateQueries({ queryKey: ["students", "byFamily", student.family_id] });
    },
  });
}
