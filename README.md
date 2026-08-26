# TutorOS — Phase 0 (Foundation)

עמדת העבודה של מורה פרטי. שלב זה: תשתית בלבד (Auth + Layout + RTL + חיבור Supabase). אין עדיין ניהול תלמידים/משפחות/שיעורים — זה יגיע ב-Phase 2 לפי `docs/MASTER.md`.

## הרצה מקומית

```bash
npm install
cp .env.example .env.local   # כבר מכיל URL + מפתח publishable של פרויקט Supabase האמיתי
npm run dev
```

האפליקציה תעלה על `http://localhost:5173`.

## יצירת משתמש מנהל ראשון

בשלב הזה אין מסך הרשמה (במכוון — משתמש יחיד). ליצור את המשתמש שלך:

1. היכנס ל-Supabase Dashboard של הפרויקט `tutoros`.
2. Authentication → Users → Add user.
3. הזן את האימייל והסיסמה שאיתם תתחבר במסך ההתחברות של TutorOS.

## בדיקת build

```bash
npm run build      # type-check + bundle לפרודקשן, פלט ב-dist/
npm run preview    # מגיש את ה-build המקומפל לבדיקה
```

## מבנה תיקיות

```
src/
  lib/
    supabase.ts          # לקוח Supabase יחיד — לא ליצור עוד מופעים במקומות אחרים
    auth/
      AuthProvider.tsx   # מצב התחברות גלובלי
      ProtectedRoute.tsx # שומר על מסכים שדורשים התחברות
  components/
    layout/
      AppShell.tsx       # סיידבר ניווט RTL + מבנה קבוע
  pages/
    Login.tsx
    Dashboard.tsx         # placeholder — ימולא ב-Phase 2
  App.tsx                 # כל ה-routes
  main.tsx                # entry point
```

## Status

ראה `docs/STATUS.md` למצב עדכני של הפרויקט ו-`docs/MASTER.md` למסמך האב המלא.
