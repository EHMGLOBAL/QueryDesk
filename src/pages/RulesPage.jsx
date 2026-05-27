import Card from "../components/Card.jsx";
import Header from "../components/Header.jsx";
import { PERMISSIONS } from "../data/constants.js";

export default function RulesPage() {
  return (
    <div className="space-y-6">
      <Header title="Rules and Permissions" desc="Business rules and role controls used by the system." />
      <Card>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h2 className="font-bold">Urgency</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Urgency is based on Ticket Status, eCIMS application status, travel date, service type, SLA state and reopened or unresolved state.
            </p>
          </div>
          <div>
            <h2 className="font-bold">SLA</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Standard = 15 business days. Expedited = 7 business days. Queried or incomplete applications reduce the SLA target by 3 days, with a
              minimum of 3 days.
            </p>
          </div>
        </div>
      </Card>
      <Card>
        <h2 className="text-xl font-bold">Access levels</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {Object.entries(PERMISSIONS).map(([level, permissions]) => (
            <div key={level} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
              <p className="font-bold">{permissions.label}</p>
              <p className="mt-2 text-sm text-slate-600">Scope: {permissions.scope === "all" ? "all queries" : "owned and assigned queries"}</p>
              <p className="text-sm text-slate-600">Status changes: {permissions.canChangeStatus ? "Yes" : "No"}</p>
              <p className="text-sm text-slate-600">Deactivated reopen: {permissions.canReopenDeactivated ? "Yes" : "No"}</p>
              <p className="text-sm text-slate-600">Reports: {permissions.canViewReports ? "Yes" : "No"}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
