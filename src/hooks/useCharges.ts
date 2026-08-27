import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as chargesApi from "@/lib/api/charges";

export function useChargesWithBalance(familyId: string | undefined) {
  return useQuery({
    queryKey: ["charges", "byFamily", familyId],
    queryFn: () => chargesApi.listChargesWithBalance(familyId as string),
    enabled: !!familyId,
  });
}

export function useChargeItems(chargeId: string | undefined) {
  return useQuery({
    queryKey: ["chargeItems", "byCharge", chargeId],
    queryFn: () => chargesApi.listChargeItemsByCharge(chargeId as string),
    enabled: !!chargeId,
  });
}

function invalidateBillingQueries(queryClient: ReturnType<typeof useQueryClient>) {
  // יצירת חיוב משפיעה גם על היתרות המוצגות דרך payments (balance/allBalances)
  queryClient.invalidateQueries({ queryKey: ["charges"] });
  queryClient.invalidateQueries({ queryKey: ["payments"] });
}

export function useGenerateCharges(familyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => chargesApi.generateChargesFromUnbilledLessons(familyId),
    onSuccess: () => invalidateBillingQueries(queryClient),
  });
}
