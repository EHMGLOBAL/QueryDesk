import { useState } from "react";
import { cn } from "../utils/helpers.js";

const HELP_SECTIONS = [
  {
    title: "Creating a query",
    content: "Use Raise New Query when an applicant issue has not already been reported. Complete all required fields before submitting.",
  },
  {
    title: "Finding existing queries",
    content: "Use Find Query before creating a new query to avoid duplicate cases and review previous updates.",
  },
  {
    title: "Parent and child queries",
    content: "If multiple contacts relate to the same issue, link them instead of creating duplicate tickets.",
  },
  {
    title: "Priority work queue",
    content: "The priority work queue highlights cases requiring attention first based on urgency, SLA risk, travel date, and unresolved activity.",
  },
  {
    title: "Understanding statuses",
    content:
      "Open: active query requiring action. Urgent: high-priority case needing immediate attention. SLA Risk: query approaching or exceeding expected response time. Unresolved: blocked or pending issue still requiring operational action. Resolved / Deactivated: completed or closed queries.",
  },
  {
    title: "Resolved and deactivated tickets",
    content: "Only Coordinators/Admins can resolve tickets. Supervisors can reopen resolved tickets within 3 days by adding a comment.",
  },
  {
    title: "Need more help?",
    content: "Contact a Coordinator/Admin if you are unsure how to handle a case.",
  },
];

function HelpIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-slate-400" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M9.8 9.2a2.5 2.5 0 0 1 4.8 1.1c0 1.8-2.1 2.2-2.1 3.6" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      <path d="M12 17h.01" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" />
    </svg>
  );
}

export default function SidebarHelpCentre() {
  const [expanded, setExpanded] = useState(false);
  const [openSections, setOpenSections] = useState({});

  const toggleSection = (title) => {
    setOpenSections((current) => ({ ...current, [title]: !current[title] }));
  };

  return (
    <section className="rounded-3xl bg-slate-50/80 text-slate-700 ring-1 ring-slate-200">
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        aria-expanded={expanded}
        className="flex w-full items-start gap-3 rounded-3xl px-4 py-3 text-left hover:bg-slate-100/70"
      >
        <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-2xl bg-white ring-1 ring-slate-200">
          <HelpIcon />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold text-slate-700">Help Centre</span>
          <span className="mt-0.5 block text-xs leading-5 text-slate-500">Quick guidance for using QueryDesk.</span>
        </span>
        <span className={cn("mt-1 text-sm text-slate-400", expanded && "rotate-180")}>v</span>
      </button>

      {expanded && (
        <div className="max-h-[42vh] space-y-1 overflow-y-auto border-t border-slate-200 px-3 py-3">
          {HELP_SECTIONS.map((section) => {
            const sectionOpen = Boolean(openSections[section.title]);

            return (
              <div key={section.title} className="rounded-2xl bg-white/70 ring-1 ring-slate-200/70">
                <button
                  type="button"
                  onClick={() => toggleSection(section.title)}
                  aria-expanded={sectionOpen}
                  className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-left text-xs font-bold text-slate-600 hover:bg-white"
                >
                  <span className="min-w-0 flex-1">{section.title}</span>
                  <span className={cn("text-slate-400", sectionOpen && "rotate-180")}>v</span>
                </button>
                {sectionOpen && <p className="px-3 pb-3 text-xs leading-5 text-slate-500">{section.content}</p>}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
