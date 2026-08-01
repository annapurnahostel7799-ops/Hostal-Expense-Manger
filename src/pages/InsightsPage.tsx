import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { listExpenses } from "../services/expenseService";
import { useAuthContext } from "../contexts/AuthContext";
import { Card } from "../components/ui/Card";
import { formatCurrency, formatDate } from "../utils/format";
import type { Expense } from "../types";

const creditPaymentModes = ["Cred", "Credit Card"] as const;

function isCreditExpense(expense: Expense) {
  return creditPaymentModes.includes(
    expense.paymentMode as (typeof creditPaymentModes)[number],
  );
}

function getMonthLabel(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function InsightsPage() {
  const { user } = useAuthContext();

  const expensesQuery = useQuery<Expense[]>({
    queryKey: ["expenses", user?.uid],
    queryFn: async () => listExpenses(user!.uid),
    enabled: Boolean(user?.uid),
    staleTime: 1000 * 60,
  });

  const expenses = expensesQuery.data ?? [];
  const isLoading = expensesQuery.isLoading;

  const insights = useMemo(() => {
    const creditTotal = expenses
      .filter(isCreditExpense)
      .reduce((sum, expense) => sum + Number(expense.amount), 0);
    const expenseTotal = expenses
      .filter((expense) => !isCreditExpense(expense))
      .reduce((sum, expense) => sum + Number(expense.amount), 0);
    const categoryTotals = expenses.reduce<Record<string, number>>(
      (acc, expense) => {
        acc[expense.categoryName] =
          (acc[expense.categoryName] ?? 0) + Number(expense.amount);
        return acc;
      },
      {},
    );
    const payerTotals = expenses.reduce<Record<string, number>>(
      (acc, expense) => {
        acc[expense.expenseBy] =
          (acc[expense.expenseBy] ?? 0) + Number(expense.amount);
        return acc;
      },
      {},
    );
    const monthTotals = expenses.reduce<
      Record<string, { total: number; credit: number }>
    >((acc, expense) => {
      const month = getMonthLabel(expense.expenseDate);
      acc[month] = acc[month] ?? { total: 0, credit: 0 };
      acc[month].total += Number(expense.amount);
      if (isCreditExpense(expense)) {
        acc[month].credit += Number(expense.amount);
      }
      return acc;
    }, {});

    return {
      totalCount: expenses.length,
      totalAmount: expenses.reduce(
        (sum, expense) => sum + Number(expense.amount),
        0,
      ),
      creditTotal,
      expenseTotal,
      topCategories: Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3),
      topPayers: Object.entries(payerTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3),
      monthlyTrend: Object.entries(monthTotals)
        .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
        .slice(-6),
    };
  }, [expenses]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-fuchsia-50 via-pink-100 to-rose-100 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-[2rem] bg-white/90 p-10 shadow-soft ring-1 ring-fuchsia-100">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-4xl font-semibold text-slate-900">
                Insights
              </h1>
              <p className="mt-4 text-slate-600 max-w-2xl">
                Visualize your expenses and credit activity with quick
                summaries, top categories, and recent monthly trends.
              </p>
            </div>
            <div className="rounded-3xl bg-fuchsia-50 p-5 text-right shadow-sm">
              <p className="text-sm uppercase tracking-[0.3em] text-fuchsia-500">
                Total transactions
              </p>
              <p className="mt-3 text-4xl font-semibold text-slate-900">
                {insights.totalCount}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-4">
          <Card title="Total Spend">
            <p className="text-4xl font-semibold text-slate-900">
              {formatCurrency(insights.totalAmount)}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Total spend across all records.
            </p>
          </Card>
          <Card title="Credit Spend">
            <p className="text-4xl font-semibold text-rose-600">
              {formatCurrency(insights.creditTotal)}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Total spend recorded as credit.
            </p>
          </Card>
          <Card title="Cash / Other Spend">
            <p className="text-4xl font-semibold text-emerald-600">
              {formatCurrency(insights.expenseTotal)}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Total spend outside credit payment modes.
            </p>
          </Card>
          <Card title="Credit Ratio">
            <p className="text-4xl font-semibold text-slate-900">
              {insights.totalAmount > 0
                ? `${Math.round((insights.creditTotal / insights.totalAmount) * 100)}%`
                : "0%"}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Share of total spend that is credit-based.
            </p>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <Card title="Top Categories">
            <div className="space-y-4">
              {insights.topCategories.map(([category, amount]) => (
                <div
                  key={category}
                  className="flex items-center justify-between gap-4"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{category}</p>
                    <p className="text-sm text-slate-500">
                      {((amount / insights.totalAmount) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <p className="font-semibold text-slate-900">
                    {formatCurrency(amount)}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Top Payees">
            <div className="space-y-4">
              {insights.topPayers.map(([payee, amount]) => (
                <div
                  key={payee}
                  className="flex items-center justify-between gap-4"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{payee}</p>
                    <p className="text-sm text-slate-500">Total paid</p>
                  </div>
                  <p className="font-semibold text-slate-900">
                    {formatCurrency(amount)}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Recent Monthly Trend">
            <div className="space-y-3">
              {insights.monthlyTrend.length === 0 ? (
                <p className="text-sm text-slate-500">No monthly data yet.</p>
              ) : (
                insights.monthlyTrend.map(([month, data]) => (
                  <div key={month} className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <span>{month}</span>
                      <span>{formatCurrency(data.total)}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-fuchsia-500"
                        style={{
                          width: `${Math.min(100, (data.total / Math.max(...insights.monthlyTrend.map((t) => t[1].total))) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        <Card title="Latest Credit Activities">
          {isLoading ? (
            <p>Loading insight data...</p>
          ) : expenses.length === 0 ? (
            <p className="text-sm text-slate-500">No expense records yet.</p>
          ) : (
            <div className="space-y-4">
              {expenses
                .slice()
                .sort((a, b) => b.expenseDate.localeCompare(a.expenseDate))
                .slice(0, 4)
                .map((expense) => (
                  <div
                    key={expense.id}
                    className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {expense.title}
                        </p>
                        <p className="text-sm text-slate-500">
                          {expense.categoryName} • {expense.expenseBy}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-slate-900">
                          {formatCurrency(expense.amount)}
                        </p>
                        <p className="text-sm text-slate-500">
                          {isCreditExpense(expense) ? "Credit" : "Expense"}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-slate-500">
                      {formatDate(expense.expenseDate)}
                    </p>
                  </div>
                ))}
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}
