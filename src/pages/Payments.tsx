import { useState } from "react";
import { Link } from "react-router-dom";
import { useFamilies } from "@/hooks/useFamilies";
import { useAllFamilyBalances } from "@/hooks/usePayments";
import { useGenerateChargesForAllFamilies } from "@/hooks/useCharges";
import { PaymentFormModal } from "@/components/payments/PaymentFormModal";
import { LoadingBlock, ErrorBanner, toErrorMessage } from "@/components/shared/Feedback";
import { formatCurrency, formatBillingPeriod } from "@/lib/format";

export default function Payments() {
  const { data: families, isLoading: familiesLoading, error: familiesError } = useFamilies();
  const { data: balances, isLoading: balancesLoading, error: balancesError } = useAllFamilyBalances();
  const generateMutation = useGenerateChargesForAllFamilies();

  const [payFamilyId, setPayFamilyId] = useState<string | null>(null);
  const [generateMessage, setGenerateMessage] = useState<string | null>(null);

  async function handleGenerateCharges() {
    setGenerateMessage(null);
    try {
      const created = await generateMutation.mutateAsync();
      setGenerateMessage(
        created.length === 0
          ? "אין שיעורים חדשים שהתקיימו וטרם חויבו, בכל המשפחות."
          : `נוצרו ${created.length} חיובים חדשים.`,
      );
    } catch (err) {
      setGenerateMessage(toErrorMessage(err));
    }
  }

  if (familiesLoading || balancesLoading) return <LoadingBlock />;
  if (familiesError) return <ErrorBanner message={toErrorMessage(familiesError)} />;
  if (balancesError) return <ErrorBanner message={toErrorMessage(balancesError)} />;

  const balanceByFamily = new Map((balances ?? []).map((b) => [b.family_id, b]));

  const rows = (families ?? [])
    .map((family) => ({ family, balance: balanceByFamily.get(family.id) }))
    .filter((row) => (row.balance?.balance ?? 0) > 0)
    .sort((a, b) => (b.balance?.balance ?? 0) - (a.balance?.balance ?? 0));

  const totalOutstanding = rows.reduce((sum, row) => sum + (row.balance?.balance ?? 0), 0);
  const selectedRow = rows.find((row) => row.family.id === payFamilyId);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-ink-900">תשלומים</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerateCharges}
            disabled={generateMutation.isPending}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-ink-700 ring-1 ring-ink-100 hover:bg-ink-50 disabled:opacity-60"
          >
            {generateMutation.isPending ? "בודק שיעורים..." : "צור חיובים משיעורים שלא חויבו"}
          </button>
          <span className="text-sm text-ink-400">
            סה"כ לגבייה: <span className="font-bold text-ink-900">{formatCurrency(totalOutstanding)}</span>
          </span>
        </div>
      </div>

      {generateMessage && (
        <div className="mb-4 rounded-lg bg-ink-50 px-3 py-2 text-sm text-ink-700">{generateMessage}</div>
      )}

      {rows.length === 0 ? (
        <div className="rounded-card border border-dashed border-ink-100 bg-white p-8 text-center text-ink-400">
          אין יתרות פתוחות כרגע — כל המשפחות מסודרות.
        </div>
      ) : (
        <div className="overflow-hidden rounded-card bg-white ring-1 ring-ink-100">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-right text-ink-400">
              <tr>
                <th className="px-4 py-2 font-medium">משפחה</th>
                <th className="px-4 py-2 font-medium">חיוב לחודש</th>
                <th className="px-4 py-2 font-medium">חויב בסה"כ</th>
                <th className="px-4 py-2 font-medium">שולם</th>
                <th className="px-4 py-2 font-medium">יתרה</th>
                <th className="px-4 py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {rows.map(({ family, balance }) => (
                <tr key={family.id} className="border-t border-ink-100">
                  <td className="px-4 py-2">
                    <Link
                      to={`/families/${family.id}`}
                      className="font-medium text-brand-700 hover:underline"
                    >
                      משפחת {family.family_name}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-ink-700">
                    {(balance?.open_periods ?? []).map(formatBillingPeriod).join(", ") || "—"}
                  </td>
                  <td className="px-4 py-2 text-ink-700">{formatCurrency(balance?.total_charged ?? 0)}</td>
                  <td className="px-4 py-2 text-ink-700">{formatCurrency(balance?.total_paid ?? 0)}</td>
                  <td className="px-4 py-2 font-semibold text-amber-600">
                    {formatCurrency(balance?.balance ?? 0)}
                  </td>
                  <td className="px-4 py-2 text-left">
                    <button
                      onClick={() => setPayFamilyId(family.id)}
                      className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
                    >
                      סמן תשלום
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedRow && (
        <PaymentFormModal
          open={!!payFamilyId}
          onClose={() => setPayFamilyId(null)}
          familyId={selectedRow.family.id}
          balance={selectedRow.balance?.balance ?? 0}
        />
      )}
    </div>
  );
}
