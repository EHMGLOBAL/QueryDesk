import { cn } from "../utils/helpers.js";

function RulesIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-slate-400" aria-hidden="true">
      <path d="M7 4h10a2 2 0 0 1 2 2v14l-3-2-3 2-3-2-3 2V6a2 2 0 0 1 2-2Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" />
      <path d="M9 8h6M9 12h6" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

export default function SidebarRulesCard({ active = false, onOpen }) {
  return (
    <section className="rounded-3xl bg-slate-50/80 text-slate-700 ring-1 ring-slate-200">
      <button
        type="button"
        onClick={onOpen}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex w-full items-start gap-3 rounded-3xl px-4 py-3 text-left outline-none hover:bg-slate-100/70 focus:ring-4 focus:ring-blue-100",
          active && "bg-blue-50 text-blue-800 ring-1 ring-blue-100"
        )}
      >
        <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-2xl bg-white ring-1 ring-slate-200">
          <RulesIcon />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold text-slate-700">Rules</span>
          <span className="mt-0.5 block text-xs leading-5 text-slate-500">Operational rules and permissions.</span>
        </span>
        <span className="mt-1 text-lg leading-none text-slate-400">&rsaquo;</span>
      </button>
    </section>
  );
}
