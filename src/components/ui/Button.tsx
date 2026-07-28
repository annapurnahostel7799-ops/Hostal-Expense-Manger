import type { ButtonHTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";

export const Button = ({
  children,
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?:
    | "primary"
    | "secondary"
    | "success"
    | "danger"
    | "warning"
    | "info"
    | "light"
    | "dark"
    | "outline"
    | "ghost";
  children: ReactNode;
}) => {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition duration-150 ease-in-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

  const variants = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline-blue-300",
    secondary:
      "bg-slate-500 text-white hover:bg-slate-600 focus-visible:outline-slate-300",
    success:
      "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:outline-emerald-300",
    danger:
      "bg-rose-600 text-white hover:bg-rose-700 focus-visible:outline-rose-300",
    warning:
      "bg-amber-500 text-slate-900 hover:bg-amber-600 focus-visible:outline-amber-300",
    info: "bg-cyan-500 text-white hover:bg-cyan-600 focus-visible:outline-cyan-300",
    light:
      "bg-slate-100 text-slate-900 hover:bg-slate-200 focus-visible:outline-slate-300",
    dark: "bg-slate-900 text-white hover:bg-slate-800 focus-visible:outline-slate-400",
    outline:
      "border border-slate-300 bg-transparent text-slate-900 hover:bg-slate-50 focus-visible:outline-slate-300",
    ghost:
      "bg-transparent text-slate-900 hover:bg-slate-100 focus-visible:outline-slate-300",
  };

  return (
    <button className={clsx(base, variants[variant], className)} {...props}>
      {children}
    </button>
  );
};
