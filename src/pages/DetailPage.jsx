import { useEffect, useState } from "react";
import Badge from "../components/Badge.jsx";
import Card from "../components/Card.jsx";
import { Sel } from "../components/FormControls.jsx";
import Header from "../components/Header.jsx";
import Mini from "../components/Mini.jsx";
import Stat from "../components/Stat.jsx";
import { ECIMS_APPLICATION_STATUSES, PERMISSIONS } from "../data/constants.js";
import { downloadAttachment, formatFileSize, isImageAttachment, openAttachment } from "../utils/attachmentStorage.js";
import { fmtDate, fmtTime } from "../utils/date.js";
import { audit, cn, uid } from "../utils/helpers.js";
import {
  canChangeTicketStatus,
  canCommentOnQuery,
  canResolveTicket,
  canSetTicketStatus,
  getEcimsStatus,
  getAllowedTicketStatuses,
  getTicketStatus,
  isResolvedWithinReopenWindow,
  lastActivity,
  sla,
  statusTone,
  urgency,
} from "../utils/queryRules.js";

function LinkedQuerySummaryCard({ query, label, tone, current, open, refDate, linkedToParent = false }) {
  const ticketStatus = getTicketStatus(query, refDate);
  const ecimsStatus = getEcimsStatus(query);
  const activity = lastActivity(query);

  return (
    <button
      type="button"
      onClick={() => !current && open(query)}
      disabled={current}
      className={cn(
        "w-full rounded-2xl border bg-white p-4 text-left ring-1 transition",
        tone === "blue" ? "border-blue-100 ring-blue-100" : "border-violet-100 bg-slate-50/70 ring-violet-100",
        !current && "hover:-translate-y-0.5 hover:shadow-sm",
        current && "cursor-default"
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge t={tone}>{label}</Badge>
        {current && <Badge>Current view</Badge>}
        {query.reactivationLabel && <Badge t="purple">Reactivated</Badge>}
        {linkedToParent && <span className="text-xs font-semibold text-slate-500">linked to parent</span>}
      </div>
      <p className="mt-3 break-all text-sm font-black text-slate-950">{query.applicationNumber || "No reference"}</p>
      <p className="mt-1 text-sm font-bold text-slate-800">{query.queryType}</p>
      <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">{query.queryDetails}</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Mini label="Applicant" value={`${query.firstName} ${query.lastName}`} />
        <Mini label="Ticket Status" value={ticketStatus} />
        <Mini label="eCIMS" value={ecimsStatus} />
        <Mini label="Updated" value={`${fmtTime(activity.when)} by ${activity.who}`} />
      </div>
    </button>
  );
}

export default function DetailPage({ q, user, back, update, refDate, create, open, notify, parentQuery, childrenQueries }) {
  const permissions = PERMISSIONS[user.level] || PERMISSIONS.agent;
  const ticketStatus = getTicketStatus(q, refDate);
  const ecimsStatus = getEcimsStatus(q);
  const activity = lastActivity(q);
  const attachments = q.attachments || [];
  const canComment = canCommentOnQuery(q, user, refDate);
  const canEditTicketStatus = canChangeTicketStatus(q, user, refDate);
  const canCreateChild = permissions.canCreateChild && !["Resolved", "Deactivated"].includes(ticketStatus);
  const [urgencyLabel, urgencyTone, days] = urgency(q, refDate);
  const [slaLabel, slaTone, elapsed, target] = sla(q, refDate);
  const [comment, setComment] = useState("");
  const [childText, setChildText] = useState("");
  const [ticketStatusDraft, setTicketStatusDraft] = useState(ticketStatus);
  const [statusValidation, setStatusValidation] = useState("");
  const [requestingReactivation, setRequestingReactivation] = useState(false);
  const [reactivationReason, setReactivationReason] = useState("");
  const groupParent = parentQuery || q;
  const groupChildren = childrenQueries || [];
  const hasLinkedQueries = Boolean(parentQuery || groupChildren.length);
  const statusOptions = getAllowedTicketStatuses(q, user, refDate);
  const isSupervisor = user.level === "supervisor";
  const isSupportAgent = user.level === "agent";
  const pendingUserReactivationRequest = (q.reactivationRequests || []).find(
    (request) => request.status === "pending" && request.requesterId === user.id
  );
  const canRequestReactivation =
    isSupportAgent && ticketStatus === "Resolved" && isResolvedWithinReopenWindow(q, refDate) && !pendingUserReactivationRequest;
  const hasSupervisorStatusChange = isSupervisor && ticketStatusDraft !== ticketStatus;
  const lockMessage =
    ticketStatus === "Resolved"
      ? isResolvedWithinReopenWindow(q, refDate)
        ? "This query is resolved. A Supervisor or Coordinator can reopen it by adding a comment within 3 days."
        : "This query is Deactivated. Only Coordinator/Admin can reopen this ticket."
      : ticketStatus === "Deactivated"
        ? "This query is Deactivated. Only Coordinator/Admin can reopen this ticket."
        : "";

  useEffect(() => {
    setTicketStatusDraft(ticketStatus);
    setStatusValidation("");
  }, [q.id, ticketStatus]);

  const appendAudit = (query, body) => ({ ...query, comments: [...(query.comments || []), audit(user, body)] });

  const statusChangeUpdate = (current, value, commentBody = "") => {
    const currentStatus = getTicketStatus(current, refDate);
    const now = new Date().toISOString();
    const reactivated = ["Resolved", "Deactivated"].includes(currentStatus) && !["Resolved", "Deactivated"].includes(value);
    const commentEntry = commentBody ? [audit(user, commentBody)] : [];
    const auditText = commentBody
      ? `Ticket Status changed from ${currentStatus} to ${value}. Comment: ${commentBody}`
      : `Ticket Status changed from ${currentStatus} to ${value}.`;

    return {
      ...current,
      ticketStatus: value,
      resolvedAt: value === "Resolved" ? now : reactivated ? null : current.resolvedAt,
      deactivatedAt: value === "Resolved" ? null : reactivated ? null : current.deactivatedAt,
      reopenedAt: reactivated ? now : current.reopenedAt,
      reactivatedAt: reactivated ? now : value === "Resolved" ? null : current.reactivatedAt,
      reactivatedBy: reactivated ? user.name : value === "Resolved" ? null : current.reactivatedBy,
      reactivationLabel: reactivated ? true : value === "Resolved" ? false : current.reactivationLabel,
      comments: [...(current.comments || []), ...commentEntry, audit(user, auditText)],
    };
  };

  const addComment = () => {
    if (!canComment) {
      notify(lockMessage || "You do not have permission to comment on this query.");
      return;
    }
    if (hasSupervisorStatusChange && !comment.trim()) {
      setStatusValidation("Add a comment before changing Ticket Status.");
      notify("Add a comment before changing Ticket Status.");
      return;
    }
    if (hasSupervisorStatusChange && !canSetTicketStatus(q, user, ticketStatusDraft, refDate)) {
      notify("You do not have permission to set that Ticket Status.");
      return;
    }
    if (!comment.trim()) return;

    update(q.id, (current) => {
      const currentStatus = getTicketStatus(current, refDate);
      const next = { ...current, comments: [...(current.comments || []), audit(user, comment.trim())] };
      if (currentStatus === "Resolved" && (permissions.canReopenResolved || user.level === "admin")) {
        return appendAudit(
          {
            ...next,
            ticketStatus: "Open",
            reopenedAt: new Date().toISOString(),
            reactivatedAt: new Date().toISOString(),
            reactivatedBy: user.name,
            reactivationLabel: true,
            resolvedAt: null,
            deactivatedAt: null,
          },
          "Reactivated: Ticket Status changed from Resolved to Open after an authorised comment."
        );
      }
      if (currentStatus === "Deactivated" && (permissions.canReopenDeactivated || user.level === "admin")) {
        return appendAudit(
          {
            ...next,
            ticketStatus: "Open",
            reopenedAt: new Date().toISOString(),
            reactivatedAt: new Date().toISOString(),
            reactivatedBy: user.name,
            reactivationLabel: true,
            resolvedAt: null,
            deactivatedAt: null,
          },
          "Reactivated: Ticket Status changed from Deactivated to Open by Coordinator/Admin comment."
        );
      }
      if (hasSupervisorStatusChange) {
        return statusChangeUpdate(current, ticketStatusDraft, comment.trim());
      }
      return next;
    });

    setComment("");
    setStatusValidation("");
    if (hasSupervisorStatusChange) notify("Ticket Status updated.");
    if (ticketStatus === "Resolved" && (permissions.canReopenResolved || user.level === "admin")) notify("Reactivated");
    if (ticketStatus === "Deactivated" && (permissions.canReopenDeactivated || user.level === "admin")) {
      notify("Reactivated");
    }
  };

  const changeQueryStatus = (value) => {
    if (isSupervisor) {
      if (value !== ticketStatus && !canSetTicketStatus(q, user, value, refDate)) {
        notify("You do not have permission to set that Ticket Status.");
        return;
      }
      setTicketStatusDraft(value);
      setStatusValidation(value !== ticketStatus && !comment.trim() ? "Add a comment before changing Ticket Status." : "");
      return;
    }
    if (value === ticketStatus) return;
    if (value === "Resolved" && !canResolveTicket(user)) {
      notify("Only Coordinator/Admin can resolve tickets.");
      return;
    }
    if (!canSetTicketStatus(q, user, value, refDate)) {
      notify("You do not have permission to set that Ticket Status.");
      return;
    }

    update(q.id, (current) => statusChangeUpdate(current, value, comment.trim()));
    if (comment.trim()) setComment("");
  };

  const changeApplicationStatus = (value) => {
    if (!permissions.canChangeApplicationStatus || value === ecimsStatus) return;
    update(q.id, (current) =>
      appendAudit({ ...current, ecimsStatus: value }, `eCIMS application status changed from ${getEcimsStatus(current)} to ${value}.`)
    );
  };

  const createChild = () => {
    if (!childText.trim() || !canCreateChild) return;

    const child = {
      ...q,
      id: uid("q"),
      parentId: q.parentId || q.id,
      queryDetails: childText.trim(),
      queryType: "General enquiry or support request",
      ownerId: user.id,
      ownerName: user.name,
      originalSupportAgentId: q.originalSupportAgentId || q.ownerId,
      originalSupportAgentName: q.originalSupportAgentName || q.ownerName,
      assignedIds: Array.from(new Set([...(q.assignedIds || []), user.id, "u3"])),
      ticketStatus: "Open",
      resolvedAt: null,
      reopenedAt: null,
      createdAt: new Date().toISOString(),
      comments: [audit(user, `Child query raised: ${childText.trim()}`)],
    };
    create(child);
    setChildText("");
    notify("Child query raised!");
  };

  const submitReactivationRequest = () => {
    const reason = reactivationReason.trim();
    if (!reason) {
      notify("Add a reason before requesting reactivation.");
      return;
    }

    update(q.id, (current) => ({
      ...current,
      reactivationRequests: [
        ...(current.reactivationRequests || []),
        {
          id: uid("rr"),
          requesterId: user.id,
          requesterName: user.name,
          justification: reason,
          timestamp: new Date().toISOString(),
          status: "pending",
        },
      ],
      comments: [...(current.comments || []), audit(user, `Reactivation requested: ${reason}`)],
    }));
    setReactivationReason("");
    setRequestingReactivation(false);
    notify("Reactivation request sent.");
  };

  return (
    <div className="space-y-7">
      <button onClick={back} className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-200">
        &larr; Back
      </button>
      <Header title={q.applicationNumber || "Query detail"} desc={`${q.firstName} ${q.lastName} - ${q.queryType}`} />
      {q.reactivationLabel && <Badge t="purple">Reactivated</Badge>}

      <div className="grid gap-4 md:grid-cols-4">
        <Stat title="Urgency" value={urgencyLabel} note={days === null ? "No travel date" : `${days} days`} t={urgencyTone} />
        <Stat title="SLA" value={slaLabel} note={`${elapsed}/${target} business days`} t={slaTone} />
        <Stat title="Ticket Status" value={ticketStatus} note="Ticket" t={statusTone(ticketStatus)} />
        <Stat title="Owner" value={q.ownerName.split(" ")[0]} note={q.ownerName} />
      </div>

      <div>
        <Card>
          <h2 className="text-xl font-bold">Case information</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Mini label="Applicant" value={`${q.firstName} ${q.lastName}`} />
            <Mini label="Date of birth" value={fmtDate(q.dateOfBirth)} />
            <Mini label="Email" value={q.applicantEmail} />
            <Mini label="Phone" value={q.applicantPhone} />
            <Mini label="Query origin" value={q.queryOrigin} />
            <Mini label="Travel date" value={fmtDate(q.travelDate)} />
            <Mini label="Service type" value={q.serviceType} />
            <Mini label="Application type" value={q.applicationType} />
            {q.applicationType === "Group Application" && <Mini label="Group reference" value={q.groupReferenceNumber} />}
            <Mini label="eCIMS" value={ecimsStatus} />
            <Mini label="Original support agent" value={q.originalSupportAgentName || q.ownerName} />
            <Mini label="Last commenter" value={activity.who} />
            <Mini label="Last updated" value={fmtTime(activity.when)} />
          </div>
          <section className="mt-6 rounded-3xl border border-blue-100 bg-blue-50/50 p-5 ring-1 ring-blue-100">
            <h2 className="text-base font-black text-slate-950">Query Details</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{q.queryDetails}</p>
          </section>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Sel
              label="Ticket Status"
              value={isSupervisor ? ticketStatusDraft : ticketStatus}
              set={changeQueryStatus}
              opts={statusOptions}
              disabled={!canEditTicketStatus}
            />
            <Sel
              label="eCIMS application status"
              value={ecimsStatus}
              set={changeApplicationStatus}
              opts={ECIMS_APPLICATION_STATUSES}
              disabled={!permissions.canChangeApplicationStatus}
            />
          </div>
          {lockMessage && <p className="mt-2 text-xs font-semibold text-slate-500">{lockMessage}</p>}
          {isSupportAgent && <p className="mt-2 text-xs font-semibold text-slate-500">Only Supervisors and Coordinators can change Ticket Status.</p>}
          {isSupervisor && canEditTicketStatus && (
            <p className="mt-2 text-xs font-semibold text-slate-500">Supervisors must add a comment before changing Ticket Status.</p>
          )}
          {statusValidation && <p className="mt-2 text-xs font-bold text-rose-700">{statusValidation}</p>}
          <div className="mt-6 rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold">Add comment</span>
              <textarea
                value={comment}
                onChange={(event) => {
                  setComment(event.target.value);
                  if (event.target.value.trim()) setStatusValidation("");
                }}
                rows={4}
                disabled={!canComment}
                className="input disabled:bg-slate-100"
              />
            </label>
            <button
              onClick={addComment}
              disabled={!canComment || (!comment.trim() && !hasSupervisorStatusChange)}
              className="mt-3 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white disabled:bg-slate-300"
            >
              Add comment
            </button>
            {canRequestReactivation && (
              <div className="mt-4 border-t border-slate-200 pt-4">
                {!requestingReactivation ? (
                  <button type="button" onClick={() => setRequestingReactivation(true)} className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-700 ring-1 ring-slate-200">
                    Request to reactivate
                  </button>
                ) : (
                  <div className="space-y-3">
                    <label className="block">
                      <span className="mb-1 block text-sm font-semibold">Reactivation reason</span>
                      <textarea value={reactivationReason} onChange={(event) => setReactivationReason(event.target.value)} rows={3} className="input" />
                    </label>
                    <button type="button" onClick={submitReactivationRequest} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white">
                      Send request
                    </button>
                  </div>
                )}
              </div>
            )}
            {pendingUserReactivationRequest && (
              <p className="mt-4 rounded-2xl bg-blue-50 p-3 text-sm font-semibold text-blue-800 ring-1 ring-blue-100">Reactivation request sent.</p>
            )}
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-bold">Attachments / Evidence</h2>
        {attachments.length ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {attachments.map((attachment) => {
              const hasSource = Boolean(attachment.dataUrl || attachment.url);

              return (
                <div key={attachment.id} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="flex gap-3">
                    {isImageAttachment(attachment) && attachment.dataUrl ? (
                      <img src={attachment.dataUrl} alt="" className="h-16 w-16 rounded-xl object-cover ring-1 ring-slate-200" />
                    ) : (
                      <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-white text-xs font-black text-slate-500 ring-1 ring-slate-200">
                        {attachment.category || "File"}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-950">{attachment.name}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {attachment.category || "File"} - {formatFileSize(attachment.size)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">Uploaded by {attachment.uploadedBy || "Unknown"}</p>
                      <p className="mt-1 text-xs text-slate-500">{attachment.uploadedAt ? fmtTime(attachment.uploadedAt) : "Upload date unavailable"}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openAttachment(attachment)}
                      disabled={!hasSource}
                      className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400"
                    >
                      Open / Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadAttachment(attachment)}
                      disabled={!hasSource}
                      className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      Download
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500 ring-1 ring-slate-200">No attachments added yet.</p>
        )}
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card>
          <h2 className="text-xl font-bold">Comments and audit trail</h2>
          <div className="mt-4 space-y-3">
            {(q.comments || []).map((entry) => (
              <div
                key={entry.id}
                className={cn(
                  "rounded-2xl p-4 ring-1",
                  entry.role === "Coordinator" ? "bg-blue-50 ring-blue-200" : entry.role === "Supervisor" ? "bg-violet-50 ring-violet-200" : "bg-slate-50 ring-slate-200"
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold">{entry.author}</p>
                  <Badge t={entry.role === "Coordinator" ? "blue" : entry.role === "Supervisor" ? "purple" : "slate"}>{entry.role}</Badge>
                  <span className="text-xs text-slate-500">{fmtTime(entry.timestamp)}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{entry.body}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold">Linked query group</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            {hasLinkedQueries ? "Parent and child queries linked to this applicant issue." : "No linked child queries yet."}
          </p>

          <div className="mt-4 space-y-3">
            <LinkedQuerySummaryCard query={groupParent} label="Parent query" tone="blue" current={groupParent.id === q.id} open={open} refDate={refDate} />

            {groupChildren.length ? (
              <div className="relative space-y-3 border-l border-slate-200 pl-4">
                {groupChildren.map((child) => (
                  <LinkedQuerySummaryCard
                    key={child.id}
                    query={child}
                    label="Child query"
                    tone="purple"
                    current={child.id === q.id}
                    open={open}
                    refDate={refDate}
                    linkedToParent
                  />
                ))}
              </div>
            ) : (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500 ring-1 ring-slate-200">No child queries yet.</p>
            )}
          </div>
          <label className="mt-5 block">
            <span className="mb-1 block text-sm font-semibold">Create child query</span>
            <textarea value={childText} onChange={(event) => setChildText(event.target.value)} rows={4} disabled={!canCreateChild} className="input disabled:bg-slate-100" />
          </label>
          <button onClick={createChild} disabled={!canCreateChild || !childText.trim()} className="mt-3 w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white disabled:bg-slate-300">
            Create child query
          </button>
        </Card>
      </div>
    </div>
  );
}
