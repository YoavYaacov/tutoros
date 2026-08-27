import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useFamily } from "@/hooks/useFamilies";
import { useStudentsByFamily } from "@/hooks/useStudents";
import { useChargesWithBalance } from "@/hooks/useCharges";
import { useFamilyBalance, usePaymentsByFamily } from "@/hooks/usePayments";
import { FamilyFormModal } from "@/components/families/FamilyFormModal";
import { StudentFormModal } from "@/components/students/StudentFormModal";
import { PaymentFormModal } from "@/components/payments/PaymentFormModal";
import { LoadingBlock, ErrorBanner, ActiveBadge, toErrorMessage } from "@/components/shared/Feedback";
import {
  formatCurrency,
  formatDate,
  formatBillingPeriod,
  chargeStatusLabel,
  chargeStatusColorClass,
} from "@/lib/format";

export default function FamilyProfile() {
  const { id } = useParams<{ id: string }>();
  const { data: family, isLoading, error } = useFamily(id);
  const { data: students } = useStudentsByFamily(id);
  const { data: charges } = useChargesWithBalance(id);
  const { data: payments } = usePaymentsByFamily(id);
  const { data: balance } = useFamilyBalance(id);

  const [editOpen, setEditOpen] = useState(false);
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);

  if (isLoading) return <LoadingBlock />;
  if (error) return <ErrorBanner message={toErrorMessage(error)} />;
  if (!family) return <ErrorBanner message="המשפחה לא נמצאה" />;

  return (
    <div>
      <Link to="/families" className="mb-4 inline-block text-sm text-ink-400 hover:text-brand-700">
        ← חזרה למשפחות
      </Link>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <h1 className="text-2xl font-bold text-ink-900">משפחת {family.family_name}</h1>
            <ActiveBadge active={family.active} />
          </div>
          <p className="text-sm text-ink-400">
            הורה/משלם: {family.payer_name}
            {family.phone && ` · ${family.phone}`}
          </p>
        </div>
        <button
          onClick={() => setEditOpen(true)}
          className="rounded-lg px-3 py-2 text-sm font-medium text-ink-700 ring-1 ring-ink-100 hover:bg-ink-50"
        >
          ערוך פרטים
        </button>
      </div>

      {family.notes && (
        <div className="mb-6 rounded-card bg-white p-4 text-sm text-ink-700 ring-1 ring-ink-100">
          {family.notes}
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-ink-900">
          ילדים במשפחה {students ? `(${students.length})` : ""}
        </h2>
        <button
          onClick={() => setAddStudentOpen(true)}
          className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          + תלמיד חדש
        </button>
      </div>

      {students && students.length === 0 && (
        <div className="rounded-card border border-dashed border-ink-100 bg-white p-6 text-center text-ink-400">
          אין עדיין תלמידים במשפחה זו.
        </div>
      )}

      {students && students.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {students.map((student) => (
            <Link
              key={student.id}
              to={`/students/${student.id}`}
              className="rounded-card bg-white p-4 ring-1 ring-ink-100 transition hover:ring-brand-400"
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="font-medium text-ink-900">
                  {student.first_name} {student.last_name}
                </span>
                <ActiveBadge active={student.active} />
              </div>
              <p className="text-xs text-ink-400">
                {student.grade && `כיתה ${student.grade}`}
                {student.subjects.length > 0 && ` · ${student.subjects.join(", ")}`}
              </p>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-ink-900">פיננסים</h2>
        <button
          onClick={() => setPayOpen(true)}
          disabled={!balance}
          className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-40"
        >
          סמן תשלום
        </button>
      </div>

      <div className="mb-6 rounded-card bg-white p-4 ring-1 ring-ink-100">
        <p className="text-xs text-ink-400">יתרה פתוחה</p>
        <p className={`text-2xl font-bold ${balance ? "text-amber-600" : "text-ink-900"}`}>
          {formatCurrency(balance ?? 0)}
        </p>
      </div>

      <h3 className="mb-3 text-sm font-bold text-ink-900">חיובים</h3>
      {!charges || charges.length === 0 ? (
        <div className="mb-6 rounded-card border border-dashed border-ink-100 bg-white p-6 text-center text-ink-400">
          אין עדיין חיובים למשפחה זו.
        </div>
      ) : (
        <div className="mb-6 overflow-hidden rounded-card bg-white ring-1 ring-ink-100">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-right text-ink-400">
              <tr>
                <th className="px-4 py-2 font-medium">תקופה</th>
                <th className="px-4 py-2 font-medium">סכום</th>
                <th className="px-4 py-2 font-medium">שולם</th>
                <th className="px-4 py-2 font-medium">יתרה</th>
                <th className="px-4 py-2 font-medium">סטטוס</th>
              </tr>
            </thead>
            <tbody>
              {charges.map((charge) => (
                <tr key={charge.id} className="border-t border-ink-100">
                  <td className="px-4 py-2 text-ink-700">{formatBillingPeriod(charge.billing_period)}</td>
                  <td className="px-4 py-2 text-ink-700">{formatCurrency(charge.amount)}</td>
                  <td className="px-4 py-2 text-ink-700">{formatCurrency(charge.paid_amount)}</td>
                  <td className="px-4 py-2 text-ink-700">{formatCurrency(charge.balance)}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${chargeStatusColorClass(charge.status)}`}
                    >
                      {chargeStatusLabel(charge.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h3 className="mb-3 text-sm font-bold text-ink-900">תשלומים</h3>
      {!payments || payments.length === 0 ? (
        <div className="rounded-card border border-dashed border-ink-100 bg-white p-6 text-center text-ink-400">
          אין עדיין תשלומים רשומים.
        </div>
      ) : (
        <div className="overflow-hidden rounded-card bg-white ring-1 ring-ink-100">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-right text-ink-400">
              <tr>
                <th className="px-4 py-2 font-medium">תאריך</th>
                <th className="px-4 py-2 font-medium">סכום</th>
                <th className="px-4 py-2 font-medium">אמצעי</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-t border-ink-100">
                  <td className="px-4 py-2 text-ink-700">{formatDate(payment.payment_date)}</td>
                  <td className="px-4 py-2 text-ink-700">{formatCurrency(payment.amount)}</td>
                  <td className="px-4 py-2 text-ink-700">{payment.payment_method ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <FamilyFormModal open={editOpen} onClose={() => setEditOpen(false)} family={family} />
      <StudentFormModal
        open={addStudentOpen}
        onClose={() => setAddStudentOpen(false)}
        fixedFamilyId={family.id}
      />
      <PaymentFormModal
        open={payOpen}
        onClose={() => setPayOpen(false)}
        familyId={family.id}
        balance={balance ?? 0}
      />
    </div>
  );
}
