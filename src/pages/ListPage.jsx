import { useMemo, useState } from "react";
import Card from "../components/Card.jsx";
import { Sel } from "../components/FormControls.jsx";
import Header from "../components/Header.jsx";
import QueryCard from "../components/QueryCard.jsx";
import { ECIMS_APPLICATION_STATUSES, QUERYDESK_TICKET_STATUSES } from "../data/constants.js";
import { getEcimsStatus, getTicketStatus, lastActivity, urgency } from "../utils/queryRules.js";

const ALL_ECIMS_STATUSES = "All eCIMS statuses";
const ALL_QUERY_STATUSES = "All query statuses";
const ALL_SLA_STATUSES = "All SLA statuses";
const SLA_STATUS_OPTIONS = ["Critical", "High", "Medium", "Low"];

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

function separatedFiltersMatch(query, filters, refDate) {
  const { ecimsStatusFilter, queryStatusFilter, slaStatusFilter } = filters;

  if (ecimsStatusFilter !== ALL_ECIMS_STATUSES && getEcimsStatus(query) !== ecimsStatusFilter) return false;
  if (queryStatusFilter !== ALL_QUERY_STATUSES && getTicketStatus(query, refDate) !== queryStatusFilter) return false;
  if (slaStatusFilter !== ALL_SLA_STATUSES && urgency(query, refDate)[0] !== slaStatusFilter) return false;
  return true;
}

function queryMatchesFilters(query, searchTerm, filters, refDate) {
  return (!searchTerm || querySearchText(query, refDate).includes(searchTerm)) && separatedFiltersMatch(query, filters, refDate);
}

function queryMatchesCombinedFilter(query, searchTerm, status, refDate) {
  return (!searchTerm || querySearchText(query, refDate).includes(searchTerm)) && statusMatches(query, status, refDate);
}

function groupLinkedQueries(data, search, refDate, matchesQuery) {
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
      const matchingQueries = group.filter((query) => matchesQuery(query, searchTerm));
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

export default function ListPage({ title, desc, data, open, refDate, groupLinked = false, separateStatusFilters = false }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [ecimsStatusFilter, setEcimsStatusFilter] = useState(ALL_ECIMS_STATUSES);
  const [queryStatusFilter, setQueryStatusFilter] = useState(ALL_QUERY_STATUSES);
  const [slaStatusFilter, setSlaStatusFilter] = useState(ALL_SLA_STATUSES);
  const filters = useMemo(
    () => ({ ecimsStatusFilter, queryStatusFilter, slaStatusFilter }),
    [ecimsStatusFilter, queryStatusFilter, slaStatusFilter]
  );
  const rows = useMemo(
    () =>
      separateStatusFilters && groupLinked
        ? groupLinkedQueries(data, search, refDate, (query, searchTerm) => queryMatchesFilters(query, searchTerm, filters, refDate))
        : separateStatusFilters
        ? data
            .filter((query) => queryMatchesFilters(query, search.toLowerCase(), filters, refDate))
            .map((query) => ({ query, linkedCount: 0, groupSize: 1, matchedLinked: false, groupActivity: lastActivity(query) }))
        : groupLinked
        ? groupLinkedQueries(data, search, refDate, (query, searchTerm) => queryMatchesCombinedFilter(query, searchTerm, status, refDate))
        : data
            .filter((query) => queryMatchesCombinedFilter(query, search.toLowerCase(), status, refDate))
            .map((query) => ({ query, linkedCount: 0, groupSize: 1, matchedLinked: false, groupActivity: lastActivity(query) })),
    [data, search, status, filters, refDate, groupLinked, separateStatusFilters]
  );

  return (
    <div className="space-y-7">
      <Header title={title} desc={desc} />
      <Card>
        <div className={separateStatusFilters ? "grid gap-4 lg:grid-cols-[minmax(0,1fr)_repeat(3,190px)]" : "grid gap-4 lg:grid-cols-[1fr_240px]"}>
          <label>
            <span className="mb-1 block text-sm font-semibold">Search</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="input"
              placeholder="Name, surname, DOB, email, application number or details"
            />
          </label>
          {separateStatusFilters ? (
            <>
              <Sel label="eCIMS status" value={ecimsStatusFilter} set={setEcimsStatusFilter} opts={[ALL_ECIMS_STATUSES, ...ECIMS_APPLICATION_STATUSES]} />
              <Sel label="Query Status" value={queryStatusFilter} set={setQueryStatusFilter} opts={[ALL_QUERY_STATUSES, ...QUERYDESK_TICKET_STATUSES]} />
              <Sel label="SLA status" value={slaStatusFilter} set={setSlaStatusFilter} opts={[ALL_SLA_STATUSES, ...SLA_STATUS_OPTIONS]} />
            </>
          ) : (
            <Sel label="Filter" value={status} set={setStatus} opts={["All", ...QUERYDESK_TICKET_STATUSES, ...ECIMS_APPLICATION_STATUSES, ...SLA_STATUS_OPTIONS]} />
          )}
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
