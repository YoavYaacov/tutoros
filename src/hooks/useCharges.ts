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

/** יצירת חיובים לכל המשפחות בבת אחת, מהמסך "תשלומים" — מרעננת גם חיובים וגם יתרות */
export function useGenerateChargesForAllFamilies() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => chargesApi.generateChargesForAllFamilies(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["charges"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });
}
