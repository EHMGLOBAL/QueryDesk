import DashboardSection from "../components/DashboardSection.jsx";
import Header from "../components/Header.jsx";
import { getDashboardQueues } from "../utils/queryRules.js";

export default function QueueLandingPage({ type, data, open, refDate, back }) {
  const queues = getDashboardQueues(data, refDate);
  const config =
    {
      "queue-priority": {
        title: "Priority work queue",
        desc: "Cases sorted by calculated urgency across ticket status, ECIMS status, travel date, service type, SLA and reopened state.",
        rows: queues.priorityRows,
        tone: "blue",
        empty: "No active priority queries.",
      },
      "queue-open": {
        title: "Open queries",
        desc: "All active open queries. These have not been resolved, cancelled or closed.",
        rows: queues.openRows,
        tone: "blue",
        empty: "No open queries currently need review.",
      },
      "queue-urgent": {
        title: "Urgent queries",
        desc: "Cases with critical or high urgency because of travel date, service type or ECIMS application status.",
        rows: queues.urgentRows,
        tone: queues.urgentRows.length ? "amber" : "green",
        empty: "No urgent queries currently need review.",
      },
      "queue-sla": {
        title: "SLA risk",
        desc: "Cases that have breached or are close to breaching the SLA target.",
        rows: queues.slaRows,
        tone: queues.slaRows.length ? "amber" : "green",
        empty: "No cases are currently at SLA risk.",
      },
      "queue-unresolved": {
        title: "Unresolved queries",
        desc: "Blocked, reopened or unresolved cases that need follow-up before they can move forward.",
        rows: queues.unresolvedRows,
        tone: queues.unresolvedRows.length ? "red" : "green",
        empty: "No unresolved queries currently need review.",
      },
      "queue-resolved": {
        title: "Resolved / Deactivated queries",
        desc: "Recently resolved and deactivated cases. Use this page to review completed query history.",
        rows: queues.resolvedRows,
        tone: "green",
        empty: "No resolved or deactivated queries found.",
      },
    }[type] || {
      title: "Query queue",
      desc: "Filtered operational query view.",
      rows: queues.priorityRows,
      tone: "slate",
      empty: "No queries found.",
    };

  return (
    <div className="space-y-7">
      <button onClick={back} className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-200">
        &larr; Back to dashboard
      </button>
      <Header title={config.title} desc={config.desc} />
      <DashboardSection
        id={type}
        title={config.title}
        desc="Each card shows the full operational summary so support users do not need to open the case unless they need to comment, update status or create a child query."
        count={config.rows.length}
        toneName={config.tone}
        rows={config.rows}
        open={open}
        refDate={refDate}
        emptyText={config.empty}
      />
    </div>
  );
}
