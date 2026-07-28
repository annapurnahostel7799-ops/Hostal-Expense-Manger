import { NavLink, useNavigate } from "react-router-dom";
import {
  LogOut,
  Settings2,
  Table,
  LayoutDashboard,
  Layers,
  Home,
  Wallet,
  BarChart3,
  Sparkles,
} from "lucide-react";
import { useAuthContext } from "../contexts/AuthContext";
import { logoutUser } from "../services/authService";
import { Button } from "./ui/Button";

const sidebarItems = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard },
  { label: "Expenses", to: "/expenses", icon: Table },
  { label: "Categories", to: "/categories", icon: Layers },
  { label: "Settings", to: "/settings", icon: Settings2 },
];

const bottomTabs = [
  { label: "Home", to: "/", icon: Home },
  { label: "Expenses", to: "/expenses", icon: Wallet },
  { label: "Reports", to: "/categories", icon: BarChart3 },
  { label: "Insights", to: "/settings", icon: Sparkles },
];

import type { ReactNode } from "react";

export const Shell = ({ children }: { children: ReactNode }) => {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-rose-50 via-amber-50 to-sky-100 text-slate-900">
      <div className="lg:grid lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:border-r lg:border-slate-200/70 lg:bg-white lg:p-6 lg:shadow-sm">
          <div className="mb-10">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
              Hostel Expense
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">
              Manager
            </h1>
          </div>
          <nav className="space-y-3">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-3xl px-4 py-3 text-sm transition ${
                      isActive
                        ? "bg-sky-100 text-slate-900 shadow-sm"
                        : "text-slate-600 hover:bg-slate-100"
                    }`
                  }
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
          <div className="mt-auto space-y-4 pt-6">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 shadow-sm">
              <p className="text-slate-900 font-medium">Signed in as</p>
              <p className="mt-2 truncate">{user?.email ?? "Guest"}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-slate-700"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </Button>
          </div>
        </aside>

        <div className="space-y-6 p-4 pb-32 lg:p-6">{children}</div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-2 py-2 backdrop-blur-lg shadow-[0_-10px_30px_rgba(15,23,42,0.08)] lg:hidden">
        <div className="flex w-full items-center justify-between gap-2">
          {bottomTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={({ isActive }) =>
                  `flex min-w-0 flex-1 flex-col items-center justify-center rounded-3xl px-2 py-2 text-[11px] font-semibold transition ${
                    isActive
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-500 hover:bg-slate-50"
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  );
};
