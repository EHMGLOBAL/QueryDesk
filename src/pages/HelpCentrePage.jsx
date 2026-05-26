import Card from "../components/Card.jsx";
import Header from "../components/Header.jsx";
import { HELP_CENTRE_SECTIONS } from "../data/helpCentre.js";

export default function HelpCentrePage() {
  return (
    <div className="space-y-7">
      <Header title="Help Centre" desc="Operational guidance for using QueryDesk correctly and reducing duplicate queries." />

      <div className="grid gap-4 lg:grid-cols-2">
        {HELP_CENTRE_SECTIONS.map((section) => (
          <Card key={section.title} className="p-5">
            <section aria-labelledby={`help-${section.title.toLowerCase().replaceAll(" ", "-")}`}>
              <h2 id={`help-${section.title.toLowerCase().replaceAll(" ", "-")}`} className="text-base font-black text-slate-950">
                {section.title}
              </h2>
              <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                {section.content.split("\n").map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </section>
          </Card>
        ))}
      </div>
    </div>
  );
}
