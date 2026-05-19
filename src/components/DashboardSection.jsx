import { cn } from "../utils/helpers.js";
import DashboardCaseCard from "./DashboardCaseCard.jsx";

export default function DashboardSection({ id, title, desc, count, toneName, rows, open, refDate, emptyText }) {
  const accent =
    {
      red: "border-t-rose-500",
      amber: "border-t-amber-500",
      blue: "border-t-blue-500",
      green: "border-t-emerald-500",
      slate: "border-t-slate-400",
    }[toneName] || "border-t-slate-400";
  const titleTone =
    {
      red: "text-rose-700 bg-rose-50 ring-rose-100",
      amber: "text-amber-700 bg-amber-50 ring-amber-100",
      blue: "text-blue-700 bg-blue-50 ring-blue-100",
      green: "text-emerald-700 bg-emerald-50 ring-emerald-100",
      slate: "text-slate-700 bg-slate-50 ring-slate-200",
    }[toneName] || "text-slate-700 bg-slate-50 ring-slate-200";

  return (
    <section id={id} className={cn("scroll-mt-6 rounded-3xl border border-t-4 border-slate-200 bg-white p-6 shadow-sm", accent)}>
      <div className="mb-5 flex flex-col gap-3 border-b border-slate-100 pb-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-black tracking-tight text-slate-950">{title}</h2>
            <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-black ring-1", titleTone)}>{count} cases</span>
          </div>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-500">{desc}</p>
        </div>
      </div>
      <div className="space-y-3">
        {rows.length ? (
          rows.map((query) => <DashboardCaseCard key={query.id} q={query} open={open} refDate={refDate} sectionTone={toneName} />)
        ) : (
          <p className="rounded-2xl bg-slate-50 p-5 text-sm font-semibold text-slate-500 ring-1 ring-slate-200">{emptyText}</p>
        )}
      </div>
    </section>
  );
}
