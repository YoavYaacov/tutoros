import { supabase } from "@/lib/supabase";
import type { Charge, ChargeItem } from "@/types/database";

export interface ChargeWithBalance extends Charge {
  paid_amount: number;
  balance: number;
}

export async function listChargesByFamily(familyId: string): Promise<Charge[]> {
  const { data, error } = await supabase
    .from("charges")
    .select("*")
    .eq("family_id", familyId)
    .order("billing_period", { ascending: false });
  if (error) throw error;
  return data as Charge[];
}

/** מוסיף לכל חיוב כמה שולם עד כה ומה היתרה שלו, לפי payment_allocations */
export async function listChargesWithBalance(familyId: string): Promise<ChargeWithBalance[]> {
  const charges = await listChargesByFamily(familyId);
  if (charges.length === 0) return [];

  const { data: allocations, error } = await supabase
    .from("payment_allocations")
    .select("charge_id, allocated_amount")
    .in(
      "charge_id",
      charges.map((c) => c.id),
    );
  if (error) throw error;

  const paidByCharge = new Map<string, number>();
  for (const a of allocations ?? []) {
    paidByCharge.set(a.charge_id, (paidByCharge.get(a.charge_id) ?? 0) + a.allocated_amount);
  }

  return charges.map((c) => {
    const paid = paidByCharge.get(c.id) ?? 0;
    return { ...c, paid_amount: paid, balance: c.amount - paid };
  });
}

export async function listChargeItemsByCharge(chargeId: string): Promise<ChargeItem[]> {
  const { data, error } = await supabase
    .from("charge_items")
    .select("*")
    .eq("charge_id", chargeId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data as ChargeItem[];
}

/** שיעורים "completed" שעדיין אין להם charge_item — אם familyId מושמט, נבדק על פני כל המשפחות */
async function findUnbilledCompletedLessons(familyId?: string) {
  let query = supabase
    .from("lessons")
    .select("*")
    .eq("status", "completed")
    .order("scheduled_start", { ascending: true });
  if (familyId) query = query.eq("family_id", familyId);

  const { data: lessons, error: lessonsError } = await query;
  if (lessonsError) throw lessonsError;
  if (!lessons || lessons.length === 0) return [];

  const lessonIds = lessons.map((l) => l.id);
  const { data: billedItems, error: billedError } = await supabase
    .from("charge_items")
    .select("lesson_id")
    .in("lesson_id", lessonIds);
  if (billedError) throw billedError;

  const billedSet = new Set((billedItems ?? []).map((i) => i.lesson_id));
  return lessons.filter((l) => !billedSet.has(l.id));
}

/**
 * הופך רשימת שיעורים לא-מחויבים לחיובים: מקובצים לפי (משפחה, חודש) — חיוב אחד לכל צירוף כזה.
 * Idempotent: הקבוצה כבר לא כוללת שיעורים שיש להם charge_item (וגם מוגן ב-unique index ב-DB).
 */
async function createChargesFromLessons(
  unbilled: Awaited<ReturnType<typeof findUnbilledCompletedLessons>>,
): Promise<Charge[]> {
  if (unbilled.length === 0) return [];

  const groups = new Map<string, typeof unbilled>();
  for (const lesson of unbilled) {
    const period = lesson.scheduled_start.slice(0, 7); // "YYYY-MM"
    const key = `${lesson.family_id}|${period}`;
    const group = groups.get(key);
    if (group) group.push(lesson);
    else groups.set(key, [lesson]);
  }

  const createdCharges: Charge[] = [];
  for (const [key, groupLessons] of groups) {
    const [familyId, period] = key.split("|");
    const amount = groupLessons.reduce((sum, l) => sum + (l.price_snapshot ?? 0), 0);

    const { data: charge, error: chargeError } = await supabase
      .from("charges")
      .insert({ family_id: familyId, billing_period: period, amount, status: "unpaid" })
      .select()
      .single();
    if (chargeError) throw chargeError;

    const itemsInput = groupLessons.map((lesson) => ({
      charge_id: charge.id,
      student_id: lesson.student_id,
      lesson_id: lesson.id,
      description: `שיעור${lesson.subject ? " " + lesson.subject : ""} — ${lesson.scheduled_start.slice(0, 10)}`,
      amount: lesson.price_snapshot ?? 0,
    }));
    // הגנת idempotency אמיתית: unique index חלקי על charge_items.lesson_id ב-DB
    const { error: itemsError } = await supabase.from("charge_items").insert(itemsInput);
    if (itemsError) throw itemsError;

    createdCharges.push(charge as Charge);
  }

  return createdCharges;
}

/**
 * סורק את כל המשפחות בבת אחת ויוצר חיובים לכל שיעור שהתקיים וטרם חויב.
 * זו הפעולה הגלובלית שמוצגת בראש מסך "תשלומים" — לא פעולה ידנית לכל משפחה בנפרד.
 */
export async function generateChargesForAllFamilies(): Promise<Charge[]> {
  const unbilled = await findUnbilledCompletedLessons();
  return createChargesFromLessons(unbilled);
}
