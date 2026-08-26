import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as familiesApi from "@/lib/api/families";
import type { FamilyInput } from "@/types/database";

export function useFamilies() {
  return useQuery({ queryKey: ["families"], queryFn: familiesApi.listFamilies });
}

export function useFamily(id: string | undefined) {
  return useQuery({
    queryKey: ["families", id],
    queryFn: () => familiesApi.getFamily(id as string),
    enabled: !!id,
  });
}

export function useCreateFamily() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: FamilyInput) => familiesApi.createFamily(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["families"] });
    },
  });
}

export function useUpdateFamily(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<FamilyInput>) => familiesApi.updateFamily(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["families"] });
      queryClient.invalidateQueries({ queryKey: ["families", id] });
    },
  });
}
