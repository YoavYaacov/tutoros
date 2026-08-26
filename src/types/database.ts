// טיפוסים אלה חייבים להישאר תואמים 1:1 ל-db/schema.sql. אם משנים עמודה ב-DB — לעדכן גם כאן.

export interface Family {
  id: string;
  family_name: string;
  payer_name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type FamilyInput = Pick<Family, "family_name" | "payer_name"> &
  Partial<Pick<Family, "phone" | "email" | "notes" | "active">>;

export interface Student {
  id: string;
  family_id: string;
  first_name: string;
  last_name: string;
  grade: string | null;
  school: string | null;
  subjects: string[];
  phone: string | null;
  email: string | null;
  notes: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type StudentInput = Pick<Student, "family_id" | "first_name" | "last_name"> &
  Partial<Pick<Student, "grade" | "school" | "subjects" | "phone" | "email" | "notes" | "active">>;

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
