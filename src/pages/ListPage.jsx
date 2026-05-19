import { useMemo, useState } from "react";
import Card from "../components/Card.jsx";
import { Sel } from "../components/FormControls.jsx";
import Header from "../components/Header.jsx";
import QueryCard from "../components/QueryCard.jsx";
import { ECIMS_APPLICATION_STATUSES, QUERYDESK_TICKET_STATUSES } from "../data/constants.js";
import { getEcimsStatus, getTicketStatus, urgency } from "../utils/queryRules.js";

export default function ListPage({ title, desc, data, open, refDate }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const rows = useMemo(
    () =>
      data.filter((query) => {
        const haystack = [
          query.applicationNumber,
          query.firstName,
          query.lastName,
          query.dateOfBirth,
          query.applicantEmail,
          query.queryType,
          query.queryOrigin,
          query.ownerName,
          query.queryDetails,
          getEcimsStatus(query),
          getTicketStatus(query, refDate),
        ]
          .join(" ")
          .toLowerCase();

        return (
          (!search || haystack.includes(search.toLowerCase())) &&
          (status === "All" || getTicketStatus(query, refDate) === status || getEcimsStatus(query) === status || urgency(query, refDate)[0] === status)
        );
      }),
    [data, search, status, refDate]
  );

  return (
    <div className="space-y-7">
      <Header title={title} desc={desc} />
      <Card>
        <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
          <label>
            <span className="mb-1 block text-sm font-semibold">Search</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="input"
              placeholder="Name, surname, DOB, email, application number or details"
            />
          </label>
          <Sel label="Filter" value={status} set={setStatus} opts={["All", ...QUERYDESK_TICKET_STATUSES, ...ECIMS_APPLICATION_STATUSES, "Critical", "High", "Medium", "Low"]} />
        </div>
        <div className="mt-5 space-y-4">
          {rows.length ? (
            rows.map((query) => <QueryCard key={query.id} q={query} open={open} refDate={refDate} />)
          ) : (
            <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500 ring-1 ring-slate-200">No matching queries.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
