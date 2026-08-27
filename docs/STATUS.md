# TutorOS — Status

עודכן לאחרונה: 28/08/2026
Phase נוכחי: Phase 3 (פיננסים) — קוד נכתב, ממתין לאימות build/dev בפועל ולבדיקה מול Acceptance Test

## הושלם ✅

### Phase 0, Phase 1, Phase 2a — ללא שינוי (ראו היסטוריה קודמת)

### Phase 2b — Lessons + Dashboard
- `src/lib/api/lessons.ts` — listLessonsInRange (ליום נתון), listUpcomingLessons, listLessonsByStudent, create/update/updateStatus
- `src/hooks/useLessons.ts` — React Query hooks תואמים
- **Dashboard אמיתי** (`/`): Timeline של שיעורי היום עם קישור לתלמיד, KPI בסיסי (שיעורי היום/התקיימו/ממתינים/עתידיים), רשימת שיעורים קרובים
- **כרטיס תלמיד הושלם**: שיעור אחרון (נושא/הערות/שיעורי בית), שיעורים עתידיים, היסטוריית שיעורים מלאה בטבלה, וכפתור "+ קבע שיעור" (ידני, בלי Calendar sync — זה נשאר ל-Phase 5 בכוונה, לפי החלטה קודמת שתועדה)
- `LessonFormModal` — יצירה/עריכה ידנית, נועל price_snapshot ממחיר נוכחי של התלמיד בזמן היצירה

### Deployment — GitHub Pages (חדש, לא היה מתוכנן במקור כ-Phase נפרד)
- `.github/workflows/deploy.yml` — build+deploy אוטומטי בכל push ל-`main`, דרך `actions/deploy-pages` (לא gh-pages branch ישן)
- `vite.config.ts` — `base: "/tutoros/"` נוסף
- **החלטה ארכיטקטונית: HashRouter במקום BrowserRouter** — GitHub Pages לא תומך ב-SPA server rewrites; HashRouter פותר את זה לגמרי בלי טריקי 404.html. Tradeoff: כתובות עם `#` (`/tutoros/#/students`)
- `.env.production` — מכיל רק Publishable Key (ציבורי, מוגן RLS), מחויב ל-git במכוון כדי שה-CI לא יצטרך GitHub Secrets
- `public/favicon.svg` נוסף
- **נבדק: build זהה 1:1 למה שה-workflow ירוץ** (`rm -rf node_modules && npm ci && npm run build` מאפס — עבר נקי)
- **נבדק: דימוי שרת סטטי אמיתי תחת `/tutoros/`** — כל ה-assets (JS/CSS/favicon) נטענים מהנתיב הנכון, index.html תקין

## בעבודה 🔧

### Phase 3 — פיננסים (קוד כתוב, לא עדיין אומת ב-build/dev אמיתי)
- `src/types/database.ts` — נוספו Charge, ChargeItem, Payment, PaymentAllocation (+ Input types), תואמים 1:1 ל-db/schema.sql הקיים מ-Phase 1.
- `src/lib/api/charges.ts`:
  - `listChargesByFamily` / `listChargesWithBalance` (מוסיף paid_amount+balance מחושבים מ-payment_allocations) / `listChargeItemsByCharge`
  - `generateChargesFromUnbilledLessons(familyId)` — **האוטומציה שהוחלט עליה מול המשתמש**: סורקת שיעורים completed של המשפחה שאין להם עדיין charge_item, מקבצת לפי חודש (billing_period), ויוצרת חיוב אחד לכל חודש עם price_snapshot כסכום. Idempotent הן בלוגיקה (מסנן lesson_id שכבר קיים ב-charge_items) והן ב-DB (unique index חלקי קיים מ-Phase 1).
- `src/lib/api/payments.ts`:
  - `recordPaymentWithAllocation` — **ההחלטה השנייה מול המשתמש**: שיוך אוטומטי FIFO (חיוב הכי ישן לפי billing_period קודם). חוסם תשלום שגבוה מהיתרה הפתוחה *לפני* כל כתיבה ל-DB (אין מושג "יתרת זכות" בסכימה, אז overpayment פשוט נדחה עם שגיאה ברורה).
  - `getFamilyBalance`, `listAllFamilyBalances` (ליתרות של כל המשפחות בבת אחת — למסך תשלומים ול-Dashboard)
- `src/hooks/useCharges.ts`, `src/hooks/usePayments.ts` — עטיפות React Query תואמות לקונבנציה הקיימת
- `src/lib/format.ts` — נוספו `formatCurrency`, `chargeStatusLabel`, `chargeStatusColorClass`
- `src/components/payments/PaymentFormModal.tsx` — מודל "סימון תשלום" (סכום מוגבל ל-min/max מול היתרה, תאריך, אמצעי, אסמכתא, הערות)
- `src/pages/Payments.tsx` (מסך חדש, route `/payments` — כבר היה לינק בתפריט ללא יעד) — טבלת כל המשפחות עם יתרה פתוחה + כפתור "סמן תשלום" לכל שורה
- `src/pages/FamilyProfile.tsx` — הפלייסהולדר הוחלף בסקשן "פיננסים" אמיתי: יתרה פתוחה, כפתור "צור חיוב משיעורים שלא חויבו", כפתור "סמן תשלום", טבלת חיובים (תקופה/סכום/שולם/יתרה/סטטוס), טבלת תשלומים
- `src/pages/Dashboard.tsx` — הפלייסהולדר הוחלף בווידג'ט "יתרה פתוחה לגבייה" (סכום כולל + מס' משפחות עם יתרה) + לינק למסך תשלומים

**חשוב — לא בוצע עדיין בסשן הזה:** לא היה node/npm זמין בסביבת ה-shell כדי להריץ `npm run build`/`npm run dev` ולוודא type-check נקי והתנהגות בדפדפן בפועל. הקוד נבדק ידנית מול הקונבנציות הקיימות (client לא-מוקלד, תבניות ה-API/hooks/modals הקיימות) אבל **חובה להריץ build מקומי ולבדוק ידנית מול משפחת "כהן" (Acceptance Test בסעיף 13 של MASTER.md) לפני שמסמנים Phase 3 כהושלם**.

## הבא בתור ⏭
1. להריץ `npm run build` ו-`npm run dev` מקומית ולוודא שאין שגיאות type-check/lint.
2. בדיקה ידנית מול משפחת כהן: יתרה פתוחה מוצגת כ-260₪ (1,060 חויב − 800 שולם), "צור חיוב משיעורים שלא חויבו" לא יוצר כפילות (כל 7 השיעורים כבר מחויבים ב-seed), תשלום נוסף של 260₪ מאפס את היתרה ומעדכן את סטטוס החיוב ל-'paid'.
3. **פעולה ידנית שלך (חובה, לא ניתנת לביצוע מקוד):** ב-GitHub → הריפו → Settings → Pages → Build and deployment → Source → לבחור **"GitHub Actions"** (אם עדיין לא בוצע) — בלי זה ה-workflow ירוץ בהצלחה ב-Actions אבל GitHub לא יפרסם תוצאה בכתובת החיה.
4. לאחר אימות Phase 3: due_date לחיובים לא מוגדר אוטומטית כרגע (נשאר null) — לשקול אם צריך ברירת מחדל לפני Phase 6 (Export/Analytics).

## נדחה (Deferred) ⏸
- Leaked Password Protection — לא זמין בטיר Free של Supabase

## החלטות פתוחות / שאלות למשתמש ❓
(ריק כרגע)

## Decisions Log
(ראו היסטוריה קודמת לרשומות עד Phase 2a)
- 26/08/2026 — נוסף Deployment (לא היה בתוכנית Phases המקורית) — לפי בקשת המשתמש, GitHub Pages עם GitHub Actions, HashRouter כפתרון SPA routing
- 26/08/2026 — Phase 2b: קביעת שיעור נשארת ידנית (בלי Google Calendar) עד Phase 5, כדי לא לבנות את מסך יצירת השיעור פעמיים
- 26/08/2026 — Phase 2 (2a+2b) הושלם במלואו ונבדק (type-check, build נקי, דימוי static server עם base path)
- 28/08/2026 — Phase 3: יצירת חיוב היא אוטומטית משיעורים שהתקיימו ולא חויבו (לא ידנית) — לפי בקשת המשתמש, כדי למנוע טעויות/כפילויות ידניות
- 28/08/2026 — Phase 3: שיוך תשלום לחיובים פתוחים הוא FIFO אוטומטי (הישן קודם), לא בחירה ידנית של המשתמש — לפי בקשת המשתמש
- 28/08/2026 — Phase 3: overpayment (תשלום גבוה מהיתרה הפתוחה) נחסם באופן מוחלט ולא נשמר כיתרת זכות — הוחלט חד-צדדית (לא נשאלה שאלה מפורשת) כי אין מושג כזה בסכימה הקיימת; אם המשתמש ירצה תמיכה בזה, צריך migration חדש
