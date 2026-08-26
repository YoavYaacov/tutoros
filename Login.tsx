import { FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth/AuthProvider";

export default function Login() {
  const { session, signInWithPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (session) return <Navigate to="/" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error } = await signInWithPassword(email, password);
    setSubmitting(false);
    if (error) setError("אימייל או סיסמה שגויים");
  }

  return (
    <div className="flex h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm rounded-card bg-white p-8 shadow-sm ring-1 ring-ink-100">
        <h1 className="mb-1 text-2xl font-bold text-ink-900">TutorOS</h1>
        <p className="mb-6 text-sm text-ink-400">התחברות לעמדת העבודה</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">אימייל</label>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-ink-100 px-3 py-2 text-ink-900 focus-visible:border-brand-600"
              dir="ltr"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">סיסמה</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-ink-100 px-3 py-2 text-ink-900 focus-visible:border-brand-600"
              dir="ltr"
            />
          </div>

          {error && <p className="text-sm text-amber-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-brand-600 py-2 font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            {submitting ? "מתחבר..." : "התחבר"}
          </button>
        </form>
      </div>
    </div>
  );
}
