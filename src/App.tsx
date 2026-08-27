import { lazy, Suspense } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import { ProtectedRoute } from "@/lib/auth/ProtectedRoute";
import AppShell from "@/components/layout/AppShell";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Families from "@/pages/Families";
import FamilyProfile from "@/pages/FamilyProfile";
import Students from "@/pages/Students";
import StudentProfile from "@/pages/StudentProfile";
import Payments from "@/pages/Payments";

// טעינה עצלה — Excalidraw/MathLive/pdf.js כבדים, לא צריך לטעון אותם בכל מסך אחר באפליקציה
const LessonWorkspace = lazy(() => import("@/pages/LessonWorkspace"));

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Lesson Workspace יוצא בכוונה מחוץ ל-AppShell — מסך מלא בלי סיידבר, לא תואם ל-layout הרגיל */}
          <Route
            path="/lesson/:lessonId"
            element={
              <ProtectedRoute>
                <Suspense
                  fallback={
                    <div className="flex h-screen items-center justify-center text-ink-400">טוען...</div>
                  }
                >
                  <LessonWorkspace />
                </Suspense>
              </ProtectedRoute>
            }
          />

          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/families" element={<Families />} />
            <Route path="/families/:id" element={<FamilyProfile />} />
            <Route path="/students" element={<Students />} />
            <Route path="/students/:id" element={<StudentProfile />} />
            <Route path="/payments" element={<Payments />} />
            {/* יומן / דוחות / הגדרות ייכנסו ב-Phases הבאים */}
          </Route>
        </Routes>
      </AuthProvider>
    </HashRouter>
  );
}
