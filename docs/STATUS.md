# TutorOS — Status

עודכן לאחרונה: 28/08/2026
Phase נוכחי: Phase 4 (Lesson Workspace + Whiteboard) — Stage A (הליבה) הושלם ונבדק E2E בדפדפן ✅ | Stage B (MathLive+PDF.js) בעבודה

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

### Phase 3 — פיננסים
- `src/types/database.ts` — נוספו Charge, ChargeItem, Payment, PaymentAllocation (+ Input types), תואמים 1:1 ל-db/schema.sql הקיים מ-Phase 1. (עמודות `email` ב-families/students הוסרו מהטיפוסים — ראו "החלטות" למטה.)
- `src/lib/api/charges.ts`:
  - `listChargesByFamily` / `listChargesWithBalance` (מוסיף paid_amount+balance מחושבים מ-payment_allocations) / `listChargeItemsByCharge`
  - `generateChargesForAllFamilies()` — **האוטומציה שהוחלט עליה מול המשתמש**: סורקת שיעורים completed בכל המשפחות שאין להם עדיין charge_item, מקבצת לפי (משפחה, חודש), ויוצרת חיוב לכל צירוף כזה עם price_snapshot כסכום. Idempotent הן בלוגיקה (מסנן lesson_id שכבר קיים ב-charge_items) והן ב-DB (unique index חלקי קיים מ-Phase 1). **בכוונה גלובלית ולא לפי משפחה בודדת** — כפתור אחד בראש מסך /payments, לא בכרטיס משפחה (הוסר משם לפי בקשת המשתמש).
- `src/lib/api/payments.ts`:
  - `recordPaymentWithAllocation` — **ההחלטה השנייה מול המשתמש**: שיוך אוטומטי FIFO (חיוב הכי ישן לפי billing_period קודם). חוסם תשלום שגבוה מהיתרה הפתוחה *לפני* כל כתיבה ל-DB (אין מושג "יתרת זכות" בסכימה, אז overpayment פשוט נדחה עם שגיאה ברורה).
  - `getFamilyBalance`, `listAllFamilyBalances` (כולל `open_periods` — אילו billing_period עדיין פתוחים לכל משפחה, מוצג כעמודה "חיוב לחודש" במסך תשלומים)
- `src/hooks/useCharges.ts`, `src/hooks/usePayments.ts` — עטיפות React Query תואמות לקונבנציה הקיימת
- `src/lib/format.ts` — נוספו `formatCurrency`, `formatBillingPeriod` (למשל "אוגוסט 2026"), `chargeStatusLabel`, `chargeStatusColorClass`
- `src/components/payments/PaymentFormModal.tsx` — מודל "סימון תשלום" (סכום מוגבל ל-min/max מול היתרה, תאריך, אמצעי, הערות — **בלי שדה "אסמכתא"**, הוסר לפי בקשת המשתמש)
- `src/pages/Payments.tsx` (מסך חדש, route `/payments`) — כפתור "צור חיובים משיעורים שלא חויבו" **בראש המסך** (גלובלי לכל המשפחות, מרענן את הטבלה אוטומטית), טבלת כל המשפחות עם יתרה פתוחה + עמודת "חיוב לחודש" + כפתור "סמן תשלום" לכל שורה
- `src/pages/FamilyProfile.tsx` — סקשן "פיננסים": יתרה פתוחה, כפתור "סמן תשלום" (בלי כפתור יצירת חיוב — הוסר, ראו למעלה), טבלת חיובים (תקופה מוצגת בעברית/formatBillingPeriod/סכום/שולם/יתרה/סטטוס), טבלת תשלומים (בלי עמודת אסמכתא)
- `src/pages/Dashboard.tsx` — ווידג'ט "יתרה פתוחה לגבייה" (סכום כולל + מס' משפחות עם יתרה) + לינק למסך תשלומים
- `src/components/students/StudentFormModal.tsx` — בהוספת תלמיד חדש, שם המשפחה מתמלא אוטומטית לפי שם המשפחה שנבחרה (כל עוד המשתמש לא הקליד בעצמו)
- `src/components/layout/AppShell.tsx` — פריט התפריט "לוח שיעורים" שונה ל"יומן" (עדיין בלי מסך מאחוריו — ראה "הבא בתור")
- `src/components/lessons/LessonFormModal.tsx` — **מחיר לשיעור בודד ניתן לעריכה ידנית** (שדה "מחיר לשיעור הזה"), במקום להיות נעול אוטומטית למחיר הרגיל של התלמיד. מטרה: שיעור שהתארך/התקצר, או שיעור משותף לשני תלמידים עם תמחור פרטני שונה לכל אחד (כל תלמיד הוא lesson נפרד באותה שעה, כל אחד עם מחיר משלו). לשיעור חדש עדיין מוצע ברירת מחדל = המחיר הרגיל, אבל ניתן לשינוי לפני השמירה.
- `src/pages/StudentProfile.tsx` — שורות שיעור (עתידי/היסטוריה) לחיצות כעת ופותחות את LessonFormModal במצב עריכה על אותו שיעור — **זה גם סוגר את הפער שתועד למטה**: אפשר עכשיו לסמן שיעור כ"התקיים" מה-UI.

**אומת:** `npm run build` נקי (type-check + vite build), ונבדק בדפדפן בפועל מול נתוני "כהן" האמיתיים ב-Supabase — כולל שימוש אמיתי של המשתמש (3 תשלומים בסה"כ ₪1,060 על חיוב של ₪1,060 → יתרה ₪0, סטטוס 'paid'). כפתור היצירה הגלובלי נבדק גם הוא ("אין שיעורים חדשים שהתקיימו וטרם חויבו" כשאין מה ליצור). עריכת שיעור קיים נבדקה: לחיצה על שורת שיעור פותחת מודל עם הנתונים האמיתיים (תאריך/סטטוס/מחיר) מוכנים לעריכה.

### Phase 4, Stage A — Lesson Workspace (הליבה)
בלי migration — הכל מתאים לסכימה הקיימת. תלות חדשה: `@excalidraw/excalidraw` (טעינה עצלה, `React.lazy`, כדי לא לנפח את הבאנדל הראשי של שאר המסכים).
- `src/types/database.ts` — נוסף `LessonBoard`/`LessonBoardInput`, ו-`LessonInput` קיבל `actual_start`/`actual_end`/`actual_duration`/`board_id`.
- `src/lib/api/lessons.ts` — `getLesson(id)`, ו-`startLesson(id)` **אידמפוטנטי**: לא דורס `actual_start` אם כבר קיים (כדי לא "לאפס" זמן מדוד — היה פוגע באמינות משך השיעור המחויב).
- `src/lib/api/lessonBoards.ts` (חדש) — CRUD ללוחות: `getLessonBoardByLessonId`, `createLessonBoard` (גם מעדכן `lessons.board_id`, המצביע הכפול בסכימה), `updateLessonBoardData`, `getPreviousBoardDataForStudent` (ל"המשך מהשיעור הקודם").
- `src/hooks/useDebouncedCallback.ts` (חדש, כללי) — `{debounced, flush}`; `flush` נקרא ב-cleanup של unmount כדי לא לאבד שינוי אחרון שממתין ב-debounce.
- `src/hooks/useLessons.ts` — נוספו `useLesson(id)`, `useStartLesson()`, ו-`useAutosaveLessonFields(id)` — **חריגה מכוונת מהקונבנציה**: משתמש ב-`setQueryData` ולא ב-`invalidateQueries` (כי זה יורה כל 2 שניות תוך כדי הקלדה, ו-refetch היה מתחרה בעריכה חיה).
- `src/hooks/useLessonBoards.ts` (חדש) — אותו דפוס: `useAutosaveLessonBoard` הוא `setQueryData`-בלבד, `useCreateLessonBoard` (פעולה חד-פעמית) הוא invalidate רגיל.
- `src/pages/LessonWorkspace.tsx` (חדש, route `/lesson/:lessonId`) — **בכוונה מחוץ ל-AppShell** (בלי סיידבר, מסך מלא): header (שם תלמיד, טיימר, אינדיקטור שמירה, "סיום שיעור"), Side Panel (שיעור קודם לקריאה + נושא/הערות/ש.בית לעריכה חיה עם autosave), ולוח Excalidraw. יצירת לוח: אם יש לוח קודם לתלמיד — שואל "לוח חדש / המשך מהשיעור הקודם"; אחרת יוצר לוח ריק בשקט.
- `src/components/lessonWorkspace/` (חדש): `ExcalidrawBoard.tsx` (autosave עם debounce 2.5s דרך `serializeAsJSON`, כולל files/תמונות מוטמעות כ-base64 — **אין Storage bucket בפרויקט**, זו החלטה מכוונת ל-MVP), `BoardStartChoiceModal.tsx`, `LessonTimer.tsx` (שעון עצר פשוט, בלי התראת חריגה), `SaveIndicator.tsx`, `LessonSidePanel.tsx`, `EndLessonModal.tsx` (מחשב משך בפועל, ניתן לעריכה; לחיצה כפולה מוגנת ב-`disabled` בזמן שמירה).
- `src/pages/StudentProfile.tsx` — "התחל שיעור" מופעל: בוחר אוטומטית את השיעור המתוכנן הקרוב ביותר, קורא ל-`startLesson`, מנווט ל-`/lesson/:id`.

**אומת E2E בדפדפן על שיעור אמיתי (לא רק seed):** נוצר שיעור חדש → "התחל שיעור" → הלוח נטען (Excalidraw מלא, כל הכלים) → ציור נשמר אוטומטית ל-DB (`lesson_boards.board_data`) → עריכת "נושא" בסייד פאנל נשמרה אוטומטית ל-`lessons.topic` → "סיום שיעור" עדכן `status='completed'`, `actual_end`, `actual_duration=3` → חזרה לכרטיס תלמיד הציגה את זה נכון → **"צור חיובים משיעורים שלא חויבו" במסך תשלומים אסף את השיעור אוטומטית ויצר חיוב חדש** (יתרת משפחת כהן עלתה מ-₪0 ל-₪160, "אוגוסט 2026") — מוודא שהאינטגרציה בין Phase 3 ל-Phase 4 עובדת מקצה לקצה.

**באג שנמצא ותוקן תוך כדי בדיקה:** `EndLessonModal` נשאר mounted ברקע (עם `open=false`) מרגע הכניסה ל-Workspace, אז `useState` עם ערך התחלתי (משך מחושב / נושא) קלט את הערכים **בזמן ה-mount המוקדם**, לא בזמן הפתיחה בפועל — תוקן עם `useEffect` שמאתחל מחדש בכל `open===true`, אותו דפוס בדיוק שכבר תוקן קודם ב-`PaymentFormModal`.

## הבא בתור ⏭
1. מסך "יומן" (`/schedule`) — עדיין אין מסך מאחורי הלינק בתפריט. לא שובץ במפורש לאף Phase במסמך האב; צריך להחליט מתי לבנות (יומן שבועי/חודשי, לא רק Timeline יומי כמו בדשבורד).
2. **פעולה ידנית שלך (חובה, לא ניתנת לביצוע מקוד):** ב-GitHub → הריפו → Settings → Pages → Build and deployment → Source → לבחור **"GitHub Actions"** (אם עדיין לא בוצע).
3. `due_date` לחיובים לא מוגדר אוטומטית כרגע (נשאר null) — לשקול אם צריך ברירת מחדל לפני Phase 6 (Export/Analytics).
4. עמודת `email` ב-`families`/`students` עדיין קיימת פיזית ב-DB (ראה החלטה למטה) — לשקול אם למחוק בפועל.

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
- 28/08/2026 — Phase 3: "צור חיוב" הוא כפתור **גלובלי אחד** בראש מסך /payments (כל המשפחות בבת אחת), לא כפתור לכל משפחה בכרטיס שלה — לפי בקשת המשתמש
- 28/08/2026 — שדה "אסמכתא" (reference) בתשלום הוסר מה-UI (טופס+תצוגה) לפי בקשת המשתמש. העמודה עצמה נשארת ב-DB/ב-Payment type, פשוט לא נאספת/מוצגת יותר
- 28/08/2026 — שדה "אימייל" של משפחה/תלמיד הוסר לגמרי מהאפליקציה (טפסים, תצוגה, טיפוסי TS) לפי בקשת המשתמש ("תוריד את המיילים מהמערכת"). **ניסיון למחוק את עמודת email פיזית מ-DB נחסם ע"י הרשאות המערכת (DDL הרסני) ולא בוצע** — העמודה נשארת קיימת אך ריקה/לא-בשימוש ב-`families`/`students`. אם המשתמש ירצה מחיקה פיזית בפועל, צריך אישור מפורש נוסף.
- 28/08/2026 — תלמיד חדש: שם המשפחה מתמלא אוטומטית לפי המשפחה שנבחרה (ניתן לעריכה ידנית) — לפי בקשת המשתמש
- 28/08/2026 — פריט תפריט "לוח שיעורים" שונה ל"יומן" — לפי בקשת המשתמש (עדיין אין מסך מאחוריו)
- 28/08/2026 — מחיר לשיעור בודד (price_snapshot) ניתן לעריכה ידנית בטופס השיעור, לא נעול אוטומטית למחיר הרגיל של התלמיד — לפי בקשת המשתמש (שיעור שהתארך/התקצר, או שיעור משותף עם תמחור פרטני שונה לכל תלמיד). כחלק מזה, שורות שיעור בכרטיס תלמיד הפכו ללחיצות ופותחות עריכה — זה גם נותן דרך ראשונה מה-UI לסמן שיעור כ"התקיים"
