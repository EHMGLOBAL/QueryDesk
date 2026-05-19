import DashboardIcon from "../components/DashboardIcon.jsx";
import DashboardMetric from "../components/DashboardMetric.jsx";
import Header from "../components/Header.jsx";
import { getDashboardQueues } from "../utils/queryRules.js";

export default function Dashboard({ data, open, refDate, openQueue }) {
  const queues = getDashboardQueues(data, refDate);
  const metrics = [
    { key: "queue-open", title: "Open", value: queues.openRows.length, note: "Active", t: "blue", icon: "clipboard" },
    { key: "queue-urgent", title: "Urgent", value: queues.urgentRows.length, note: "Travel risk", t: "amber", icon: "urgent" },
    { key: "queue-sla", title: "SLA risk", value: queues.slaRows.length, note: "Needs chasing", t: "green", icon: "shield" },
    { key: "queue-unresolved", title: "Unresolved", value: queues.unresolvedRows.length, note: "Blocked", t: "red", icon: "lock" },
    { key: "queue-resolved", title: "Resolved / Deactivated", value: queues.resolvedRows.length, note: "Closed", t: "green", icon: "check" },
  ];

  return (
    <div className="space-y-7">
      <Header title="Home" desc="Search, raise, link, comment and resolve application support queries." />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {metrics.map((metric) => (
          <DashboardMetric key={metric.key} {...metric} active={false} onClick={() => openQueue(metric.key)} />
        ))}
      </div>

      <button
        onClick={() => openQueue("queue-priority")}
        className="group w-full rounded-[1.35rem] border border-slate-200 bg-white px-6 py-6 text-left shadow-[0_10px_28px_rgba(15,23,42,0.045)] transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_16px_34px_rgba(15,23,42,0.075)]"
      >
        <div className="flex items-center gap-5">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-blue-50">
            <DashboardIcon type="clipboard" colour="blue" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-medium tracking-tight text-slate-950">Priority work queue</h2>
            <p className="mt-1.5 text-sm leading-6 text-slate-500">The main working queue for cases that need attention first.</p>
          </div>
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-3xl font-light leading-none text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500">
            &rsaquo;
          </span>
        </div>
      </button>
    </div>
  );
}
