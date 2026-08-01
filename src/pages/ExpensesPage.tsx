import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useState } from "react";
import { Edit3, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "../contexts/AuthContext";
import {
  createExpense,
  deleteExpense,
  listExpenses,
  updateExpense,
} from "../services/expenseService";
import type { Expense } from "../types";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

const expenseTypes = [
  "Food",
  "Transport",
  "Rent",
  "Utilities",
  "Subscriptions",
  "Other",
];
const paymentModes = [
  "PhonePe",
  "Paytm",
  "GPay",
  "Cred",
  "Credit Card",
  "cash",
  "Other UPI",
];
const paidByOptions = ["Arjun", "Babu", "Raja"];
const paidByEmailMap: Record<string, string> = {
  "rajasekhar.paati@gmail.com": "Raja",
  "arjun.vendra@gmail.com": "Arjun",
  "ashok.babu208@gmail.com": "Babu",
};

type ExpenseEntry = {
  id: string;
  amount: string;
  type: string;
  paidBy: string;
  paymentMode: string;
  date: string;
  comments: string;
};

function formatDateLabel(value: string) {
  return value
    ? new Date(value).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "-";
}

export default function ExpensesPage() {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const getDefaultPaidBy = (email: string | null | undefined) =>
    email
      ? (paidByEmailMap[email.toLowerCase()] ?? paidByOptions[0])
      : paidByOptions[0];
  const [form, setForm] = useState<ExpenseEntry>({
    id: "",
    amount: "",
    type: expenseTypes[0],
    paidBy: getDefaultPaidBy(user?.email),
    paymentMode: paymentModes[0],
    date: new Date().toISOString().slice(0, 10),
    comments: "",
  });
  const expensesQuery = useQuery<Expense[]>({
    queryKey: ["expenses", user?.uid],
    queryFn: async () => listExpenses(user!.uid),
    enabled: !!user?.uid,
    staleTime: 1000 * 60,
  });

  const createMutation = useMutation({
    mutationFn: (payload: Parameters<typeof createExpense>[0]) =>
      createExpense(payload),
    onSuccess: () => {
      if (user?.uid) {
        queryClient.invalidateQueries({ queryKey: ["expenses", user.uid] });
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Expense> }) =>
      updateExpense(id, data),
    onSuccess: () => {
      if (user?.uid) {
        queryClient.invalidateQueries({ queryKey: ["expenses", user.uid] });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteExpense(id),
    onSuccess: () => {
      if (user?.uid) {
        queryClient.invalidateQueries({ queryKey: ["expenses", user.uid] });
      }
    },
  });

  useEffect(() => {
    document.body.style.overflow = showForm ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showForm]);

  useEffect(() => {
    if (!user?.email) {
      return;
    }

    setForm((current) => ({
      ...current,
      paidBy: getDefaultPaidBy(user.email),
    }));
  }, [user?.email]);

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleEdit = (entry: Expense) => {
    setForm({
      id: entry.id,
      amount: entry.amount.toString(),
      type: entry.categoryName,
      paidBy: entry.expenseBy,
      paymentMode: entry.paymentMode,
      date: entry.expenseDate,
      comments: entry.comments ?? "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      console.error("Failed to delete expense:", error);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) {
      return;
    }

    if (user?.uid) {
      try {
        const payload: Parameters<typeof createExpense>[0] = {
          title: form.type,
          amount: Number(form.amount),
          categoryId: form.type,
          categoryName: form.type,
          paymentMode: form.paymentMode as any,
          expenseBy: form.paidBy,
          expenseDate: form.date,
          status: "pending",
          createdBy: user.uid,
        };

        if (form.comments.trim()) {
          payload.comments = form.comments.trim();
        }

        if (form.id) {
          await updateMutation.mutateAsync({
            id: form.id,
            data: payload,
          });
        } else {
          await createMutation.mutateAsync(payload);
        }
      } catch (error) {
        console.error("Failed to save expense to Firestore:", error);
      }
    }

    setShowForm(false);
    setForm({
      id: "",
      amount: "",
      type: expenseTypes[0],
      paidBy: getDefaultPaidBy(user?.email),
      paymentMode: paymentModes[0],
      date: new Date().toISOString().slice(0, 10),
      comments: "",
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-cyan-50 via-sky-100 to-indigo-100 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-[2rem] bg-white/90 p-10 shadow-soft ring-1 ring-cyan-100">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-4xl font-semibold text-slate-900">
                Expenses
              </h1>
            </div>
            <Button
              type="button"
              variant="primary"
              onClick={() => setShowForm(true)}
            >
              Add Expense
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
                    <div className="grid grid-cols-2 gap-4">
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
                        <span>Expense type</span>
                        <select
                          name="type"
                          value={form.type}
                          onChange={handleChange}
                          className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                        >
                          {expenseTypes.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="space-y-2 text-sm text-slate-700">
                        <span>Paid by</span>
                        <select
                          name="paidBy"
                          value={form.paidBy}
                          onChange={handleChange}
                          className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                        >
                          {paidByOptions.map((option) => (
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
                          {paymentModes.map((option) => (
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
                        placeholder="Add a note about this expense"
                        className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                      />
                    </label>

                    <div className="flex justify-end">
                      <Button type="submit" variant="primary">
                        Save Expense
                      </Button>
                    </div>
                  </form>
                </div>
              </Card>
            </div>
          </div>
        ) : null}

        <Card title="Expense Entries" className="max-w-5xl">
          {(expensesQuery.data ?? []).length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
              No expenses added yet. Use the button above to add a new expense.
            </div>
          ) : (
            <div className="space-y-4">
              {(expensesQuery.data ?? []).map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xl font-semibold text-slate-900">
                        ₹{Number(entry.amount).toFixed(2)}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {entry.title} • {entry.expenseBy} • {entry.paymentMode}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="rounded-full bg-cyan-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
                        {formatDateLabel(entry.expenseDate)}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleEdit(entry)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                        aria-label="Edit expense"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(entry.id)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                        aria-label="Delete expense"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {entry.comments ? (
                    <p className="mt-4 text-slate-600">{entry.comments}</p>
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
