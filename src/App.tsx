import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import { ProtectedRoute } from "@/lib/auth/ProtectedRoute";
import AppShell from "@/components/layout/AppShell";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Families from "@/pages/Families";
import FamilyProfile from "@/pages/FamilyProfile";
import Students from "@/pages/Students";
import StudentProfile from "@/pages/StudentProfile";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

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
            {/* לוח שיעורים / תשלומים / דוחות / הגדרות ייכנסו ב-Phases הבאים */}
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
