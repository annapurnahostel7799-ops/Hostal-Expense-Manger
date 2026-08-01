import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createExpense, listExpenses } from "../services/expenseService";
import { useAuthContext } from "../contexts/AuthContext";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { formatCurrency, formatDate } from "../utils/format";
import type { Expense } from "../types";

const creditPaymentModes = ["Cred", "Credit Card"] as const;
const creditExpenseTypes = [
  // "Hostel fee",
  "Hospital",
  "Individual person",
  "Other",
];

function formatStatusLabel(status: Expense["status"]) {
  switch (status) {
    case "approved":
      return "Approved";
    case "reimbursed":
      return "Reimbursed";
    case "pending":
    default:
      return "Pending";
  }
}

type CreditFormState = {
  amount: string;
  type: string;
  paymentMode: (typeof creditPaymentModes)[number];
  date: string;
  comments: string;
};

export default function CreditsPage() {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreditFormState>({
    amount: "",
    type: creditExpenseTypes[0],
    paymentMode: creditPaymentModes[0],
    date: new Date().toISOString().slice(0, 10),
    comments: "",
  });

  const expensesQuery = useQuery<Expense[]>({
    queryKey: ["expenses", user?.uid],
    queryFn: async () => listExpenses(user!.uid),
    enabled: Boolean(user),
  });

  const createMutation = useMutation({
    mutationFn: (payload: Parameters<typeof createExpense>[0]) =>
      createExpense(payload),
    onSuccess: () => {
      if (user?.uid) {
        queryClient.invalidateQueries({ queryKey: ["expenses", user.uid] });
      }
      setShowForm(false);
      setForm({
        amount: "",
        type: creditExpenseTypes[0],
        paymentMode: creditPaymentModes[0],
        date: new Date().toISOString().slice(0, 10),
        comments: "",
      });
    },
  });

  const creditExpenses = useMemo(
    () =>
      (expensesQuery.data ?? []).filter((expense) =>
        creditPaymentModes.includes(
          expense.paymentMode as (typeof creditPaymentModes)[number],
        ),
      ),
    [expensesQuery.data],
  );

  const totalCredit = useMemo(
    () =>
      creditExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0),
    [creditExpenses],
  );

  const outstandingCredit = useMemo(
    () =>
      creditExpenses
        .filter((expense) => expense.status !== "reimbursed")
        .reduce((sum, expense) => sum + Number(expense.amount), 0),
    [creditExpenses],
  );

  const creditByMode = useMemo(() => {
    return creditExpenses.reduce<Record<string, number>>((acc, expense) => {
      acc[expense.paymentMode] =
        (acc[expense.paymentMode] ?? 0) + Number(expense.amount);
      return acc;
    }, {});
  }, [creditExpenses]);

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.amount || Number(form.amount) <= 0 || !user?.uid) {
      return;
    }

    try {
      await createMutation.mutateAsync({
        title: form.type,
        amount: Number(form.amount),
        categoryId: form.type,
        categoryName: form.type,
        paymentMode: form.paymentMode,
        expenseBy: form.type,
        expenseDate: form.date,
        status: "pending",
        createdBy: user.uid,
        comments: form.comments.trim() || undefined,
      });
    } catch (error) {
      console.error("Failed to save credit expense:", error);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-lime-50 to-amber-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-[2rem] bg-white/90 p-10 shadow-soft ring-1 ring-emerald-100">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-4xl font-semibold text-slate-900">
                Credit Dashboard
              </h1>
              <p className="mt-4 text-slate-600">
                Track your credit-based spending and outstanding balances from
                expenses that use Cred or Credit Card as the payment mode.
              </p>
            </div>
            <Button
              type="button"
              variant="primary"
              onClick={() => setShowForm(true)}
            >
              Add Credit
            </Button>
          </div>
        </div>

        {showForm ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
            <div className="w-full max-w-3xl">
              <Card className="relative overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-lg font-semibold text-slate-900 hover:bg-slate-200"
                >
                  X
                </button>
                <div className="space-y-6 pt-6">
                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <label className="space-y-2 text-sm text-slate-700">
                        <span>Amount</span>
                        <input
                          name="amount"
                          value={form.amount}
                          onChange={handleChange}
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                        />
                      </label>
                      <label className="space-y-2 text-sm text-slate-700">
                        <span>Credit type</span>
                        <select
                          name="type"
                          value={form.type}
                          onChange={handleChange}
                          className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                        >
                          {creditExpenseTypes.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="space-y-2 text-sm text-slate-700">
                        <span>Payment mode</span>
                        <select
                          name="paymentMode"
                          value={form.paymentMode}
                          onChange={handleChange}
                          className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                        >
                          {creditPaymentModes.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="space-y-2 text-sm text-slate-700">
                        <span>Date</span>
                        <input
                          name="date"
                          value={form.date}
                          onChange={handleChange}
                          type="date"
                          className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                        />
                      </label>
                    </div>
                    <label className="space-y-2 text-sm text-slate-700">
                      <span>Comments</span>
                      <textarea
                        name="comments"
                        value={form.comments}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Add a note about this credit expense"
                        className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                      />
                    </label>
                    <div className="flex justify-end gap-3">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setShowForm(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" variant="primary">
                        Save Credit
                      </Button>
                    </div>
                  </form>
                </div>
              </Card>
            </div>
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-3">
          <Card title="Total Credit Spend">
            <p className="text-4xl font-semibold text-slate-900">
              {formatCurrency(totalCredit)}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Total amount recorded using credit payment modes.
            </p>
          </Card>

          <Card title="Credit Accounts">
            <div className="space-y-3">
              {Object.entries(creditByMode).length === 0 ? (
                <p className="text-sm text-slate-500">
                  No credit expenses found.
                </p>
              ) : (
                Object.entries(creditByMode).map(([mode, amount]) => (
                  <div key={mode} className="flex items-center justify-between">
                    <span className="text-sm text-slate-700">{mode}</span>
                    <span className="text-sm font-semibold text-slate-900">
                      {formatCurrency(amount)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        <Card title="Credit Transactions">
          {expensesQuery.isLoading ? (
            <p>Loading credit expenses...</p>
          ) : creditExpenses.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
              No credit-based expenses have been recorded yet. Use the button
              above to add one.
            </div>
          ) : (
            <div className="space-y-4">
              {creditExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xl font-semibold text-slate-900">
                        {expense.title}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {expense.categoryName} • {expense.expenseBy}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-lg font-semibold text-slate-900">
                        {formatCurrency(expense.amount)}
                      </p>
                      <p className="text-sm text-slate-500">
                        {formatDate(expense.expenseDate)}
                      </p>
                    </div>
                  </div>
                  {expense.comments ? (
                    <p className="mt-4 text-slate-600">{expense.comments}</p>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}
