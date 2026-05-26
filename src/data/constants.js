export const USERS = [
  { id: "u1", name: "Amma Mensah", role: "Support Agent", level: "agent", pin: "agent123" },
  { id: "u2", name: "Doreen Grant", role: "Supervisor", level: "supervisor", pin: "super123" },
  { id: "u3", name: "Gabriel Cupido", role: "Coordinator", level: "coordinator", pin: "coord123" },
];

export const PERMISSIONS = {
  agent: {
    label: "Support Agent",
    nav: ["dashboard", "raise", "all", "my", "help"],
    canRaise: true,
    canComment: true,
    canCreateChild: true,
    canChangeStatus: false,
    canChangeApplicationStatus: false,
    canReopenResolved: false,
    canReopenDeactivated: false,
    canViewReports: false,
    canExportReports: false,
    canViewRules: false,
    scope: "assigned-and-owned",
  },
  supervisor: {
    label: "Supervisor",
    nav: ["dashboard", "raise", "all", "my", "analytics", "rules", "help"],
    canRaise: true,
    canComment: true,
    canCreateChild: true,
    canChangeStatus: true,
    canChangeApplicationStatus: true,
    canReopenResolved: true,
    canReopenDeactivated: false,
    canViewReports: true,
    canExportReports: true,
    canViewRules: true,
    scope: "all",
  },
  coordinator: {
    label: "Coordinator",
    nav: ["dashboard", "raise", "all", "my", "analytics", "rules", "help"],
    canRaise: true,
    canComment: true,
    canCreateChild: true,
    canChangeStatus: true,
    canChangeApplicationStatus: true,
    canReopenResolved: true,
    canReopenDeactivated: true,
    canViewReports: true,
    canExportReports: true,
    canViewRules: true,
    scope: "all",
  },
};

export const NAV = [
  ["dashboard", "Home"],
  ["raise", "Raise New Query"],
  ["all", "Find Query"],
  ["my", "My Raised Queries"],
  ["analytics", "Reports"],
  ["rules", "Rules"],
];

export const QUERY_TYPES = [
  "Payment and transaction issue",
  "Application progress follow up",
  "Courier, return label or tracking issue",
  "Applicant document or portal access issue",
  "Mission escalation request",
  "Application status incorrect or stuck",
  "Urgent travel escalation",
  "Incomplete or cancelled application",
  "General enquiry or support request",
];

export const ECIMS_APPLICATION_STATUSES = [
  "Pending",
  "Received",
  "Queried",
  "Verified",
  "Issued",
  "Batched",
  "Despatched",
  "Incomplete",
  "Cancelled",
];

export const QUERYDESK_TICKET_STATUSES = ["Open", "In Progress", "Resolved", "Unresolved", "Cancelled", "Deactivated"];
export const QUERY_ORIGINS = ["Phone", "Chat", "Email"];
export const SERVICE_TYPES = ["Standard", "Expedited"];
export const APP_TYPES = ["Single Application", "Group Application"];
