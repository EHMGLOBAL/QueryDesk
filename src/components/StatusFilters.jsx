import { ECIMS_APPLICATION_STATUSES, QUERYDESK_TICKET_STATUSES } from "../data/constants.js";
import { ANY_FILTER, SLA_STATUS_OPTIONS } from "../utils/queryFilters.js";
import { Sel } from "./FormControls.jsx";

export default function StatusFilters({ filters, setFilter }) {
  return (
    <>
      <Sel label="eCIMS status" value={filters.ecimsStatusFilter} set={(value) => setFilter("ecimsStatusFilter", value)} opts={[ANY_FILTER, ...ECIMS_APPLICATION_STATUSES]} />
      <Sel label="Ticket Status" value={filters.queryStatusFilter} set={(value) => setFilter("queryStatusFilter", value)} opts={[ANY_FILTER, ...QUERYDESK_TICKET_STATUSES]} />
      <Sel label="SLA status" value={filters.slaStatusFilter} set={(value) => setFilter("slaStatusFilter", value)} opts={[ANY_FILTER, ...SLA_STATUS_OPTIONS]} />
    </>
  );
}
