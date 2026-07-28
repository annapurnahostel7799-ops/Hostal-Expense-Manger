import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, CalendarDays, Clock3, TrendingUp } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { listExpenses } from "../services/expenseService";
import { useAuthContext } from "../contexts/AuthContext";
import { formatCurrency, formatDate } from "../utils/format";
import type { Expense } from "../types";

const summaryItems = [
  { title: "Total Expenses", value: "₹12,450" },
  { title: "This Month", value: "₹4,780" },
  { title: "Today", value: "₹620" },
  { title: "Weekly Avg", value: "₹680" },
];

export default function DashboardPage() {
  const { user } = useAuthContext();
  const expensesQuery = useQuery<Expense[]>({
    queryKey: ["expenses", user?.uid],
    queryFn: async () => listExpenses(user!.uid),
    enabled: Boolean(user),
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50 to-sky-100 px-4 py-8 sm:px-6 lg:px-10">
      <div className="grid gap-6 md:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <Card title="Dashboard Overview">
            <div className="grid gap-4 sm:grid-cols-2">
              {summaryItems.map((item) => (
                <div
                  key={item.title}
                  className="rounded-3xl border border-amber-200 bg-rose-50 p-5 shadow-soft"
                >
                  <p className="text-sm uppercase tracking-[0.3em] text-amber-600">
                    {item.title}
                  </p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </Card>
          <Card title="Recent Expenses">
            {expensesQuery.isLoading ? (
              <p>Loading expenses...</p>
            ) : (
              <div className="space-y-4">
                {(expensesQuery.data ?? []).slice(0, 4).map((expense) => (
                  <div
                    key={expense.id}
                    className="rounded-3xl border border-amber-200 bg-white/90 p-4 shadow-soft"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {expense.title}
                        </p>
                        <p className="text-sm text-slate-500">
                          {expense.categoryName} •{" "}
                          {formatDate(expense.expenseDate)}
                        </p>
                      </div>
                      <p className="text-lg font-semibold text-emerald-600">
                        {formatCurrency(expense.amount)}
                      </p>
                    </div>
                  </div>
                ))}
                <Button type="button" variant="secondary">
                  View all expenses
                </Button>
              </div>
            )}
          </Card>
        </div>
        <div className="space-y-6">
          <Card title="Charts & Analytics">
            <div className="grid gap-4">
              <div className="rounded-3xl border border-amber-200 bg-white/90 p-5 shadow-soft">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm uppercase tracking-[0.3em] text-amber-600">
                    Monthly Trend
                  </p>
                  <ArrowUpRight className="h-4 w-4 text-sky-500" />
                </div>
                <div className="h-48 rounded-3xl bg-sky-100" />
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-soft">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm uppercase tracking-[0.3em] text-amber-600">
                    Top Categories
                  </p>
                  <CalendarDays className="h-4 w-4 text-violet-500" />
                </div>
                <div className="h-48 rounded-3xl bg-rose-100" />
              </div>
            </div>
          </Card>
          <Card title="Quick Actions">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  icon: <TrendingUp className="h-5 w-5 text-sky-500" />,
                  label: "View Reports",
                },
                {
                  icon: <Clock3 className="h-5 w-5 text-emerald-500" />,
                  label: "Add Expense",
                },
              ].map((action) => (
                <button
                  key={action.label}
                  className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white/90 px-5 py-4 text-left text-slate-900 transition hover:bg-slate-50"
                >
                  {action.icon}
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
