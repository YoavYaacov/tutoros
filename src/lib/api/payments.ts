import { supabase } from "@/lib/supabase";
import type { Payment, PaymentInput } from "@/types/database";
import * as chargesApi from "@/lib/api/charges";

export async function listPaymentsByFamily(familyId: string): Promise<Payment[]> {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("family_id", familyId)
    .order("payment_date", { ascending: false });
  if (error) throw error;
  return data as Payment[];
}

async function createPayment(input: PaymentInput): Promise<Payment> {
  const { data, error } = await supabase.from("payments").insert(input).select().single();
  if (error) throw error;
  return data as Payment;
}

/** יתרה פתוחה של משפחה: סכום היתרות החיוביות (amount - שולם) על פני כל החיובים שלה */
export async function getFamilyBalance(familyId: string): Promise<number> {
  const charges = await chargesApi.listChargesWithBalance(familyId);
  return charges.reduce((sum, c) => sum + Math.max(c.balance, 0), 0);
}

/**
 * רושם תשלום למשפחה ומשייך אותו אוטומטית לחיובים הפתוחים שלה, מהישן לחדש (FIFO לפי billing_period).
 * חוסם תשלום שגבוה מהיתרה הפתוחה — נבדק *לפני* כל כתיבה, כדי לא להשאיר תשלום ללא שיוך מלא.
 */
export async function recordPaymentWithAllocation(input: PaymentInput): Promise<Payment> {
  const openCharges = (await chargesApi.listChargesWithBalance(input.family_id))
    .filter((c) => c.balance > 0)
    .sort((a, b) => a.billing_period.localeCompare(b.billing_period));

  const totalOpen = openCharges.reduce((sum, c) => sum + c.balance, 0);
  if (input.amount > totalOpen) {
    throw new Error(`הסכום (₪${input.amount}) גבוה מהיתרה הפתוחה (₪${totalOpen})`);
  }

  const payment = await createPayment(input);

  let remaining = input.amount;
  for (const charge of openCharges) {
    if (remaining <= 0) break;
    const allocation = Math.min(remaining, charge.balance);

    const { error: allocError } = await supabase.from("payment_allocations").insert({
      payment_id: payment.id,
      charge_id: charge.id,
      allocated_amount: allocation,
    });
    if (allocError) throw allocError;
    remaining -= allocation;

    const newPaid = charge.paid_amount + allocation;
    const { error: statusError } = await supabase
      .from("charges")
      .update({ status: newPaid >= charge.amount ? "paid" : "partial" })
      .eq("id", charge.id);
    if (statusError) throw statusError;
  }

  return payment;
}

export interface FamilyBalance {
  family_id: string;
  total_charged: number;
  total_paid: number;
  balance: number;
  /** תקופות החיוב (billing_period, "YYYY-MM") שעדיין יש בהן יתרה פתוחה, ממוינות מהישן לחדש */
  open_periods: string[];
}

/** יתרות של כל המשפחות בבת אחת — לשימוש במסך "תשלומים" וב-Dashboard */
export async function listAllFamilyBalances(): Promise<FamilyBalance[]> {
  const { data: charges, error: chargesError } = await supabase
    .from("charges")
    .select("id, family_id, amount, billing_period");
  if (chargesError) throw chargesError;
  if (!charges || charges.length === 0) return [];

  const { data: allocations, error: allocError } = await supabase
    .from("payment_allocations")
    .select("charge_id, allocated_amount")
    .in(
      "charge_id",
      charges.map((c) => c.id),
    );
  if (allocError) throw allocError;

  const paidByCharge = new Map<string, number>();
  for (const a of allocations ?? []) {
    paidByCharge.set(a.charge_id, (paidByCharge.get(a.charge_id) ?? 0) + a.allocated_amount);
  }

  const byFamily = new Map<string, FamilyBalance>();
  for (const c of charges) {
    const paid = paidByCharge.get(c.id) ?? 0;
    const chargeBalance = c.amount - paid;
    const existing: FamilyBalance = byFamily.get(c.family_id) ?? {
      family_id: c.family_id,
      total_charged: 0,
      total_paid: 0,
      balance: 0,
      open_periods: [],
    };
    existing.total_charged += c.amount;
    existing.total_paid += paid;
    existing.balance += chargeBalance;
    if (chargeBalance > 0) existing.open_periods.push(c.billing_period);
    byFamily.set(c.family_id, existing);
  }

  for (const family of byFamily.values()) {
    family.open_periods.sort();
  }
  return Array.from(byFamily.values());
}
