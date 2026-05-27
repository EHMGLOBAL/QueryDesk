# QueryDesk Frontend QA Checklist

Use this checklist to run through the current frontend manually before sharing changes.

## Login And Roles

- [ ] Log in as Support Agent using the demo PIN.
- [ ] Confirm the Support Agent only sees their allowed navigation items.
- [ ] Log out, then log in as Supervisor.
- [ ] Confirm the Supervisor can access reports but cannot access rules.
- [ ] Log out, then log in as Coordinator.
- [ ] Confirm the Coordinator can access reports, rules, and locked-case controls.

## Raising Queries

- [ ] Open Raise New Query.
- [ ] Create a query with first name, surname, email, query origin, query type, and query details completed.
- [ ] Confirm application reference number is optional.
- [ ] Type a lowercase application reference and confirm it becomes uppercase while typing.
- [ ] Select Phone as the query origin and confirm phone number becomes required.
- [ ] Select Chat or Email as the query origin and confirm phone number is not required.
- [ ] Attach a JPG, PNG, and PDF and confirm each appears before submission with name, type, size, and remove option.
- [ ] Try attaching an unsupported file type and confirm it is rejected.
- [ ] Try attaching more than five files and confirm the form blocks the extra files.
- [ ] Try submitting without each mandatory field and confirm the form blocks submission.

## Duplicate Handling

- [ ] Enter details matching an existing applicant or application.
- [ ] Confirm the possible duplicate warning appears.
- [ ] Open the possible existing query from the warning.
- [ ] Confirm the user can add a comment or child query instead of creating a duplicate.

## Dashboard And Queues

- [ ] Confirm dashboard cards show Open, Urgent, SLA risk, Unresolved, and Resolved / Deactivated counts.
- [ ] Open each dashboard card and confirm it shows the matching queue page.
- [ ] Open the Priority work queue.
- [ ] Confirm urgent, unresolved, reopened, and SLA-risk cases appear ahead of lower-risk cases.
- [ ] Move between dashboard, queue pages, and detail pages without losing context unexpectedly.

## Status Display

- [ ] Open a query detail page.
- [ ] Confirm Ticket Status is shown separately from eCIMS application status.
- [ ] As Support Agent, confirm Ticket Status controls are disabled and eCIMS status can be updated where permitted.
- [ ] As Supervisor, change Ticket Status with a comment and confirm the audit trail records it.
- [ ] As Coordinator, change Ticket Status and confirm the audit trail records it.
- [ ] As Supervisor or Coordinator, change eCIMS application status and confirm the audit trail records it.

## Resolved And Deactivated Cases

- [ ] Mark a query as Resolved and confirm it stores a resolved state.
- [ ] As Supervisor or Coordinator, add a comment to a recently resolved case and confirm it reactivates.
- [ ] Confirm Support Agent cannot reopen a resolved case by commenting.
- [ ] Review a case resolved more than 3 days ago and confirm it appears as Deactivated.
- [ ] Confirm Supervisor cannot comment on or reopen a Deactivated case.
- [ ] Confirm Coordinator can comment on or reopen a Deactivated case.

## Comments And Audit Trail

- [ ] Add a comment to an open query and confirm it appears in the comments and audit trail.
- [ ] Confirm each audit entry shows the author, role, timestamp, and message.
- [ ] Confirm the detail page shows original support agent, last commenter, and last updated timestamp.
- [ ] Confirm the detail page shows Attachments / Evidence with open and download actions.
- [ ] Create a child query and confirm it links back to the parent.
- [ ] Open a parent query and confirm linked child queries appear.

## Reports

- [ ] Log in as Supervisor or Coordinator.
- [ ] Open Reports.
- [ ] Confirm the table shows Ticket Status and eCIMS status separately.
- [ ] Confirm query origin, urgency, SLA, last updated, and original support agent are visible.
- [ ] Export CSV and confirm the downloaded report includes the current query data.
