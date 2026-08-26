# TutorOS — Status

עודכן לאחרונה: 26/08/2026
Phase נוכחי: Phase 0 הושלם ✅ | ממתין להתחלת Phase 1 (DB Schema)

## הושלם ✅

### Phase 0 — Foundation
- פרויקט Supabase אמיתי נוצר: `tutoros`, region `eu-central-1`, Free Tier (0₪/חודש)
  - Project ref: `tmrghziqmhrrtyabfhee`
  - URL: `https://tmrghziqmhrrtyabfhee.supabase.co`
- סקלט React + TypeScript + Vite + Tailwind, עם טוקני עיצוב ייעודיים (לא ברירת מחדל)
- RTL מלא (`<html dir="rtl">`), פונט Heebo
- Routing עם react-router-dom, TanStack Query מוגדר
- Supabase Auth מחובר: `AuthProvider` + `ProtectedRoute` + מסך Login עובד
- `AppShell` — סיידבר ניווט RTL (ראשי/תלמידים/משפחות/לוח שיעורים/תשלומים/דוחות/הגדרות) — קישורים למסכים שעוד לא קיימים (יתווספו ב-Phases הבאים)
- Dashboard placeholder
- **נבדק בפועל:** `npm install`, `tsc -b` (type-check נקי), `vite build` (production build תקין), `vite preview` הוחזר HTTP 200

### תיקוני תשתית שבוצעו תוך כדי בדיקה (לתעד כדי לא לחזור עליהן)
- `eslint-plugin-react-hooks` שודרג מ-4.6.2 ל-5.x — לא תאם ל-eslint 9
- alias `@/*` הוגדר גם ב-`vite.config.ts` (לא רק ב-tsconfig) — אחרת ה-build נשבר בזמן ריצה למרות שה-type-check עבר
- `tsconfig.node.json` נדרש `types: ["node"]` + `@types/node` כדי ש-`vite.config.ts` יכיר את `import.meta.url`
- יש להיזהר מקבצי `vite.config.js`/`.d.ts` מקומפלים שנוצרים בטעות ודורסים את ה-`.ts` — הוגדר `outDir` נפרד ב-tsconfig.node.json כדי למנוע זאת

## בעבודה 🔧
(כלום כרגע)

## הבא בתור ⏭
Phase 1 — DB Schema: יצירת כל הטבלאות (families, students, pricing_agreements, lessons, charges, charge_items, payments, payment_allocations, lesson_boards, student_files) + RLS policies + seed data (משפחת "כהן" מה-Acceptance Test).

## החלטות פתוחות / שאלות למשתמש ❓
(ריק כרגע)

## Decisions Log
- 26/08/2026 — הזנת נוסחאות — נבחרה MathLive (math-field) במקום תיבת LaTeX גולמית
- 26/08/2026 — נוצר docs/MASTER.md כמסמך אב רשמי
- 26/08/2026 — פרויקט Supabase ראשון נכשל עקב מגבלת 2 פרויקטים חינמיים בחשבון; המשתמש פינה מקום בחשבון ופרויקט `tutoros` נוצר בהצלחה בניסיון השני
- 26/08/2026 — Phase 0 הושלם ונבדק end-to-end (build + preview מריצים בפועל)
