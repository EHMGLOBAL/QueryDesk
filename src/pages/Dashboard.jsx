import Badge from "../components/Badge.jsx";
import Card from "../components/Card.jsx";
import DashboardIcon from "../components/DashboardIcon.jsx";
import DashboardMetric from "../components/DashboardMetric.jsx";
import Header from "../components/Header.jsx";
import { fmtTime } from "../utils/date.js";
import { audit } from "../utils/helpers.js";
import { getDashboardQueues, getTicketStatus, isResolvedWithinReopenWindow } from "../utils/queryRules.js";

export default function Dashboard({ data, open, refDate, openQueue, user, update, notify }) {
  const queues = getDashboardQueues(data, refDate);
  const isSupervisor = user?.level === "supervisor";
  const reactivationRequests = isSupervisor
    ? data.flatMap((query) =>
        (query.reactivationRequests || [])
          .filter((request) => request.status === "pending" && getTicketStatus(query, refDate) === "Resolved" && isResolvedWithinReopenWindow(query, refDate))
          .map((request) => ({ query, request }))
      )
    : [];
  const metrics = [
    { key: "queue-open", title: "Open", value: queues.openRows.length, note: "Active", t: "blue", icon: "clipboard" },
    { key: "queue-urgent", title: "Urgent", value: queues.urgentRows.length, note: "Travel risk", t: "amber", icon: "urgent" },
    { key: "queue-sla", title: "SLA risk", value: queues.slaRows.length, note: "Needs chasing", t: "purple", icon: "shield" },
    { key: "queue-unresolved", title: "Unresolved", value: queues.unresolvedRows.length, note: "Blocked", t: "red", icon: "lock" },
    { key: "queue-resolved", title: "Resolved / Deactivated", value: queues.resolvedRows.length, note: "Closed", t: "green", icon: "check" },
  ];
  const priorityStats = [
    { label: "Priority cases", value: queues.priorityRows.length },
    { label: "Urgent", value: queues.urgentRows.length },
    { label: "SLA risk", value: queues.slaRows.length },
    { label: "Unresolved", value: queues.unresolvedRows.length },
  ];

  const approveReactivationRequest = (query, request) => {
    update(query.id, (current) => ({
      ...current,
      ticketStatus: "Open",
      resolvedAt: null,
      deactivatedAt: null,
      reopenedAt: new Date().toISOString(),
      reactivatedAt: new Date().toISOString(),
      reactivatedBy: user.name,
      reactivationLabel: true,
      reactivationRequests: (current.reactivationRequests || []).map((item) =>
        item.id === request.id ? { ...item, status: "approved", reviewedBy: user.name, reviewedAt: new Date().toISOString() } : item
      ),
      comments: [
        ...(current.comments || []),
        audit(user, `Reactivation request approved for ${request.requesterName}. Ticket Status changed from Resolved to Open. Reason: ${request.justification}`),
      ],
    }));
    notify("Reactivated");
  };

  const declineReactivationRequest = (query, request) => {
    update(query.id, (current) => ({
      ...current,
      reactivationRequests: (current.reactivationRequests || []).map((item) =>
        item.id === request.id ? { ...item, status: "declined", reviewedBy: user.name, reviewedAt: new Date().toISOString() } : item
      ),
      comments: [...(current.comments || []), audit(user, `Reactivation request declined for ${request.requesterName}. Reason: ${request.justification}`)],
    }));
    notify("Reactivation request declined.");
  };

  return (
    <div className="space-y-7">
      <Header title="Home" desc="Search, raise, link, comment and resolve application support queries." />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {metrics.map((metric) => (
          <DashboardMetric key={metric.key} {...metric} active={false} onClick={() => openQueue(metric.key)} />
        ))}
      </div>

      {reactivationRequests.length > 0 && (
        <Card>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold text-slate-950">Reactivation requests</h2>
            <Badge t="purple">{reactivationRequests.length} pending</Badge>
          </div>
          <div className="mt-4 space-y-3">
            {reactivationRequests.map(({ query, request }) => (
              <div key={`${query.id}-${request.id}`} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <p className="break-all text-sm font-black text-slate-950">{query.applicationNumber || "No reference"}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {query.firstName} {query.lastName}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{request.justification}</p>
                    <p className="mt-2 text-xs font-semibold text-slate-500">
                      Requested by {request.requesterName} on {fmtTime(request.timestamp)}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <button type="button" onClick={() => approveReactivationRequest(query, request)} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white">
                      Reactivate
                    </button>
                    <button type="button" onClick={() => declineReactivationRequest(query, request)} className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-700 ring-1 ring-slate-200">
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <section className="w-full rounded-[1.35rem] border border-slate-200 bg-white px-6 py-6 shadow-[0_10px_28px_rgba(15,23,42,0.045)]">
        <div className="flex items-center gap-5">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-blue-50">
            <DashboardIcon type="clipboard" colour="blue" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-medium tracking-tight text-slate-950">Priority work queue</h2>
            <p className="mt-1.5 text-sm leading-6 text-slate-500">The main working queue for cases that need attention first.</p>
          </div>
          <button
            type="button"
            onClick={() => openQueue("queue-priority")}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm font-bold text-slate-600 ring-1 ring-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:ring-blue-100"
          >
            Open queue <span className="text-lg leading-none">&rsaquo;</span>
          </button>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {priorityStats.map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{stat.label}</p>
              <p className="mt-1 text-2xl font-semibold text-slate-950">{stat.value}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
