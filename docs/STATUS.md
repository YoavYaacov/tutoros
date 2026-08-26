# TutorOS — Status

עודכן לאחרונה: 26/08/2026
Phase נוכחי: Phase 1 הושלם ✅ | ממתין להתחלת Phase 2 (ניהול ליבה)

## הושלם ✅

### Phase 0 — Foundation
(ראה היסטוריה קודמת — ללא שינוי)

### Phase 1 — DB Schema
- כל 10 הטבלאות נוצרו בפועל ב-Supabase (`tmrghziqmhrrtyabfhee`) דרך migrations:
  `families, students, pricing_agreements, lessons, charges, charge_items, payments, payment_allocations, lesson_boards, student_files`
- FKs, CHECK constraints, indexes — לפי `docs/MASTER.md` סעיף 15
- `updated_at` trigger אוטומטי בכל טבלה שמשתנה לאורך זמן
- אילוץ Idempotency קריטי: `unique index` על `charge_items.lesson_id` — **נבדק בפועל**, ניסיון חיוב כפול לאותו שיעור נכשל כצפוי
- RLS מופעל על כל 10 הטבלאות, מדיניות `authenticated_full_access` (ראו החלטה למטה)
- **Security Advisor של Supabase נבדק ותוקן:** `function_search_path_mutable` תוקן (migration 0003). נותרה אזהרה אחת שהיא הגדרת Auth בדשבורד, לא DB — ראו "הבא בתור"
- **Seed data מלא של משפחת "כהן"** לפי Acceptance Tests 1-5 במסמך האב — 2 תלמידים, 2 הסכמי מחיר, 7 שיעורים completed, חיוב אחד, תשלום חלקי אחד עם allocation
- **הרצתי בעצמי את Acceptance Tests 1-5 מול ה-DB האמיתי ואישרתי תוצאות מדויקות:**
  - סכום חיוב: 1,060.00 ✅
  - שולם: 800.00 ✅
  - יתרה: 260.00 ✅
  - 7 שורות charge_items שסכומן 1,060.00 ✅
  - שינוי מחיר עתידי לנועם (170₪ מ-01/01/2027) לא שינה את price_snapshot של 4 השיעורים הקיימים (עדיין 160₪) ✅
- קובץ תיעוד `db/schema.sql` ו-`db/seed.sql` נוצרו כדי שהריפו (לא רק Supabase) יהיה Source of Truth לסכמה

## בעבודה 🔧
(כלום כרגע)

## הבא בתור ⏭
1. Phase 2 — ניהול ליבה: Families CRUD, Students CRUD, Pricing Agreements UI, Lessons CRUD בסיסי, Dashboard יומי אמיתי (Timeline), Student Profile, Family Profile — יתחבר לנתוני "כהן" האמיתיים שכבר יושבים ב-DB.

## נדחה (Deferred) ⏸
- **Leaked Password Protection** — לא ניתן להפעלה בטיר החינמי של Supabase (זמין רק ב-Pro ומעלה). אם תשדרג בעתיד את הפרויקט — להפעיל ב-Authentication → Policies → Password Security. עד אז זו מגבלה מקובלת (הסיכון: משתמש יחיד, לא ציבור רחב).

## החלטות פתוחות / שאלות למשתמש ❓
(ריק כרגע)

## Decisions Log
- 26/08/2026 — RLS Phase 1 — נבחרה מדיניות "authenticated_full_access" (כל משתמש מחובר, בלי הבחנה לפי owner) כי יש משתמש מנהל יחיד כרגע. בעתיד אם יתווספו כמה מורים — יתווסף owner_id + סינון לפי auth.uid() בלי לשנות את מבנה הטבלאות
- 26/08/2026 — charges קיבל updated_at (בניגוד למה שכתוב באופן מדויק במסמך האב סעיף 15) כי סטטוס חיוב (unpaid/partial/paid) משתנה לאורך זמן ודורש audit trail
- 26/08/2026 — billing_type הוגבל ל-CHECK constraint עם שלושה ערכים אפשריים: per_lesson / hourly / package — מסמך האב לא פירט את הערכים המדויקים, זו החלטה סבירה שניתנת להרחבה
- 26/08/2026 — Phase 1 הושלם, נבדק end-to-end מול DB אמיתי כולל Acceptance Tests 1-5
- 26/08/2026 — Leaked Password Protection נדחה — לא זמין בטיר Free של Supabase, רק ב-Pro. המשתמש בחר להישאר ב-Free כרגע. משתמש ההתחברות הראשון כבר נוצר בפועל
