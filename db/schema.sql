-- TutorOS — Database Schema (Phase 1)
-- קובץ זה הוא תיעוד/ארכיון של המיגרציות שהוחלו בפועל על פרויקט ה-Supabase (tmrghziqmhrrtyabfhee).
-- המיגרציות עצמן רצות ומנוהלות דרך Supabase (apply_migration), לא דרך הרצה ידנית של הקובץ הזה.
-- אם תרצה לשחזר סביבה חדשה מאפס — אפשר להריץ את שלושת החלקים הבאים בסדר, בפרויקט Supabase נקי.

-- ============================================================
-- 0001_core_schema
-- ============================================================

create or replace function set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table families (
  id uuid primary key default gen_random_uuid(),
  family_name text not null,
  payer_name text not null,
  phone text,
  email text,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_families_updated_at before update on families
  for each row execute function set_updated_at();

create table students (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete restrict,
  first_name text not null,
  last_name text not null,
  grade text,
  school text,
  subjects text[] not null default '{}',
  phone text,
  email text,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_students_family_id on students(family_id);
create trigger trg_students_updated_at before update on students
  for each row execute function set_updated_at();

create table pricing_agreements (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete restrict,
  family_id uuid not null references families(id) on delete restrict,
  billing_type text not null default 'per_lesson' check (billing_type in ('per_lesson','hourly','package')),
  rate numeric(10,2) not null check (rate >= 0),
  standard_duration integer not null default 60 check (standard_duration > 0),
  valid_from date not null,
  valid_until date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_pricing_valid_range check (valid_until is null or valid_until >= valid_from)
);
create index idx_pricing_student_id on pricing_agreements(student_id);
create index idx_pricing_family_id on pricing_agreements(family_id);
create index idx_pricing_valid_from on pricing_agreements(valid_from);
create trigger trg_pricing_updated_at before update on pricing_agreements
  for each row execute function set_updated_at();

create table lessons (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete restrict,
  family_id uuid not null references families(id) on delete restrict,
  scheduled_start timestamptz not null,
  scheduled_end timestamptz not null,
  actual_start timestamptz,
  actual_end timestamptz,
  actual_duration integer,
  subject text,
  topic text,
  status text not null default 'scheduled' check (status in ('scheduled','completed','cancelled','no_show')),
  price_snapshot numeric(10,2),
  zoom_url text,
  calendar_event_id text,
  board_id uuid,
  lesson_notes text,
  homework text,
  cancellation_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_lesson_time_range check (scheduled_end > scheduled_start)
);
create index idx_lessons_student_id on lessons(student_id);
create index idx_lessons_family_id on lessons(family_id);
create index idx_lessons_scheduled_start on lessons(scheduled_start);
create index idx_lessons_status on lessons(status);
create trigger trg_lessons_updated_at before update on lessons
  for each row execute function set_updated_at();

create table charges (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete restrict,
  billing_period text not null,
  amount numeric(10,2) not null check (amount >= 0),
  due_date date,
  status text not null default 'unpaid' check (status in ('unpaid','partial','paid','not_due')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_charges_family_id on charges(family_id);
create index idx_charges_billing_period on charges(billing_period);
create trigger trg_charges_updated_at before update on charges
  for each row execute function set_updated_at();

create table charge_items (
  id uuid primary key default gen_random_uuid(),
  charge_id uuid not null references charges(id) on delete cascade,
  student_id uuid not null references students(id) on delete restrict,
  lesson_id uuid references lessons(id) on delete restrict,
  description text not null,
  amount numeric(10,2) not null check (amount >= 0),
  created_at timestamptz not null default now()
);
create index idx_charge_items_charge_id on charge_items(charge_id);
create index idx_charge_items_student_id on charge_items(student_id);
-- אילוץ קריטי ל-Idempotency: שיעור לא יכול להופיע פעמיים כ-charge item
create unique index uq_charge_items_lesson_id on charge_items(lesson_id) where lesson_id is not null;

create table payments (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete restrict,
  payment_date date not null default current_date,
  amount numeric(10,2) not null check (amount > 0),
  payment_method text,
  reference text,
  notes text,
  created_at timestamptz not null default now()
);
create index idx_payments_family_id on payments(family_id);
create index idx_payments_payment_date on payments(payment_date);

create table payment_allocations (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references payments(id) on delete cascade,
  charge_id uuid not null references charges(id) on delete restrict,
  allocated_amount numeric(10,2) not null check (allocated_amount > 0),
  created_at timestamptz not null default now(),
  unique (payment_id, charge_id)
);
create index idx_payment_allocations_payment_id on payment_allocations(payment_id);
create index idx_payment_allocations_charge_id on payment_allocations(charge_id);

create table lesson_boards (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references lessons(id) on delete cascade,
  student_id uuid not null references students(id) on delete restrict,
  board_data jsonb not null default '{}'::jsonb,
  preview_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lesson_id)
);
create index idx_lesson_boards_student_id on lesson_boards(student_id);
create trigger trg_lesson_boards_updated_at before update on lesson_boards
  for each row execute function set_updated_at();

alter table lessons
  add constraint fk_lessons_board_id foreign key (board_id) references lesson_boards(id) on delete set null;

create table student_files (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  drive_file_id text not null,
  file_name text not null,
  file_type text,
  drive_url text not null,
  category text,
  notes text,
  created_at timestamptz not null default now()
);
create index idx_student_files_student_id on student_files(student_id);

-- ============================================================
-- 0002_rls_policies
-- ============================================================
-- כרגע משתמש מנהל יחיד. פתוח לכל authenticated, לא ל-anon.
-- בעתיד: owner_id + סינון לפי auth.uid() בלי לשנות מבנה טבלאות.

alter table families enable row level security;
alter table students enable row level security;
alter table pricing_agreements enable row level security;
alter table lessons enable row level security;
alter table charges enable row level security;
alter table charge_items enable row level security;
alter table payments enable row level security;
alter table payment_allocations enable row level security;
alter table lesson_boards enable row level security;
alter table student_files enable row level security;

create policy "authenticated_full_access" on families
  for all to authenticated using (true) with check (true);
create policy "authenticated_full_access" on students
  for all to authenticated using (true) with check (true);
create policy "authenticated_full_access" on pricing_agreements
  for all to authenticated using (true) with check (true);
create policy "authenticated_full_access" on lessons
  for all to authenticated using (true) with check (true);
create policy "authenticated_full_access" on charges
  for all to authenticated using (true) with check (true);
create policy "authenticated_full_access" on charge_items
  for all to authenticated using (true) with check (true);
create policy "authenticated_full_access" on payments
  for all to authenticated using (true) with check (true);
create policy "authenticated_full_access" on payment_allocations
  for all to authenticated using (true) with check (true);
create policy "authenticated_full_access" on lesson_boards
  for all to authenticated using (true) with check (true);
create policy "authenticated_full_access" on student_files
  for all to authenticated using (true) with check (true);

-- ============================================================
-- 0003_fix_function_search_path
-- (מוזג כבר לתוך 0001 למעלה — מוצג להשלמת התיעוד ההיסטורי)
-- ============================================================
