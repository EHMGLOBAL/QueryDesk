import { cn } from "../utils/helpers.js";
import DashboardIcon from "./DashboardIcon.jsx";

export default function DashboardMetric({ title, value, note, t = "blue", icon = "clipboard", active, onClick }) {
  const cfg =
    {
      blue: {
        border: "border-blue-100",
        accent: "bg-blue-500",
        iconBg: "bg-blue-50",
        pill: "bg-blue-50 text-blue-700 ring-blue-100",
        hover: "hover:border-blue-200",
      },
      amber: {
        border: "border-orange-100",
        accent: "bg-orange-500",
        iconBg: "bg-orange-50",
        pill: "bg-orange-50 text-orange-700 ring-orange-100",
        hover: "hover:border-orange-200",
      },
      green: {
        border: "border-emerald-100",
        accent: "bg-emerald-500",
        iconBg: "bg-emerald-50",
        pill: "bg-emerald-50 text-emerald-700 ring-emerald-100",
        hover: "hover:border-emerald-200",
      },
      purple: {
        border: "border-violet-100",
        accent: "bg-violet-600",
        iconBg: "bg-violet-50",
        pill: "bg-violet-50 text-violet-700 ring-violet-100",
        hover: "hover:border-violet-200",
      },
      red: {
        border: "border-rose-100",
        accent: "bg-rose-500",
        iconBg: "bg-rose-50",
        pill: "bg-rose-50 text-rose-700 ring-rose-100",
        hover: "hover:border-rose-200",
      },
      slate: {
        border: "border-slate-200",
        accent: "bg-slate-400",
        iconBg: "bg-slate-50",
        pill: "bg-slate-50 text-slate-700 ring-slate-200",
        hover: "hover:border-slate-300",
      },
    }[t] || {
      border: "border-slate-200",
      accent: "bg-slate-400",
      iconBg: "bg-slate-50",
      pill: "bg-slate-50 text-slate-700 ring-slate-200",
      hover: "hover:border-slate-300",
    };

  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative w-full overflow-hidden rounded-[1.35rem] border bg-white px-5 py-6 text-left shadow-[0_10px_26px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(15,23,42,0.08)] focus:outline-none focus:ring-4 focus:ring-blue-100",
        cfg.border,
        cfg.hover,
        active && "ring-2 ring-blue-100"
      )}
    >
      <div className={cn("absolute inset-x-0 top-0 h-1", cfg.accent)} />
      <div className="flex min-h-[142px] flex-col gap-5">
        <div className="flex justify-center">
          <span className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ring-1", cfg.pill)}>
            <span className={cn("h-2 w-2 rounded-full", cfg.accent)} />
            {note}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className={cn("grid h-14 w-14 shrink-0 place-items-center rounded-2xl", cfg.iconBg)}>
            <DashboardIcon type={icon} colour={t} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-base font-medium leading-tight text-slate-900">{title}</p>
            <p className="mt-2 text-4xl font-normal leading-none tracking-tight text-slate-950">{value}</p>
          </div>
          <span className="text-3xl font-light leading-none text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-600">
            &rsaquo;
          </span>
        </div>
      </div>
    </button>
  );
}
