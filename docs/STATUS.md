# TutorOS — Status

עודכן לאחרונה: 26/08/2026
Phase נוכחי: Phase 2 הושלם במלואו (2a+2b) ✅ | Deployment ל-GitHub Pages מוגדר ✅ | ממתין להתחלת Phase 3 (פיננסים)

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
(כלום כרגע)

## הבא בתור ⏭
1. **פעולה ידנית שלך (חובה, לא ניתנת לביצוע מקוד):** ב-GitHub → הריפו → Settings → Pages → Build and deployment → Source → לבחור **"GitHub Actions"**. בלי זה ה-workflow ירוץ בהצלחה ב-Actions אבל GitHub לא יפרסם תוצאה בכתובת החיה.
2. אחרי push ראשון: לבדוק שהאתר עולה ב-`https://yoavyaacov.github.io/tutoros/` ושמשפחת "כהן" מוצגת נכון (זו הבדיקה החיה שהוחמצה קודם).
3. Phase 3 — פיננסים: Charges/Payments UI (כרגע יש רק DB+seed מ-Phase 1, אין עדיין מסך), חיבור ל-Family Profile (המקום ה-placeholder שכבר קיים שם), Dashboard פיננסי.

## נדחה (Deferred) ⏸
- Leaked Password Protection — לא זמין בטיר Free של Supabase

## החלטות פתוחות / שאלות למשתמש ❓
(ריק כרגע)

## Decisions Log
(ראו היסטוריה קודמת לרשומות עד Phase 2a)
- 26/08/2026 — נוסף Deployment (לא היה בתוכנית Phases המקורית) — לפי בקשת המשתמש, GitHub Pages עם GitHub Actions, HashRouter כפתרון SPA routing
- 26/08/2026 — Phase 2b: קביעת שיעור נשארת ידנית (בלי Google Calendar) עד Phase 5, כדי לא לבנות את מסך יצירת השיעור פעמיים
- 26/08/2026 — Phase 2 (2a+2b) הושלם במלואו ונבדק (type-check, build נקי, דימוי static server עם base path)
