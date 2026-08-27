import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as paymentsApi from "@/lib/api/payments";
import type { PaymentInput } from "@/types/database";

export function usePaymentsByFamily(familyId: string | undefined) {
  return useQuery({
    queryKey: ["payments", "byFamily", familyId],
    queryFn: () => paymentsApi.listPaymentsByFamily(familyId as string),
    enabled: !!familyId,
  });
}

export function useFamilyBalance(familyId: string | undefined) {
  return useQuery({
    queryKey: ["payments", "balance", familyId],
    queryFn: () => paymentsApi.getFamilyBalance(familyId as string),
    enabled: !!familyId,
  });
}

export function useAllFamilyBalances() {
  return useQuery({
    queryKey: ["payments", "allBalances"],
    queryFn: paymentsApi.listAllFamilyBalances,
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PaymentInput) => paymentsApi.recordPaymentWithAllocation(input),
    onSuccess: () => {
      // תשלום משנה גם את יתרת החיובים וגם את היתרה המשפחתית/הכוללת
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["charges"] });
    },
  });
}
