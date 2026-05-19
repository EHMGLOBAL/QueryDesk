import Badge from "../components/Badge.jsx";
import Card from "../components/Card.jsx";
import Header from "../components/Header.jsx";
import { PERMISSIONS } from "../data/constants.js";
import { fmtDate } from "../utils/date.js";
import { getEcimsStatus, getTicketStatus, lastActivity, sla, statusTone, urgency } from "../utils/queryRules.js";

export default function AnalyticsPage({ data, open, refDate, user }) {
  const permissions = PERMISSIONS[user.level] || PERMISSIONS.agent;
  const rows = data.map((query) => {
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
      "QueryDesk Ticket Status",
      "ECIMS Application Status",
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
        {permissions.canExportReports && (
          <button onClick={exportCsv} className="mb-4 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white">
            Export CSV
          </button>
        )}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead>
              <tr className="text-xs uppercase text-slate-400">
                <th className="p-3">Application</th>
                <th>Applicant</th>
                <th>Type</th>
                <th>Owner</th>
                <th>Ticket status</th>
                <th>ECIMS status</th>
                <th>Origin</th>
                <th>Urgency</th>
                <th>SLA</th>
                <th>Last updated</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ query, urgencyLabel, urgencyTone, slaLabel, slaTone, activity, ticketStatus, ecimsStatus }) => (
                <tr key={query.id} onClick={() => open(query)} className="cursor-pointer border-t hover:bg-slate-50">
                  <td className="p-3 font-semibold">
                    {query.applicationNumber || "No ref"}
                    {query.parentId && <div className="text-xs text-violet-600">Child</div>}
                  </td>
                  <td>
                    {query.firstName} {query.lastName}
                    <div className="text-xs text-slate-500">{fmtDate(query.dateOfBirth)}</div>
                  </td>
                  <td>{query.queryType}</td>
                  <td>{query.ownerName}</td>
                  <td>
                    <Badge t={statusTone(ticketStatus)}>{ticketStatus}</Badge>
                  </td>
                  <td>{ecimsStatus}</td>
                  <td>{query.queryOrigin}</td>
                  <td>
                    <Badge t={urgencyTone}>{urgencyLabel}</Badge>
                  </td>
                  <td>
                    <Badge t={slaTone}>{slaLabel}</Badge>
                  </td>
                  <td>
                    {fmtDate(activity.when)} by {activity.who}
                    <div className="text-xs text-slate-500">Original: {query.originalSupportAgentName || query.ownerName}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
