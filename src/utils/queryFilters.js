import { getEcimsStatus, getTicketStatus, urgency } from "./queryRules.js";

export const ANY_FILTER = "Any";
export const SLA_STATUS_OPTIONS = ["Critical", "High", "Medium", "Low"];

export function matchesSeparatedStatusFilters(query, filters, refDate) {
  const { ecimsStatusFilter, queryStatusFilter, slaStatusFilter } = filters;

  if (ecimsStatusFilter !== ANY_FILTER && getEcimsStatus(query) !== ecimsStatusFilter) return false;
  if (queryStatusFilter !== ANY_FILTER && getTicketStatus(query, refDate) !== queryStatusFilter) return false;
  if (slaStatusFilter !== ANY_FILTER && urgency(query, refDate)[0] !== slaStatusFilter) return false;
  return true;
}
