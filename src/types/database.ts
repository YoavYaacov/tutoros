// טיפוסים אלה חייבים להישאר תואמים 1:1 ל-db/schema.sql. אם משנים עמודה ב-DB — לעדכן גם כאן.
// הערה: עמודת email עדיין קיימת פיזית ב-families/students (ה-DDL למחיקתה נחסם ע"י הרשאות המערכת),
// אבל היא לא בשימוש באפליקציה יותר — לכן הושמטה מהטיפוסים ומה-UI בכוונה, לפי בקשת המשתמש.

export interface Family {
  id: string;
  family_name: string;
  payer_name: string;
  phone: string | null;
  notes: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type FamilyInput = Pick<Family, "family_name" | "payer_name"> &
  Partial<Pick<Family, "phone" | "notes" | "active">>;

export interface Student {
  id: string;
  family_id: string;
  first_name: string;
  last_name: string;
  grade: string | null;
  school: string | null;
  subjects: string[];
  phone: string | null;
  notes: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type StudentInput = Pick<Student, "family_id" | "first_name" | "last_name"> &
  Partial<Pick<Student, "grade" | "school" | "subjects" | "phone" | "notes" | "active">>;

export type BillingType = "per_lesson" | "hourly" | "package";

export interface PricingAgreement {
  id: string;
  student_id: string;
  family_id: string;
  billing_type: BillingType;
  rate: number;
  standard_duration: number;
  valid_from: string; // date
  valid_until: string | null; // date
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type PricingAgreementInput = Pick<
  PricingAgreement,
  "student_id" | "family_id" | "rate" | "valid_from"
> &
  Partial<Pick<PricingAgreement, "billing_type" | "standard_duration" | "valid_until" | "notes">>;

export type LessonStatus = "scheduled" | "completed" | "cancelled" | "no_show";

export interface Lesson {
  id: string;
  student_id: string;
  family_id: string;
  scheduled_start: string; // timestamptz
  scheduled_end: string;
  actual_start: string | null;
  actual_end: string | null;
  actual_duration: number | null;
  subject: string | null;
  topic: string | null;
  status: LessonStatus;
  price_snapshot: number | null;
  zoom_url: string | null;
  calendar_event_id: string | null;
  board_id: string | null;
  lesson_notes: string | null;
  homework: string | null;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
}

export type LessonInput = Pick<
  Lesson,
  "student_id" | "family_id" | "scheduled_start" | "scheduled_end"
> &
  Partial<
    Pick<
      Lesson,
      | "subject"
      | "topic"
      | "status"
      | "price_snapshot"
      | "lesson_notes"
      | "homework"
      | "actual_start"
      | "actual_end"
      | "actual_duration"
      | "board_id"
    >
  >;

export interface LessonBoard {
  id: string;
  lesson_id: string;
  student_id: string;
  board_data: Record<string, unknown>; // סצנת Excalidraw: { elements, appState, files }
  preview_url: string | null;
  created_at: string;
  updated_at: string;
}

export type LessonBoardInput = Pick<LessonBoard, "lesson_id" | "student_id"> &
  Partial<Pick<LessonBoard, "board_data" | "preview_url">>;

export type ChargeStatus = "unpaid" | "partial" | "paid" | "not_due";

export interface Charge {
  id: string;
  family_id: string;
  billing_period: string;
  amount: number;
  due_date: string | null; // date
  status: ChargeStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type ChargeInput = Pick<Charge, "family_id" | "billing_period" | "amount"> &
  Partial<Pick<Charge, "due_date" | "status" | "notes">>;

export interface ChargeItem {
  id: string;
  charge_id: string;
  student_id: string;
  lesson_id: string | null;
  description: string;
  amount: number;
  created_at: string;
}

export type ChargeItemInput = Pick<
  ChargeItem,
  "charge_id" | "student_id" | "description" | "amount"
> &
  Partial<Pick<ChargeItem, "lesson_id">>;

export interface Payment {
  id: string;
  family_id: string;
  payment_date: string; // date
  amount: number;
  payment_method: string | null;
  reference: string | null;
  notes: string | null;
  created_at: string;
}

export type PaymentInput = Pick<Payment, "family_id" | "amount"> &
  Partial<Pick<Payment, "payment_date" | "payment_method" | "reference" | "notes">>;

export interface PaymentAllocation {
  id: string;
  payment_id: string;
  charge_id: string;
  allocated_amount: number;
  created_at: string;
}

export type PaymentAllocationInput = Pick<
  PaymentAllocation,
  "payment_id" | "charge_id" | "allocated_amount"
>;
