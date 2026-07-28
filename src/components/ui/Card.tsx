import type { ReactNode } from "react";
import { clsx } from "clsx";

export const Card = ({
  title,
  children,
  className,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) => (
  <section
    className={clsx(
      "rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-soft",
      className,
    )}
  >
    {title ? (
      <h2 className="text-lg font-semibold text-slate-900 mb-4">{title}</h2>
    ) : null}
    {children}
  </section>
);
