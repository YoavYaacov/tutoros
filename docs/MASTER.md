# TutorOS — מסמך אב (Source of Truth)

**גרסה:** 2.0 (מסמך פיתוח מבצעי, בנוי לפי Phases)
**סטטוס:** מסמך חי — מתעדכן מדי שיחה
**שפת ממשק:** עברית — RTL
**מטבע:** ₪ (ILS) | **אזור זמן:** Asia/Jerusalem

מיקום מומלץ בריפו: `docs/MASTER.md`
קובץ נלווה (חובה): `docs/STATUS.md` — ראה סעיף 0.

---

## 0. פרוטוקול פתיחת שיחה (הוראות ל-Claude)

מסמך זה **אינו** מחליף גישה לריפו בפועל — הוא הפרוטוקול שלפיו יש לפעול בכל שיחה חדשה:

1. אם יש גישה לריפו (MCP/GitHub connector) — לקרוא קודם את `docs/STATUS.md`, אח"כ את הקובץ הזה, ואז להסתכל בפועל בעץ הקבצים ובקומיטים האחרונים (`git log -10 --oneline`) לפני שמניחים הנחות על מה קיים.
2. אם אין גישה לריפו — לבקש מהמשתמש להדביק את `docs/STATUS.md` (הוא קצר ומרוכז, בניגוד למסמך הזה).
3. **לעולם לא להניח שקוד קיים תואם למסמך.** אם יש סתירה בין המימוש לבין המסמך — לעצור, להציג את הפער, ולשאול האם לעדכן את הקוד או את המסמך (ראו סעיף 71 בגרסה הקודמת → כאן סעיף 14).
4. לא להתחיל Phase חדש לפני שה-Definition of Done (סעיף 12) של ה-Phase הקודם מסומן ✅ ב-STATUS.md.
5. `docs/STATUS.md` הוא הקובץ שמתעדכן **בסוף כל שיחה** — לא המסמך הזה. המסמך הזה משתנה רק כשיש שינוי אמיתי בדרישות/ארכיטקטורה.

### תבנית STATUS.md (ליצור בריפו כקובץ נפרד)

```markdown
# TutorOS — Status

עודכן לאחרונה: <תאריך>
Phase נוכחי: <מספר ושם>

## הושלם ✅
- ...

## בעבודה 🔧
- ...

## הבא בתור ⏭
- ...

## החלטות פתוחות / שאלות למשתמש ❓
- ...

## Decisions Log (החלטות שכבר התקבלו, כדי לא לשאול שוב)
- <תאריך> — <נושא> — <ההחלטה> — <למה>
```

---

## 1. חזון וגבולות (תמצית)

TutorOS היא עמדת העבודה היומית של מורה פרטי אחד. ארבע רמות: תפעולית (השיעור עצמו), לוגיסטית (Zoom/Drive/Calendar), ניהולית (תלמידים/משפחות/כספים), אנליטית (דוחות).

**המערכת היא לא:** מערכת סליקה/חשבוניות/קבלות, LMS מלא, מערכת מרובת-מורים, תחליף ל-Drive/Calendar/Zoom.

**עיקרון מפתח (לא לשנות בלי דיון מפורש):** `Family → Students → Lessons` ובמקביל `Family → Charges → Payments`. תשלום הוא תמיד ברמת המשפחה; ייחוס ההכנסה הוא תמיד ברמת התלמיד/שיעור (דרך `price_snapshot` ו-`Charge Items`).

**היררכיית עדיפויות בכל החלטת פיתוח:**
1. אמינות הנתונים (בעיקר כספים)
2. מהירות ונוחות בזמן שיעור בפועל
3. שיעורים ויומן
4. מעקב פיננסי
5. Whiteboard וחומרי לימוד
6. ניהול פדגוגי
7. Analytics
8. AI

---

## 2. ארכיטקטורה טכנולוגית

| שכבה | טכנולוגיה | הערה |
|---|---|---|
| Frontend | React + TypeScript + Vite | Desktop-first, RTL מלא |
| Styling | Tailwind CSS + shadcn/ui | |
| State/Data | TanStack Query + Supabase JS client | לא Redux — אין צורך |
| Backend | Supabase (Postgres + Auth + RLS + Storage + Edge Functions) | Service role key **אף פעם** לא ב-client |
| Whiteboard | **iDroo** (קישור חיצוני, נפתח בטאב נפרד) | ראו סעיף 3 — עודכן 28/08/2026, מחליף את ההחלטה הקודמת (Excalidraw מוטמע) |
| Calendar | Google Calendar API | OAuth, Edge Function לטוקנים |
| Files | Google Drive API + Google Picker | References בלבד, לא אחסון קבצים |
| Charts | Recharts | |

### 2.1 עקרון Backend-for-Secrets
כל טוקן OAuth רגיש (Google refresh token) **חייב** לעבור דרך Supabase Edge Function. ה-client לעולם לא מחזיק Client Secret או Refresh Token ישירות ב-localStorage.

---

## 3. הלוח (Whiteboard) — החלטה ארכיטקטונית

**עודכן 28/08/2026 — מחליף החלטה קודמת בסעיף הזה.** ההחלטה הקודמת הייתה Excalidraw מוטמע + MathLive ככלי נוסחה (ראו הסטוריה למטה) — **זה נבנה בפועל ב-Phase 4, Stage A, עבד ונבדק E2E**, אבל המשתמש העדיף בסופו של דבר לחזור ל-iDroo (מכיר אותו, לדעתו הרבה יותר טוב). לפני המעבר נבדק בפועל: **iDroo חוסם הטמעה ב-iframe** (`X-Frame-Options: DENY` בכל תגובה מ-`app.idroo.com`, כולל דפי 404 — כלומר כנראה גורף ולא ניתן לעקיפה מהצד שלנו). לכן ההחלטה הסופית:

**ההחלטה:** Lesson Workspace לא מטמיע לוח ציור בכלל. במקומו, כפתור/קישור "פתח לוח iDroo" (`target="_blank"`) פותח את iDroo בטאב נפרד. שאר ה-Workspace (טיימר, Side Panel עם מידע משיעור קודם ועריכה חיה עם autosave של נושא/הערות/ש.בית, "סיום שיעור") נשאר באפליקציה כרגיל.

**השלכות על מה שכבר נבנה:**
- `Excalidraw`, `mathlive`, `pdfjs-dist` הוסרו מהתלויות — הקוד שהשתמש בהם (`ExcalidrawBoard`, `BoardStartChoiceModal`, כלי הנוסחה) הוסר.
- טבלת `lesson_boards` (וה-column `lessons.board_id`) **נשארים קיימים ב-DB אבל לא בשימוש** — לא הוסרו כי מחיקת DDL הרסני נחסמת ע"י הרשאות המערכת ודורשת אישור מפורש נוסף. אם ירצה המשתמש, אפשר למחוק בעתיד.
- כתובת ה-iDroo כרגע קבועה בקוד (`https://app.idroo.com/`) — מיועדת לעבור להגדרות (אותו דפוס שמתוכנן ל-Zoom, ראו Phase 5) אם למשתמש יש חדר iDroo קבוע שהוא תמיד חוזר אליו.
- כלי נוסחה (MathLive) ו-PDF.js **ירדו מהיקף Phase 4** — אם ל-iDroo יש כלי נוסחה/תמונה משלו זה כבר מכוסה שם; לא נבנה כלי מקביל באפליקציה.

<details>
<summary>היסטוריה: ההחלטה המקורית (MathLive על גבי Excalidraw, לפני 28/08/2026)</summary>

הבעיה שהוגדרה במקור: ב-iDroo יש חוויית הזנה נוחה של נוסחאות (בונים ויזואלית, לא מקלידים קוד), אבל אי אפשר להדביק שם תמונות. ההחלטה אז הייתה שימוש בספריית MathLive (`mathlive` npm package, קומפוננטת `<math-field>`) כדי לקבל הזנה ויזואלית בלי התלות ב-iDroo, ולפתור את בעיית התמונות ע"י כלי נפרד מה-Whiteboard. זה נבנה ועבד, אבל הוחלף בהחלטה למעלה.

</details>

---

## 4. מודל נתונים — סיכום ERD

```
Family (1) ──< Student (N)
Student (1) ──< PricingAgreement (N, היסטורי)
Student (1) ──< Lesson (N)
Family  (1) ──< Charge (N)
Charge  (1) ──< ChargeItem (N) ──> Student, Lesson (ייחוס)
Family  (1) ──< Payment (N)
Payment (1) ──< PaymentAllocation (N) ──> Charge
Lesson  (1) ──1 LessonBoard
Student (1) ──< StudentFile (references בלבד ל-Drive)
Student (1) ──< Topic/StudentProgress (P1)
```

טבלאות מלאות ושדות — ראו נספח א' (סעיף 15). כללים קריטיים:
- `price_snapshot` נשמר על ה-Lesson בזמן היצירה/סיום — **לעולם לא** מחושב מחדש ממחיר נוכחי.
- שינוי מחיר = שורה חדשה ב-`PricingAgreement` עם `valid_from` חדש, לא UPDATE על הישן.
- כל אוטומציה שיוצרת `ChargeItem` חייבת להיות Idempotent (unique constraint על `lesson_id` ב-`ChargeItem`, כדי שעריכה כפולה של אותו שיעור לא תיצור שורה כפולה).

---

## 5. מסכי המערכת (Navigation)

`ראשי (Dashboard) | תלמידים | משפחות | לוח שיעורים | תשלומים | דוחות | הגדרות`

כפתור "התחל שיעור" קבוע וברור בכל מסך רלוונטי.

מסכים עיקריים: Dashboard יומי+פיננסי, Student Profile, Family Profile, **Lesson Workspace** (המסך הקריטי — Header + כפתור "פתח לוח iDroo" בטאב נפרד + Side Panel נשלף; ראו סעיף 3), מסך תשלומים (Family View כברירת מחדל), הגדרות.

---

## 6. User Flow מרכזי (לא לסטות ממנו בלי דיון)

```
Dashboard → בחירת תלמיד/שיעור היום → "התחל שיעור"
   → Lesson Workspace נפתח עם: מידע משיעור קודם, ש.בית קודם, כפתור "פתח לוח iDroo" (טאב נפרד), Zoom, Drive
   → עבודה על הלוח ב-iDroo (בטאב נפרד) + עדכון נושא/הערות/ש.בית באפליקציה (autosave)
   → "סיום שיעור" → Modal קצר (מלא-אוטומטית ככל האפשר) → שמור + צור חיוב
   → "קבע שיעור הבא" → Modal → יוצר Lesson + Calendar Event (אחד בלבד, calendar_event_id נשמר)
   → Dashboard מתעדכן
```

---

## 7. תוכנית פיתוח לפי Phases

> כל Phase מסתיים רק כשה-Acceptance Test שלו (סעיף 13) עובר וה-DoD (סעיף 12) מתקיים. סמנו התקדמות ב-`STATUS.md`, לא כאן.

### Phase 0 — Foundation
Repo, React+TS+Vite, Tailwind, Supabase project, Auth (Supabase Auth, משתמש מנהל יחיד), Routing, Layout RTL, חיבור DB בסיסי, RLS מופעל מהיום הראשון (גם אם משתמש יחיד).

### Phase 1 — DB Schema
כל הטבלאות מסעיף 15, Constraints, FKs, Indexes, RLS Policies, Seed data לבדיקות (משפחת "כהן" לפי סעיף 13).

### Phase 2 — ניהול ליבה
Families CRUD, Students CRUD, Pricing Agreements (עם היסטוריה), Lessons CRUD בסיסי, Dashboard יומי (Timeline), Student Profile, Family Profile.

### Phase 3 — פיננסים
Charges, ChargeItems, Payments, PaymentAllocations, חישוב יתרה משפחתית, "סמן תשלום" Modal, Dashboard פיננסי בסיסי. **בסוף Phase זה המערכת חייבת לענות נכון על "מי חייב לי כסף וכמה".**

### Phase 4 — Lesson Workspace
כפתור "התחל שיעור" (קובע actual_start, אידמפוטנטי), Timer, Side Panel (מידע משיעור קודם + עריכה חיה עם auto-save של נושא/הערות/ש.בית), כפתור "פתח לוח iDroo" (טאב נפרד — ראו סעיף 3), "סיום שיעור" (Modal, קובע status/actual_end/actual_duration).

### Phase 5 — Google + Zoom
Google OAuth (Edge Function לטוקנים), Drive Picker, Default Zoom URL בהגדרות + כפתור "פתח Zoom", Calendar sync (יצירה/עריכה/ביטול, מניעת כפילויות), "קבע שיעור הבא" מלא.

### Phase 6 — תשלימים תפעוליים P1
Homework, Topic tracking בסיסי, Search גלובלי, Export ל-CSV, שיפורי Analytics (Forecast, ביטולים).

### Phase 7 — AI Layer (Optional, לא MVP)
Provider abstraction, סיכום שיעור חכם, הכנת שיעור הבא, מחולל הודעות. **AI לעולם לא Source of Truth לכסף/תאריכים/שעות.**

---

## 8. Environment Variables / Google Cloud (לריכוז ב-`.env` וב-README, לא בקוד)

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # רק בצד שרת / Edge Functions, אף פעם לא ב-client bundle
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=       # רק בצד שרת
GOOGLE_OAUTH_REDIRECT_URI=
GOOGLE_CALENDAR_ID_DEFAULT=       # אופציונלי, אפשר גם דרך הגדרות באפליקציה
DEFAULT_TIMEZONE=Asia/Jerusalem
```

Google Cloud Console: להפעיל Calendar API + Drive API + Picker API, ל-Scopes להשתמש ב-Least Privilege (`calendar.events`, `drive.file` — לא `drive` המלא).

---

## 9. Error Handling — עקרון גורף

כל אינטגרציה חיצונית (Calendar/Drive/Zoom) חייבת לדעת להיכשל **בלי להפיל** את שאר המערכת. Auto-save שנכשל → אזהרה ברורה למשתמש, לא שתיקה.

---

## 10. אבטחה — עקרון גורף

מידע על קטינים. אין גישה אנונימית, RLS על כל טבלה, Secrets רק כ-Env Vars, אין מידע אישי ב-URL, Input validation בכל טופס.

---

## 11. מקרי קצה חובה (לבדוק בכל Phase רלוונטי)

שני אחים באותה משפחה במחירים שונים; שינוי מחיר באמצע שנה; תשלום חלקי; תשלום שמכסה כמה חודשים/כמה ילדים; שיעור מבוטל/No-show; שינוי מועד שיעור; לחיצה כפולה על "סיום שיעור"; עריכת שיעור שכבר Completed; Calendar Event שנמחק חיצונית; כשל Google.

---

## 12. Definition of Done (לכל Feature)

UI עובד • DB עובד • Validation • Loading state • Error handling • RTL תקין • Mobile בסיסי תקין (למסכי ניהול) • Refresh לא מאבד מידע • Edge cases רלוונטיים נבדקו • אין console errors משמעותיים • אין secrets בקוד.

---

## 13. Acceptance Tests קריטיים

**כספים (משפחת כהן):** נועם 160₪×4=640, יעל 140₪×3=420, סה"כ 1,060₪ → תשלום 800₪ → יתרה 260₪ → תשלום 260₪ → יתרה 0₪ → שינוי מחיר נועם ל-170₪ לא משנה שיעורים קודמים.

**שיעור:** Zoom נפתח, לוח iDroo נפתח בטאב נפרד, סיום שיעור יוצר Lesson+Calendar Event **אחד בלבד** כל אחד.

---

## 14. פרוטוקול סתירות (קוד מול מסמך)

זיהוי → הבנת הסיבה למימוש הקיים → הצגת הפער למשתמש → החלטה משותפת: לעדכן קוד או לעדכן מסמך. לתעד את ההחלטה ב-`Decisions Log` ב-STATUS.md.

---

## 15. נספח א' — טבלאות DB מלאות

**families**: id, family_name, payer_name, phone, email, notes, active, created_at, updated_at
**students**: id, family_id(FK), first_name, last_name, grade, school, subjects, phone, email, notes, active, created_at, updated_at
**pricing_agreements**: id, student_id(FK), family_id(FK), billing_type, rate, standard_duration, valid_from, valid_until, notes
**lessons**: id, student_id(FK), family_id(FK), scheduled_start, scheduled_end, actual_start, actual_end, actual_duration, subject, topic, status[scheduled|completed|cancelled|no_show], price_snapshot, zoom_url, calendar_event_id, board_id(FK), lesson_notes, homework, cancellation_reason, created_at, updated_at
**charges**: id, family_id(FK), billing_period, amount, due_date, status, notes, created_at
**charge_items**: id, charge_id(FK), student_id(FK), lesson_id(FK, UNIQUE — ל-idempotency), description, amount
**payments**: id, family_id(FK), payment_date, amount, payment_method, reference, notes, created_at
**payment_allocations**: id, payment_id(FK), charge_id(FK), allocated_amount
**lesson_boards**: id, lesson_id(FK), student_id(FK), board_data(jsonb), preview_url, created_at, updated_at
**student_files**: id, student_id(FK), drive_file_id, file_name, file_type, drive_url, category, notes
**topics / student_progress** (P1): מבנה עץ נושאים + רמת שליטה + תאריך תרגול אחרון

---

## 16. עקרונות AI (רלוונטי רק מ-Phase 7 ואילך)

AI אינו Source of Truth לכסף/שעות/תאריכים — אלו תמיד מה-DB. AI מסכם/מסביר/ממליץ/מסווג בלבד, ומסומן בבירור ככזה. Provider abstraction כדי לא להיות תלוי בספק מודל אחד. פרטיות: מינימום מידע אישי נשלח למודל (Student ID פנימי, לא שם מלא/טלפון כשאפשר).

> **AI assists. The teacher decides. The database remains the source of truth.**
