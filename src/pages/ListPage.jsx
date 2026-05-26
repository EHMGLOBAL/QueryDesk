import { useMemo, useState } from "react";
import Card from "../components/Card.jsx";
import { Sel } from "../components/FormControls.jsx";
import Header from "../components/Header.jsx";
import QueryCard from "../components/QueryCard.jsx";
import { ECIMS_APPLICATION_STATUSES, QUERYDESK_TICKET_STATUSES } from "../data/constants.js";
import { getEcimsStatus, getTicketStatus, lastActivity, urgency } from "../utils/queryRules.js";

function querySearchText(query, refDate) {
  return [
    query.applicationNumber,
    query.firstName,
    query.lastName,
    query.dateOfBirth,
    query.applicantEmail,
    query.applicantPhone,
    query.queryType,
    query.queryOrigin,
    query.ownerName,
    query.queryDetails,
    getEcimsStatus(query),
    getTicketStatus(query, refDate),
    ...(query.comments || []).map((comment) => comment.body),
    ...(query.attachments || []).map((attachment) => attachment.name || attachment),
  ]
    .join(" ")
    .toLowerCase();
}

function statusMatches(query, status, refDate) {
  return status === "All" || getTicketStatus(query, refDate) === status || getEcimsStatus(query) === status || urgency(query, refDate)[0] === status;
}

function groupLinkedQueries(data, search, status, refDate) {
  const searchTerm = search.toLowerCase();
  const byId = new Map(data.map((query) => [query.id, query]));
  const groups = new Map();

  data.forEach((query) => {
    const rootId = query.parentId && byId.has(query.parentId) ? query.parentId : query.id;
    const current = groups.get(rootId) || [];
    current.push(query);
    groups.set(rootId, current);
  });

  return Array.from(groups.entries())
    .map(([rootId, group]) => {
      const parent = byId.get(rootId) || group.find((query) => !query.parentId) || group[0];
      const children = group.filter((query) => query.id !== parent.id);
      const matchingQueries = group.filter((query) => (!searchTerm || querySearchText(query, refDate).includes(searchTerm)) && statusMatches(query, status, refDate));
      const parentMatches = matchingQueries.some((query) => query.id === parent.id);
      const linkedCount = children.length;
      const latestActivity = group.reduce(
        (latest, query) => {
          const activity = lastActivity(query);
          const when = new Date(activity.when).getTime();
          return !Number.isNaN(when) && when > latest.time ? { time: when, activity } : latest;
        },
        { time: 0, activity: lastActivity(parent) }
      );

      return {
        query: parent,
        linkedCount,
        groupSize: group.length,
        matchedLinked: Boolean(searchTerm && matchingQueries.length && !parentMatches),
        groupActivity: latestActivity.activity,
        lastUpdatedAt: latestActivity.time,
        visible: matchingQueries.length > 0,
      };
    })
    .filter((group) => group.visible)
    .sort((a, b) => b.lastUpdatedAt - a.lastUpdatedAt);
}

export default function ListPage({ title, desc, data, open, refDate, groupLinked = false }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const rows = useMemo(
    () =>
      groupLinked
        ? groupLinkedQueries(data, search, status, refDate)
        : data
            .filter((query) => (!search || querySearchText(query, refDate).includes(search.toLowerCase())) && statusMatches(query, status, refDate))
            .map((query) => ({ query, linkedCount: 0, groupSize: 1, matchedLinked: false, groupActivity: lastActivity(query) })),
    [data, search, status, refDate, groupLinked]
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
            rows.map((row) => (
              <QueryCard
                key={row.query.id}
                q={row.query}
                open={open}
                refDate={refDate}
                linkedCount={row.linkedCount}
                groupSize={row.groupSize}
                matchedLinked={row.matchedLinked}
                groupActivity={row.groupActivity}
              />
            ))
          ) : (
            <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500 ring-1 ring-slate-200">No matching queries.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
