import { PERMISSIONS } from "../data/constants.js";
import { businessDays, daysUntil } from "./date.js";

const RESOLVED_REOPEN_WINDOW_MS = 3 * 24 * 60 * 60 * 1000;

function permissionsFor(user) {
  if (user.level === "admin") {
    return {
      ...PERMISSIONS.coordinator,
      label: "Admin",
      scope: "all",
      canReopenResolved: true,
      canReopenDeactivated: true,
    };
  }
  return PERMISSIONS[user.level] || PERMISSIONS.agent;
}

export function getTicketStatus(query, ref = new Date()) {
  const status = query.ticketStatus || query.status || "Open";
  if (status === "Resolved" && isResolvedExpired(query, ref)) return "Deactivated";
  return status;
}

export function getEcimsStatus(query) {
  return query.ecimsStatus || query.applicationStatus || "Pending";
}

export function isResolvedExpired(query, ref = new Date()) {
  const status = query.ticketStatus || query.status;
  if (status !== "Resolved" || !query.resolvedAt) return false;
  return new Date(ref).getTime() - new Date(query.resolvedAt).getTime() > RESOLVED_REOPEN_WINDOW_MS;
}

export function isResolvedWithinReopenWindow(query, ref = new Date()) {
  const status = query.ticketStatus || query.status;
  if (status !== "Resolved" || !query.resolvedAt) return false;
  return new Date(ref).getTime() - new Date(query.resolvedAt).getTime() <= RESOLVED_REOPEN_WINDOW_MS;
}

export function normaliseQuery(query, ref = new Date()) {
  const ticketStatus = query.ticketStatus || query.status || "Open";
  const resolvedAt = ticketStatus === "Resolved" ? query.resolvedAt || query.updatedAt || query.createdAt : query.resolvedAt || null;

  return {
    ...query,
    ticketStatus: ticketStatus === "Resolved" && resolvedAt && isResolvedExpired({ ...query, ticketStatus, resolvedAt }, ref) ? "Deactivated" : ticketStatus,
    ecimsStatus: getEcimsStatus(query),
    queryOrigin: query.queryOrigin || "Email",
    originalSupportAgentId: query.originalSupportAgentId || query.ownerId,
    originalSupportAgentName: query.originalSupportAgentName || query.ownerName,
    resolvedAt,
    reopenedAt: query.reopenedAt || null,
  };
}

export function normaliseQueries(queries, ref = new Date()) {
  return queries.map((query) => normaliseQuery(query, ref));
}

export function urgency(query, ref = new Date()) {
  const ticketStatus = getTicketStatus(query, ref);
  const ecimsStatus = getEcimsStatus(query);
  const days = daysUntil(query.travelDate, ref);
  const [slaState] = sla(query, ref);

  if (ecimsStatus === "Cancelled" || ["Cancelled", "Deactivated"].includes(ticketStatus)) return ["Closed", "slate", days];
  if (ticketStatus === "Unresolved" || slaState === "Breached") return ["Critical", "red", days];
  if (query.reopenedAt || slaState === "At Risk") return ["High", "orange", days];
  if (days === null) return ["No travel date", "slate", null];
  if (["Incomplete", "Queried"].includes(ecimsStatus) && days <= 7) return ["Critical", "red", days];
  if (query.serviceType === "Expedited" && days <= 2) return ["Critical", "red", days];
  if (query.serviceType === "Expedited" && days <= 5) return ["High", "orange", days];
  if (days <= 3) return ["Critical", "red", days];
  if (days <= 7) return ["High", "orange", days];
  if (days <= 14) return ["Medium", "amber", days];
  return ["Low", "green", days];
}

export function sla(query, ref = new Date()) {
  const ticketStatus = getTicketStatus(query, ref);
  const ecimsStatus = getEcimsStatus(query);
  const elapsed = businessDays(new Date(query.createdAt), ref);
  let target = query.serviceType === "Expedited" ? 7 : 15;

  if (["Incomplete", "Queried"].includes(ecimsStatus)) target = Math.max(3, target - 3);
  if (ticketStatus === "Resolved") return ["Resolved", "green", elapsed, target];
  if (ticketStatus === "Deactivated") return ["Deactivated", "slate", elapsed, target];
  if (ticketStatus === "Cancelled" || ecimsStatus === "Cancelled") return ["Cancelled", "slate", elapsed, target];
  if (target - elapsed < 0) return ["Breached", "red", elapsed, target];
  if (target - elapsed <= 2) return ["At Risk", "amber", elapsed, target];
  return ["On Track", "green", elapsed, target];
}

export function priorityScore(query, ref = new Date()) {
  const ticketStatus = getTicketStatus(query, ref);
  const ecimsStatus = getEcimsStatus(query);
  const [urgencyState, , days] = urgency(query, ref);
  const [slaState] = sla(query, ref);
  const urgencyWeight = { Critical: 120, High: 90, Medium: 50, Low: 20, "No travel date": 5, Closed: -100 };
  const slaWeight = { Breached: 110, "At Risk": 75, "On Track": 10, Resolved: -80, Deactivated: -120, Cancelled: -120 };
  const ticketWeight = { Unresolved: 130, Open: 45, "In Progress": 30, Resolved: -80, Deactivated: -120, Cancelled: -120 };
  const ecimsWeight = { Incomplete: 70, Queried: 60, Pending: 25, Received: 15, Verified: 5, Issued: -15, Batched: -10, Despatched: -10, Cancelled: -120 };

  let score = 0;
  score += urgencyWeight[urgencyState] ?? 0;
  score += slaWeight[slaState] ?? 0;
  score += ticketWeight[ticketStatus] ?? 0;
  score += ecimsWeight[ecimsStatus] ?? 0;
  if (query.serviceType === "Expedited") score += 35;
  if (query.reopenedAt) score += 80;
  if (ticketStatus === "Unresolved") score += 60;
  if (days !== null) score += Math.max(0, 40 - Math.max(days, 0) * 4);

  return score;
}

export function tone(type) {
  return (
    {
      red: "bg-rose-50 text-rose-700 ring-rose-200",
      orange: "bg-orange-50 text-orange-700 ring-orange-200",
      amber: "bg-amber-50 text-amber-700 ring-amber-200",
      green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
      blue: "bg-blue-50 text-blue-700 ring-blue-200",
      purple: "bg-violet-50 text-violet-700 ring-violet-200",
      slate: "bg-slate-50 text-slate-700 ring-slate-200",
    }[type] || "bg-slate-50 text-slate-700 ring-slate-200"
  );
}

export function statusTone(status) {
  return (
    {
      Resolved: "green",
      Unresolved: "red",
      Cancelled: "slate",
      Deactivated: "slate",
      Open: "blue",
      "In Progress": "amber",
    }[status] || "blue"
  );
}

export function lastActivity(query) {
  const latest = query.comments?.length ? query.comments[query.comments.length - 1] : null;
  return {
    when: latest?.timestamp || query.updatedAt || query.createdAt,
    who: latest?.author || query.ownerName,
    authorId: latest?.authorId || query.ownerId,
  };
}

export function userCanSee(query, user) {
  const permissions = permissionsFor(user);
  return permissions.scope === "all" || query.ownerId === user.id || (query.assignedIds || []).includes(user.id);
}

export function canCommentOnQuery(query, user, ref = new Date()) {
  const permissions = permissionsFor(user);
  const ticketStatus = getTicketStatus(query, ref);
  if (!permissions.canComment) return false;
  if (ticketStatus === "Resolved") return permissions.canReopenResolved && isResolvedWithinReopenWindow(query, ref);
  if (ticketStatus === "Deactivated") return permissions.canReopenDeactivated || user.level === "admin";
  return true;
}

export function canChangeTicketStatus(query, user, ref = new Date()) {
  const permissions = permissionsFor(user);
  const ticketStatus = getTicketStatus(query, ref);
  if (!permissions.canChangeStatus) return false;
  if (ticketStatus === "Deactivated") return permissions.canReopenDeactivated || user.level === "admin";
  return true;
}

export function getDashboardQueues(data, refDate) {
  const active = data.filter((query) => !["Resolved", "Cancelled", "Deactivated"].includes(getTicketStatus(query, refDate)));
  const prioritySort = (a, b) => {
    const aUrgency = urgency(a, refDate);
    const bUrgency = urgency(b, refDate);

    return (
      priorityScore(b, refDate) - priorityScore(a, refDate) ||
      (aUrgency[2] ?? 999) - (bUrgency[2] ?? 999) ||
      new Date(lastActivity(b).when) - new Date(lastActivity(a).when)
    );
  };

  const immediateRows = active
    .filter(
      (query) =>
        ["Critical", "High"].includes(urgency(query, refDate)[0]) ||
        ["Breached"].includes(sla(query, refDate)[0]) ||
        getTicketStatus(query, refDate) === "Unresolved" ||
        query.reopenedAt
    )
    .sort(prioritySort);

  const slaRows = active.filter((query) => ["Breached", "At Risk"].includes(sla(query, refDate)[0])).sort(prioritySort);
  const recentRows = [...active].sort((a, b) => new Date(lastActivity(b).when) - new Date(lastActivity(a).when)).slice(0, 8);
  const openRows = active.filter((query) => getTicketStatus(query, refDate) === "Open").sort(prioritySort);
  const urgentRows = active.filter((query) => ["Critical", "High"].includes(urgency(query, refDate)[0])).sort(prioritySort);
  const unresolvedRows = active.filter((query) => getTicketStatus(query, refDate) === "Unresolved" || query.reopenedAt).sort(prioritySort);
  const resolvedRows = data
    .filter((query) => ["Resolved", "Deactivated"].includes(getTicketStatus(query, refDate)))
    .sort((a, b) => new Date(lastActivity(b).when) - new Date(lastActivity(a).when));
  const priorityRows = [...active].sort(prioritySort).slice(0, 5);

  return {
    active,
    immediateRows,
    slaRows,
    recentRows,
    openRows,
    urgentRows,
    unresolvedRows,
    resolvedRows,
    priorityRows,
  };
}
