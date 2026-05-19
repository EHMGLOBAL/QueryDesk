import { fmtDate } from "../utils/date.js";
import { cn } from "../utils/helpers.js";
import { getEcimsStatus, getTicketStatus, lastActivity, sla, statusTone, urgency } from "../utils/queryRules.js";
import Badge from "./Badge.jsx";
import Mini from "./Mini.jsx";

export default function QueryCard({ q, open, refDate, compact = false }) {
  const [urgencyLabel, urgencyTone] = urgency(q, refDate);
  const [slaLabel, slaTone] = sla(q, refDate);
  const ticketStatus = getTicketStatus(q, refDate);
  const activity = lastActivity(q);

  return (
    <button
      onClick={() => open(q)}
      className={cn(
        "group w-full overflow-hidden rounded-[1.3rem] bg-white text-left shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-lg",
        compact ? "p-4" : "p-5"
      )}
    >
      <div className={cn("grid gap-4", compact ? "lg:grid-cols-[1fr_220px]" : "lg:grid-cols-[1fr_300px]")}>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="break-all font-bold text-slate-950">{q.applicationNumber || "No reference"}</h3>
            <Badge t={urgencyTone}>{urgencyLabel}</Badge>
            <Badge t={slaTone}>{slaLabel}</Badge>
            <Badge t={statusTone(ticketStatus)}>{ticketStatus}</Badge>
            {q.parentId && <Badge t="purple">Child</Badge>}
          </div>
          <p className="mt-2 text-sm font-bold text-slate-900">{q.queryType}</p>
          <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">{q.queryDetails}</p>
        </div>
        <div className="min-w-0 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
          <div className="grid grid-cols-2 gap-3">
            <Mini label="Applicant" value={`${q.firstName} ${q.lastName}`} />
            <Mini label="ECIMS" value={getEcimsStatus(q)} />
            <Mini label="Original" value={q.originalSupportAgentName || q.ownerName} />
            <Mini label="Updated" value={`${fmtDate(activity.when)} by ${activity.who}`} />
          </div>
        </div>
      </div>
    </button>
  );
}
