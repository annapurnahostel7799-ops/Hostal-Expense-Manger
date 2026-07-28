import { NavLink, Route, Routes } from "react-router-dom";
import {
  BarChart3,
  CreditCard,
  DollarSign,
  Home,
  Sparkles,
} from "lucide-react";
import HomePage from "./pages/HomePage";
import ExpensesPage from "./pages/ExpensesPage";
import CreditsPage from "./pages/CreditsPage";
import ReportsPage from "./pages/ReportsPage";
import InsightsPage from "./pages/InsightsPage";

const tabs = [
  {
    label: "Home",
    to: "/",
    color: "from-rose-400 via-fuchsia-400 to-violet-500",
    icon: Home,
  },
  {
    label: "Expenses",
    to: "/expenses",
    color: "from-cyan-400 via-sky-500 to-indigo-500",
    icon: DollarSign,
  },
  {
    label: "Credits",
    to: "/credits",
    color: "from-emerald-400 via-lime-400 to-amber-400",
    icon: CreditCard,
  },
  {
    label: "Reports",
    to: "/reports",
    color: "from-orange-400 via-amber-500 to-yellow-400",
    icon: BarChart3,
  },
  {
    label: "Insights",
    to: "/insights",
    color: "from-fuchsia-400 via-pink-400 to-rose-400",
    icon: Sparkles,
  },
];

function App() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-rose-50 via-amber-50 to-sky-100 text-slate-900">
      <div className="pb-28">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/credits" element={<CreditsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-3 py-3 backdrop-blur-lg shadow-[0_-10px_30px_rgba(15,23,42,0.08)]">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={({ isActive }) =>
                  `flex-1 rounded-3xl px-3 py-3 text-center text-xs font-semibold transition ${
                    isActive
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-soft`
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`
                }
              >
                <div className="flex flex-col items-center gap-1">
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </div>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default App;
