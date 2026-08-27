import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/lib/auth/AuthProvider";

const NAV_ITEMS = [
  { to: "/", label: "ראשי", end: true },
  { to: "/students", label: "תלמידים" },
  { to: "/families", label: "משפחות" },
  { to: "/schedule", label: "יומן" },
  { to: "/payments", label: "תשלומים" },
  { to: "/reports", label: "דוחות" },
  { to: "/settings", label: "הגדרות" },
];

export default function AppShell() {
  const { signOut } = useAuth();

  return (
    <div className="flex h-screen bg-surface">
      {/* סיידבר ימני (RTL) */}
      <aside className="flex w-60 shrink-0 flex-col border-l border-ink-100 bg-white">
        <div className="px-5 py-5">
          <span className="text-lg font-extrabold text-ink-900">TutorOS</span>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-brand-50 text-brand-700"
                    : "text-ink-700 hover:bg-ink-50"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-ink-100 p-3">
          <button
            onClick={() => signOut()}
            className="w-full rounded-lg px-3 py-2 text-right text-sm font-medium text-ink-400 hover:bg-ink-50"
          >
            התנתקות
          </button>
        </div>
      </aside>

      {/* תוכן */}
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
