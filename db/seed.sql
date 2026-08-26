-- TutorOS — Seed Data (Phase 1)
-- הוזן בפועל דרך execute_sql על tmrghziqmhrrtyabfhee. מתועד כאן לשחזור/שקיפות.
-- תואם ל-Acceptance Test 1-4 במסמך האב (docs/MASTER.md, סעיף 13):
-- משפחת כהן: נועם (160₪ × 4 = 640) + יעל (140₪ × 3 = 420) = 1,060₪
-- תשלום 800₪ → יתרה 260₪.

do $$
declare
  v_family_id uuid;
  v_noam_id uuid;
  v_yael_id uuid;
  v_charge_id uuid;
  v_payment_id uuid;
  v_lesson_id uuid;
  i int;
begin
  insert into families (family_name, payer_name, phone, email)
  values ('כהן', 'דנה כהן', '050-1234567', 'dana.cohen@example.com')
  returning id into v_family_id;

  insert into students (family_id, first_name, last_name, grade, subjects)
  values (v_family_id, 'נועם', 'כהן', 'ט', array['מתמטיקה'])
  returning id into v_noam_id;

  insert into students (family_id, first_name, last_name, grade, subjects)
  values (v_family_id, 'יעל', 'כהן', 'ז', array['מתמטיקה'])
  returning id into v_yael_id;

  insert into pricing_agreements (student_id, family_id, rate, standard_duration, valid_from)
  values (v_noam_id, v_family_id, 160, 60, '2026-08-01');

  insert into pricing_agreements (student_id, family_id, rate, standard_duration, valid_from)
  values (v_yael_id, v_family_id, 140, 60, '2026-08-01');

  insert into charges (family_id, billing_period, amount, status)
  values (v_family_id, '2026-08', 1060, 'partial')
  returning id into v_charge_id;

  for i in 1..4 loop
    insert into lessons (student_id, family_id, scheduled_start, scheduled_end, actual_duration, subject, status, price_snapshot)
    values (
      v_noam_id, v_family_id,
      ('2026-08-0' || i || ' 16:00')::timestamptz,
      ('2026-08-0' || i || ' 17:00')::timestamptz,
      60, 'מתמטיקה', 'completed', 160
    ) returning id into v_lesson_id;

    insert into charge_items (charge_id, student_id, lesson_id, description, amount)
    values (v_charge_id, v_noam_id, v_lesson_id, 'שיעור מתמטיקה — נועם', 160);
  end loop;

  for i in 1..3 loop
    insert into lessons (student_id, family_id, scheduled_start, scheduled_end, actual_duration, subject, status, price_snapshot)
    values (
      v_yael_id, v_family_id,
      ('2026-08-1' || i || ' 18:00')::timestamptz,
      ('2026-08-1' || i || ' 19:00')::timestamptz,
      60, 'מתמטיקה', 'completed', 140
    ) returning id into v_lesson_id;

    insert into charge_items (charge_id, student_id, lesson_id, description, amount)
    values (v_charge_id, v_yael_id, v_lesson_id, 'שיעור מתמטיקה — יעל', 140);
  end loop;

  insert into payments (family_id, amount, payment_method)
  values (v_family_id, 800, 'bit')
  returning id into v_payment_id;

  insert into payment_allocations (payment_id, charge_id, allocated_amount)
  values (v_payment_id, v_charge_id, 800);

  -- Test 5: שינוי מחיר עתידי לנועם — לא אמור לשנות שיעורים היסטוריים
  insert into pricing_agreements (student_id, family_id, rate, standard_duration, valid_from)
  values (v_noam_id, v_family_id, 170, 60, '2027-01-01');
end $$;
