import { cn } from "../utils/helpers.js";

function HelpIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-slate-400" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M9.8 9.2a2.5 2.5 0 0 1 4.8 1.1c0 1.8-2.1 2.2-2.1 3.6" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      <path d="M12 17h.01" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" />
    </svg>
  );
}

export default function SidebarHelpCentre({ active = false, onOpen }) {
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
          <HelpIcon />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold text-slate-700">Help Centre</span>
          <span className="mt-0.5 block text-xs leading-5 text-slate-500">Guidance for using QueryDesk.</span>
        </span>
        <span className="mt-1 text-lg leading-none text-slate-400">&rsaquo;</span>
      </button>
    </section>
  );
}
