import { useMemo, useState } from "react";
import { parseISO, format, startOfWeek, subDays } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "../contexts/AuthContext";
import { listExpenses } from "../services/expenseService";
import type { Expense } from "../types";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import * as XLSX from "xlsx";

const creditPaymentModes = ["Cred", "Credit Card"] as const;

const reportTabs = [
  { label: "All", key: "all" },
  { label: "By Month", key: "month" },
  { label: "By Week", key: "week" },
  { label: "By Paid By", key: "paidBy" },
  { label: "Custom", key: "custom" },
] as const;

type ReportTab = (typeof reportTabs)[number]["key"];

type FilterOperator = ">" | "<" | "=";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatExpenseDate(value: string) {
  return format(parseISO(value), "dd MMM yyyy");
}

function getUniqueMonths(expenses: Expense[]) {
  return Array.from(
    new Set(
      expenses.map((expense) =>
        format(parseISO(expense.expenseDate), "yyyy-MM"),
      ),
    ),
  ).sort((a, b) => b.localeCompare(a));
}

function getUniqueWeeks(expenses: Expense[]) {
  return Array.from(
    new Set(
      expenses.map((expense) =>
        startOfWeek(parseISO(expense.expenseDate), { weekStartsOn: 1 })
          .toISOString()
          .slice(0, 10),
      ),
    ),
  ).sort((a, b) => b.localeCompare(a));
}

function getUniquePayees(expenses: Expense[]) {
  return Array.from(
    new Set(expenses.map((expense) => expense.expenseBy || "Unknown")),
  ).sort();
}

function formatCurrencyForPdf(value: number) {
  return `Rs ${value.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function buildReportRows(expenses: Expense[], usePdf = false) {
  return expenses.map((expense) => [
    usePdf ? formatCurrencyForPdf(expense.amount) : formatCurrency(expense.amount),
    creditPaymentModes.includes(
      expense.paymentMode as (typeof creditPaymentModes)[number],
    )
      ? "Credit"
      : "Expense",
    expense.expenseBy,
    expense.categoryName,
    formatExpenseDate(expense.expenseDate),
  ]);
}

function exportToExcel(expenses: Expense[]) {
  const worksheet = XLSX.utils.aoa_to_sheet([
    ["Amount", "Type", "Paid By", "Category", "Date"],
    ...buildReportRows(expenses),
  ]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
  XLSX.writeFile(workbook, "expense-report.xlsx");
}

function exportToPdf(expenses: Expense[]) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  doc.setFontSize(14);
  doc.text("Expense Report", 40, 40);

  autoTable(doc, {
    startY: 60,
    head: [["Amount", "Type", "Paid By", "Category", "Date"]],
    body: buildReportRows(expenses, true),
    styles: { fontSize: 10, cellPadding: 6 },
    headStyles: { fillColor: [250, 172, 20], textColor: 0 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: 40, right: 40 },
  });

  doc.save("expense-report.pdf");
}

export default function ReportsPage() {
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState<ReportTab>("all");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedWeek, setSelectedWeek] = useState("");
  const [selectedPayer, setSelectedPayer] = useState("");
  const [customFrom, setCustomFrom] = useState(() =>
    subDays(new Date(), 29).toISOString().slice(0, 10),
  );
  const [customTo, setCustomTo] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [amountOperator, setAmountOperator] = useState<FilterOperator>(">");
  const [amountValue, setAmountValue] = useState("");
  const [paidByFilter, setPaidByFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");

  const expensesQuery = useQuery<Expense[]>({
    queryKey: ["expenses", user?.uid],
    queryFn: async () => listExpenses(user!.uid),
    enabled: !!user?.uid,
    staleTime: 1000 * 60,
  });

  const allExpenses = expensesQuery.data ?? [];
  const isLoading = expensesQuery.isLoading;

  const creditExpenses = useMemo(
    () =>
      allExpenses.filter((expense) =>
        creditPaymentModes.includes(
          expense.paymentMode as (typeof creditPaymentModes)[number],
        ),
      ),
    [allExpenses],
  );

  const monthOptions = useMemo(
    () => getUniqueMonths(allExpenses),
    [allExpenses],
  );
  const weekOptions = useMemo(() => getUniqueWeeks(allExpenses), [allExpenses]);
  const payeeOptions = useMemo(
    () => getUniquePayees(allExpenses),
    [allExpenses],
  );

  const filteredByTab = useMemo(() => {
    if (activeTab === "all") {
      return allExpenses;
    }

    if (activeTab === "month") {
      return selectedMonth
        ? allExpenses.filter(
            (expense) =>
              format(parseISO(expense.expenseDate), "yyyy-MM") ===
              selectedMonth,
          )
        : allExpenses;
    }

    if (activeTab === "week") {
      return selectedWeek
        ? allExpenses.filter((expense) => {
            const weekStart = startOfWeek(parseISO(expense.expenseDate), {
              weekStartsOn: 1,
            })
              .toISOString()
              .slice(0, 10);
            return weekStart === selectedWeek;
          })
        : allExpenses;
    }

    if (activeTab === "paidBy") {
      return selectedPayer
        ? allExpenses.filter((expense) => expense.expenseBy === selectedPayer)
        : allExpenses;
    }

    if (activeTab === "custom") {
      const start = parseISO(customFrom);
      const end = parseISO(customTo);
      return allExpenses.filter((expense) => {
        const date = parseISO(expense.expenseDate);
        return date >= start && date <= end;
      });
    }

    return allExpenses;
  }, [
    activeTab,
    allExpenses,
    creditExpenses,
    selectedMonth,
    selectedWeek,
    selectedPayer,
    customFrom,
    customTo,
  ]);

  const filteredExpenses = useMemo(() => {
    return filteredByTab.filter((expense) => {
      if (amountValue.trim()) {
        const amount = Number(amountValue);
        if (!Number.isFinite(amount)) {
          return false;
        }
        if (amountOperator === ">" && expense.amount <= amount) return false;
        if (amountOperator === "<" && expense.amount >= amount) return false;
        if (amountOperator === "=" && expense.amount !== amount) return false;
      }

      if (typeFilter.trim()) {
        const rowType = creditPaymentModes.includes(
          expense.paymentMode as (typeof creditPaymentModes)[number],
        )
          ? "Credit"
          : "Expense";
        if (!rowType.toLowerCase().includes(typeFilter.trim().toLowerCase())) {
          return false;
        }
      }

      if (paidByFilter.trim()) {
        if (
          !expense.expenseBy
            .toLowerCase()
            .includes(paidByFilter.trim().toLowerCase())
        ) {
          return false;
        }
      }

      if (categoryFilter.trim()) {
        if (
          !expense.categoryName
            .toLowerCase()
            .includes(categoryFilter.trim().toLowerCase())
        ) {
          return false;
        }
      }

      if (dateFromFilter) {
        const from = parseISO(dateFromFilter);
        const current = parseISO(expense.expenseDate);
        if (current < from) return false;
      }
      if (dateToFilter) {
        const to = parseISO(dateToFilter);
        const current = parseISO(expense.expenseDate);
        if (current > to) return false;
      }

      return true;
    });
  }, [
    filteredByTab,
    amountOperator,
    amountValue,
    typeFilter,
    paidByFilter,
    categoryFilter,
    dateFromFilter,
    dateToFilter,
  ]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-100 to-yellow-100 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-[2rem] bg-white/90 p-10 shadow-soft ring-1 ring-orange-100">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-4xl font-semibold text-slate-900">Reports</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {reportTabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    activeTab === tab.key
                      ? "bg-orange-500 text-white shadow-soft"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {activeTab === "month" ? (
              <label className="space-y-2 text-sm text-slate-700">
                <span>Month</span>
                <select
                  value={selectedMonth}
                  onChange={(event) => setSelectedMonth(event.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                >
                  <option value="">All months</option>
                  {monthOptions.map((month) => (
                    <option key={month} value={month}>
                      {format(parseISO(`${month}-01`), "MMM yyyy")}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {activeTab === "week" ? (
              <label className="space-y-2 text-sm text-slate-700">
                <span>Week start</span>
                <select
                  value={selectedWeek}
                  onChange={(event) => setSelectedWeek(event.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                >
                  <option value="">All weeks</option>
                  {weekOptions.map((week) => (
                    <option key={week} value={week}>
                      {format(parseISO(week), "dd MMM yyyy")}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {activeTab === "paidBy" ? (
              <label className="space-y-2 text-sm text-slate-700">
                <span>Payer</span>
                <select
                  value={selectedPayer}
                  onChange={(event) => setSelectedPayer(event.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                >
                  <option value="">All payers</option>
                  {payeeOptions.map((payer) => (
                    <option key={payer} value={payer}>
                      {payer}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {activeTab === "custom" ? (
              <>
                <label className="space-y-2 text-sm text-slate-700">
                  <span>From</span>
                  <input
                    type="date"
                    value={customFrom}
                    onChange={(event) => setCustomFrom(event.target.value)}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-700">
                  <span>To</span>
                  <input
                    type="date"
                    value={customTo}
                    onChange={(event) => setCustomTo(event.target.value)}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </label>
              </>
            ) : null}
          </div>
        </div>

        <Card className="rounded-[2rem] bg-white/90 p-8 shadow-soft ring-1 ring-orange-100">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">
                Expense Report
              </h2>
              <p className="text-sm text-slate-500">
                Showing {filteredExpenses.length} records.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => exportToExcel(filteredExpenses)}
              >
                Export Excel
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => exportToPdf(filteredExpenses)}
              >
                Export PDF
              </Button>
              {isLoading ? (
                <p className="text-sm text-slate-500">Loading expenses…</p>
              ) : null}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Paid By</th>
                  <th className="px-4 py-3 font-semibold">Payment Category</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                </tr>
                <tr className="bg-slate-100 text-sm text-slate-600">
                  <th className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <select
                        value={amountOperator}
                        onChange={(event) =>
                          setAmountOperator(
                            event.target.value as FilterOperator,
                          )
                        }
                        className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-slate-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                        aria-label="Amount operator"
                      >
                        <option value=">">&gt;</option>
                        <option value="<">&lt;</option>
                        <option value="=">=</option>
                      </select>
                      <input
                        type="number"
                        value={amountValue}
                        onChange={(event) => setAmountValue(event.target.value)}
                        placeholder="Amount"
                        className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-slate-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                        aria-label="Amount filter"
                      />
                    </div>
                  </th>
                  <th className="px-4 py-3">
                    <input
                      type="text"
                      value={typeFilter}
                      onChange={(event) => setTypeFilter(event.target.value)}
                      placeholder="Type"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-slate-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                      aria-label="Type filter"
                    />
                  </th>
                  <th className="px-4 py-3">
                    <input
                      type="text"
                      value={paidByFilter}
                      onChange={(event) => setPaidByFilter(event.target.value)}
                      placeholder="Paid By"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-slate-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                      aria-label="Paid by filter"
                    />
                  </th>
                  <th className="px-4 py-3">
                    <input
                      type="text"
                      value={categoryFilter}
                      onChange={(event) =>
                        setCategoryFilter(event.target.value)
                      }
                      placeholder="Category"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-slate-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                      aria-label="Category filter"
                    />
                  </th>
                  <th className="px-4 py-3">
                    <div className="grid gap-2">
                      <input
                        type="date"
                        value={dateFromFilter}
                        onChange={(event) =>
                          setDateFromFilter(event.target.value)
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-slate-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                        aria-label="Date from filter"
                      />
                      <input
                        type="date"
                        value={dateToFilter}
                        onChange={(event) =>
                          setDateToFilter(event.target.value)
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-slate-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                        aria-label="Date to filter"
                      />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-6 text-center text-slate-500"
                    >
                      No expenses match the current report and filters.
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((expense) => (
                    <tr key={expense.id}>
                      <td className="px-4 py-4 font-semibold text-slate-900">
                        {formatCurrency(expense.amount)}
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        {creditPaymentModes.includes(
                          expense.paymentMode as (typeof creditPaymentModes)[number],
                        )
                          ? "Credit"
                          : "Expense"}
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        {expense.expenseBy}
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        {expense.categoryName}
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        {formatExpenseDate(expense.expenseDate)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </main>
  );
}
