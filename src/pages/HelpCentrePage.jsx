import { useState } from "react";
import Card from "../components/Card.jsx";
import Header from "../components/Header.jsx";
import { HELP_CENTRE_SECTIONS } from "../data/helpCentre.js";
import { cn } from "../utils/helpers.js";

export default function HelpCentrePage() {
  const [openSections, setOpenSections] = useState({});
  const toggleSection = (title) => {
    setOpenSections((current) => ({ ...current, [title]: !current[title] }));
  };

  return (
    <div className="space-y-7">
      <Header title="Help Centre" desc="Operational guidance for using QueryDesk correctly and reducing duplicate queries." />

      <div className="space-y-3">
        {HELP_CENTRE_SECTIONS.map((section) => (
          <Card key={section.title} className="p-0">
            <button
              type="button"
              onClick={() => toggleSection(section.title)}
              aria-expanded={Boolean(openSections[section.title])}
              className="flex w-full items-center gap-4 rounded-[1.5rem] px-5 py-4 text-left outline-none hover:bg-slate-50 focus:ring-4 focus:ring-blue-100"
            >
              <span className="min-w-0 flex-1 text-base font-black text-slate-950">{section.title}</span>
              <span className={cn("text-lg leading-none text-slate-400 transition", openSections[section.title] ? "rotate-90" : "")}>&rsaquo;</span>
            </button>
            {openSections[section.title] && (
              <div className="space-y-2 border-t border-slate-100 px-5 pb-5 pt-4 text-sm leading-6 text-slate-600">
                {section.content.split("\n").map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
