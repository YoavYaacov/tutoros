import { useState } from "react";
import { Link } from "react-router-dom";
import { useFamilies } from "@/hooks/useFamilies";
import { FamilyFormModal } from "@/components/families/FamilyFormModal";
import { LoadingBlock, ErrorBanner, ActiveBadge, toErrorMessage } from "@/components/shared/Feedback";

export default function Families() {
  const { data: families, isLoading, error } = useFamilies();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink-900">משפחות</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          + משפחה חדשה
        </button>
      </div>

      {isLoading && <LoadingBlock />}
      {error && <ErrorBanner message={toErrorMessage(error)} />}

      {families && families.length === 0 && (
        <div className="rounded-card border border-dashed border-ink-100 bg-white p-8 text-center text-ink-400">
          עדיין אין משפחות. לחץ על "משפחה חדשה" כדי להתחיל.
        </div>
      )}

      {families && families.length > 0 && (
        <div className="overflow-hidden rounded-card bg-white ring-1 ring-ink-100">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-right text-ink-400">
              <tr>
                <th className="px-4 py-3 font-medium">משפחה</th>
                <th className="px-4 py-3 font-medium">הורה/משלם</th>
                <th className="px-4 py-3 font-medium">טלפון</th>
                <th className="px-4 py-3 font-medium">סטטוס</th>
              </tr>
            </thead>
            <tbody>
              {families.map((family) => (
                <tr key={family.id} className="border-t border-ink-100 hover:bg-ink-50">
                  <td className="px-4 py-3">
                    <Link
                      to={`/families/${family.id}`}
                      className="font-medium text-brand-700 hover:underline"
                    >
                      {family.family_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-700">{family.payer_name}</td>
                  <td className="px-4 py-3 text-ink-700" dir="ltr">
                    {family.phone ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <ActiveBadge active={family.active} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <FamilyFormModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
