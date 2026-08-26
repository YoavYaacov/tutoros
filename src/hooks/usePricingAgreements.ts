import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as pricingApi from "@/lib/api/pricingAgreements";
import type { PricingAgreementInput } from "@/types/database";

export function usePricingHistory(studentId: string | undefined) {
  return useQuery({
    queryKey: ["pricingAgreements", "byStudent", studentId],
    queryFn: () => pricingApi.listPricingAgreementsByStudent(studentId as string),
    enabled: !!studentId,
  });
}

export function useCurrentPrice(studentId: string | undefined) {
  return useQuery({
    queryKey: ["pricingAgreements", "current", studentId],
    queryFn: () => pricingApi.getCurrentPricingAgreement(studentId as string),
    enabled: !!studentId,
  });
}

export function useCreatePricingAgreement(studentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PricingAgreementInput) => pricingApi.createPricingAgreement(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricingAgreements", "byStudent", studentId] });
      queryClient.invalidateQueries({ queryKey: ["pricingAgreements", "current", studentId] });
    },
  });
}
