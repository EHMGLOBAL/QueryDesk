import { fmtDate } from "../utils/date.js";
import { cn } from "../utils/helpers.js";
import { getEcimsStatus, getTicketStatus, lastActivity, sla, statusTone, urgency } from "../utils/queryRules.js";
import Badge from "./Badge.jsx";

export default function DashboardCaseCard({ q, open, refDate, sectionTone = "slate", linkedCount = 0 }) {
  const [urgencyLabel, urgencyTone, days] = urgency(q, refDate);
  const [slaLabel, slaTone, elapsed, target] = sla(q, refDate);
  const ticketStatus = getTicketStatus(q, refDate);
  const ecimsStatus = getEcimsStatus(q);
  const activity = lastActivity(q);
  const isChild = Boolean(q.parentId);
  const relationshipTone = isChild ? "purple" : "blue";
  const relationshipLabel = isChild ? "Child query" : "Parent query";
  const accent =
    {
      red: "border-l-rose-500 hover:border-rose-300",
      amber: "border-l-amber-500 hover:border-amber-300",
      blue: "border-l-blue-500 hover:border-blue-300",
      green: "border-l-emerald-500 hover:border-emerald-300",
      slate: "border-l-slate-400 hover:border-slate-300",
    }[sectionTone] || "border-l-slate-400 hover:border-slate-300";

  const facts = [
    ["Applicant", `${q.firstName} ${q.lastName}`],
    ["DOB", fmtDate(q.dateOfBirth)],
    ["Email", q.applicantEmail],
    ["Phone", q.applicantPhone],
    ["ECIMS status", ecimsStatus],
    ["Query origin", q.queryOrigin],
    ["Service", q.serviceType],
    ["Travel", days === null ? "Not provided" : `${fmtDate(q.travelDate)} (${days} days)`],
    ["SLA", `${slaLabel} - ${elapsed}/${target} business days`],
    ["Owner", q.ownerName],
    ["Original support agent", q.originalSupportAgentName || q.ownerName],
    ["Last commenter", activity.who],
    ["Last updated", `${fmtDate(activity.when)} by ${activity.who}`],
    ["Application type", q.applicationType],
    ["Group reference", q.groupReferenceNumber || "Not applicable"],
  ];

  return (
    <button
      onClick={() => open(q)}
      className={cn(
        "w-full rounded-2xl border border-l-4 border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
        accent,
        isChild && "ml-3 w-[calc(100%-0.75rem)] bg-slate-50/70"
      )}
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="break-all text-base font-black text-slate-950">{q.applicationNumber || "No reference"}</h3>
            <Badge t={urgencyTone}>{urgencyLabel}</Badge>
            <Badge t={slaTone}>{slaLabel}</Badge>
            <Badge t={statusTone(ticketStatus)}>{ticketStatus}</Badge>
            <Badge t={relationshipTone}>{relationshipLabel}</Badge>
            {!isChild && linkedCount > 0 && <Badge>{linkedCount + 1} linked</Badge>}
          </div>
          <p className="mt-2 text-sm font-bold text-slate-800">{q.queryType}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{q.queryDetails}</p>
        </div>
        <div className="shrink-0 rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-500 ring-1 ring-slate-200">
          Open full case
        </div>
      </div>

      <div className="mt-5 grid gap-x-6 gap-y-3 border-t border-slate-100 pt-4 md:grid-cols-2 xl:grid-cols-4">
        {facts.map(([label, value]) => (
          <div key={label} className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">{label}</p>
            <p className="mt-1 truncate text-sm font-semibold text-slate-700" title={value}>
              {value || "Not provided"}
            </p>
          </div>
        ))}
      </div>

      {q.attachments?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          {q.attachments.map((attachment) => (
            <Badge key={attachment.id || attachment.name || attachment}>{attachment.name || attachment}</Badge>
          ))}
        </div>
      )}
    </button>
  );
}
