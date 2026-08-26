import { supabase } from "@/lib/supabase";
import type { PricingAgreement, PricingAgreementInput } from "@/types/database";

export async function listPricingAgreementsByStudent(
  studentId: string,
): Promise<PricingAgreement[]> {
  const { data, error } = await supabase
    .from("pricing_agreements")
    .select("*")
    .eq("student_id", studentId)
    .order("valid_from", { ascending: false });
  if (error) throw error;
  return data as PricingAgreement[];
}

/** ההסכם התקף היום (valid_from <= today <= valid_until, או valid_until ריק) */
export async function getCurrentPricingAgreement(
  studentId: string,
): Promise<PricingAgreement | null> {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("pricing_agreements")
    .select("*")
    .eq("student_id", studentId)
    .lte("valid_from", today)
    .or(`valid_until.is.null,valid_until.gte.${today}`)
    .order("valid_from", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as PricingAgreement | null;
}

/**
 * יצירת הסכם מחיר חדש. לעולם לא דורס הסכם קיים.
 * אם קיים הסכם פתוח (valid_until = null) לאותו תלמיד, סוגרים אותו יום אחד
 * לפני תחילת ההסכם החדש — כדי שלא יהיה חפיפה, בלי לגעת בהיסטוריה שכבר נעולה בשיעורים.
 */
export async function createPricingAgreement(
  input: PricingAgreementInput,
): Promise<PricingAgreement> {
  const { data: openAgreements, error: findError } = await supabase
    .from("pricing_agreements")
    .select("*")
    .eq("student_id", input.student_id)
    .is("valid_until", null);
  if (findError) throw findError;

  const newStart = new Date(input.valid_from);
  const closeDate = new Date(newStart);
  closeDate.setDate(closeDate.getDate() - 1);
  const closeDateStr = closeDate.toISOString().slice(0, 10);

  for (const agreement of openAgreements ?? []) {
    if (agreement.valid_from < input.valid_from) {
      const { error: closeError } = await supabase
        .from("pricing_agreements")
        .update({ valid_until: closeDateStr })
        .eq("id", agreement.id);
      if (closeError) throw closeError;
    }
  }

  const { data, error } = await supabase
    .from("pricing_agreements")
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as PricingAgreement;
}
