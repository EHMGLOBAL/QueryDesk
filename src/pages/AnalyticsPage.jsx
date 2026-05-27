import { useMemo, useState } from "react";
import Badge from "../components/Badge.jsx";
import Card from "../components/Card.jsx";
import Header from "../components/Header.jsx";
import StatusFilters from "../components/StatusFilters.jsx";
import { PERMISSIONS } from "../data/constants.js";
import { fmtDate } from "../utils/date.js";
import { ANY_FILTER, matchesSeparatedStatusFilters } from "../utils/queryFilters.js";
import { getEcimsStatus, getTicketStatus, lastActivity, sla, statusTone, urgency } from "../utils/queryRules.js";

export default function AnalyticsPage({ data, open, refDate, user }) {
  const permissions = PERMISSIONS[user.level] || PERMISSIONS.agent;
  const [ecimsStatusFilter, setEcimsStatusFilter] = useState(ANY_FILTER);
  const [queryStatusFilter, setQueryStatusFilter] = useState(ANY_FILTER);
  const [slaStatusFilter, setSlaStatusFilter] = useState(ANY_FILTER);
  const filters = useMemo(
    () => ({ ecimsStatusFilter, queryStatusFilter, slaStatusFilter }),
    [ecimsStatusFilter, queryStatusFilter, slaStatusFilter]
  );
  const setFilter = (key, value) => {
    if (key === "ecimsStatusFilter") setEcimsStatusFilter(value);
    if (key === "queryStatusFilter") setQueryStatusFilter(value);
    if (key === "slaStatusFilter") setSlaStatusFilter(value);
  };
  const rows = data
    .filter((query) => matchesSeparatedStatusFilters(query, filters, refDate))
    .map((query) => {
      const [urgencyLabel, urgencyTone] = urgency(query, refDate);
      const [slaLabel, slaTone] = sla(query, refDate);
      const activity = lastActivity(query);
      return { query, urgencyLabel, urgencyTone, slaLabel, slaTone, activity, ticketStatus: getTicketStatus(query, refDate), ecimsStatus: getEcimsStatus(query) };
    });

  function exportCsv() {
    const headers = [
      "Application Number",
      "Name",
      "Surname",
      "DOB",
      "Parent ID",
      "Query Type",
      "Owner",
      "Ticket Status",
      "eCIMS Application Status",
      "Query Origin",
      "Urgency",
      "SLA",
      "Travel Date",
      "Last Updated",
      "Updated By",
      "Original Support Agent",
    ];
    const csv = rows.map(({ query, urgencyLabel, slaLabel, activity, ticketStatus, ecimsStatus }) =>
      [
        query.applicationNumber,
        query.firstName,
        query.lastName,
        query.dateOfBirth,
        query.parentId || "",
        query.queryType,
        query.ownerName,
        ticketStatus,
        ecimsStatus,
        query.queryOrigin,
        urgencyLabel,
        slaLabel,
        query.travelDate,
        activity.when,
        activity.who,
        query.originalSupportAgentName || query.ownerName,
      ]
        .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
        .join(",")
    );
    const blob = new Blob([[headers.join(","), ...csv].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "query-report.csv";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-7">
      <Header title="Reports" desc="Operational reporting and CSV export for authorised users." />
      <Card>
        <div className="mb-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_repeat(3,190px)]">
          <div>
            <p className="text-sm font-semibold text-slate-900">Report filters</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">Use one or more filters to narrow the displayed report rows.</p>
          </div>
          <StatusFilters filters={filters} setFilter={setFilter} />
        </div>
        {permissions.canExportReports && (
          <button onClick={exportCsv} className="mb-5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white">
            Export CSV
          </button>
        )}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead>
              <tr className="border-y border-slate-100 text-xs uppercase text-slate-400">
                <th className="px-4 py-3">Application</th>
                <th className="px-4 py-3">Applicant</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Ticket status</th>
                <th className="px-4 py-3">eCIMS status</th>
                <th className="px-4 py-3">Origin</th>
                <th className="px-4 py-3">Urgency</th>
                <th className="px-4 py-3">SLA</th>
                <th className="px-4 py-3">Last updated</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ query, urgencyLabel, urgencyTone, slaLabel, slaTone, activity, ticketStatus, ecimsStatus }) => (
                <tr key={query.id} onClick={() => open(query)} className="cursor-pointer border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-4 align-top font-semibold">
                    <span className="break-all">{query.applicationNumber || "No ref"}</span>
                    {query.parentId && <div className="text-xs text-violet-600">Child</div>}
                  </td>
                  <td className="px-4 py-4 align-top">
                    {query.firstName} {query.lastName}
                    <div className="text-xs text-slate-500">{fmtDate(query.dateOfBirth)}</div>
                  </td>
                  <td className="max-w-[220px] px-4 py-4 align-top leading-6">{query.queryType}</td>
                  <td className="px-4 py-4 align-top">{query.ownerName}</td>
                  <td className="px-4 py-4 align-top">
                    <Badge t={statusTone(ticketStatus)}>{ticketStatus}</Badge>
                  </td>
                  <td className="px-4 py-4 align-top">{ecimsStatus}</td>
                  <td className="px-4 py-4 align-top">{query.queryOrigin}</td>
                  <td className="px-4 py-4 align-top">
                    <Badge t={urgencyTone}>{urgencyLabel}</Badge>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <Badge t={slaTone}>{slaLabel}</Badge>
                  </td>
                  <td className="px-4 py-4 align-top leading-6">
                    {fmtDate(activity.when)} by {activity.who}
                    <div className="text-xs text-slate-500">Original: {query.originalSupportAgentName || query.ownerName}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500 ring-1 ring-slate-200">No matching report rows.</p>}
        </div>
      </Card>
    </div>
  );
}
