import { useState } from "react";
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
  const statusOptions = getAllowedTicketStatuses(q, user, refDate);
  const lockMessage =
    ticketStatus === "Resolved"
      ? isResolvedWithinReopenWindow(q, refDate)
        ? "This query is resolved. A Supervisor or Coordinator can reopen it by adding a comment within 3 days."
        : "This query is locked because it has been resolved for more than 3 days. Coordinator access is required to reopen it."
      : ticketStatus === "Deactivated"
        ? "This query is locked because it has been resolved for more than 3 days. Coordinator access is required to reopen it."
        : "";

  const appendAudit = (query, body) => ({ ...query, comments: [...(query.comments || []), audit(user, body)] });

  const addComment = () => {
    if (!comment.trim()) return;
    if (!canComment) {
      notify(lockMessage || "You do not have permission to comment on this query.");
      return;
    }

    update(q.id, (current) => {
      const currentStatus = getTicketStatus(current, refDate);
      const next = { ...current, comments: [...(current.comments || []), audit(user, comment.trim())] };
      if (currentStatus === "Resolved" && (permissions.canReopenResolved || user.level === "admin")) {
        return appendAudit(
          { ...next, ticketStatus: "Open", reopenedAt: new Date().toISOString(), resolvedAt: null },
          "System note: resolved query reopened within the 3 day window because an authorised user added a follow-up comment."
        );
      }
      if (currentStatus === "Deactivated" && (permissions.canReopenDeactivated || user.level === "admin")) {
        return appendAudit(
          { ...next, ticketStatus: "Open", reopenedAt: new Date().toISOString(), resolvedAt: null },
          "System note: deactivated query reopened by Coordinator/Admin comment."
        );
      }
      return next;
    });

    setComment("");
    if (ticketStatus === "Resolved" && (permissions.canReopenResolved || user.level === "admin")) notify("Resolved query reopened because a new comment was added.");
    if (ticketStatus === "Deactivated" && (permissions.canReopenDeactivated || user.level === "admin")) {
      notify("Deactivated query reopened because a Coordinator/Admin comment was added.");
    }
  };

  const changeQueryStatus = (value) => {
    if (value === ticketStatus) return;
    if (value === "Resolved" && !canResolveTicket(user)) {
      notify("Only Coordinator/Admin can resolve QueryDesk tickets.");
      return;
    }
    if (!canSetTicketStatus(q, user, value, refDate)) {
      notify("You do not have permission to set that QueryDesk ticket status.");
      return;
    }

    update(q.id, (current) => {
      const currentStatus = getTicketStatus(current, refDate);
      const now = new Date().toISOString();
      const statusUpdate = {
        ...current,
        ticketStatus: value,
        resolvedAt: value === "Resolved" ? now : current.resolvedAt,
        reopenedAt: ["Resolved", "Deactivated"].includes(currentStatus) && !["Resolved", "Deactivated"].includes(value) ? now : current.reopenedAt,
      };
      if (value !== "Resolved" && ["Resolved", "Deactivated"].includes(currentStatus)) statusUpdate.resolvedAt = null;
      return appendAudit(statusUpdate, `QueryDesk ticket status changed from ${currentStatus} to ${value}.`);
    });
  };

  const changeApplicationStatus = (value) => {
    if (!permissions.canChangeApplicationStatus || value === ecimsStatus) return;
    update(q.id, (current) =>
      appendAudit({ ...current, ecimsStatus: value }, `ECIMS application status changed from ${getEcimsStatus(current)} to ${value}.`)
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
    notify("Child query created and linked to the parent application.");
  };

  return (
    <div className="space-y-7">
      <button onClick={back} className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-200">
        &larr; Back
      </button>
      <Header title={q.applicationNumber || "Query detail"} desc={`${q.firstName} ${q.lastName} - ${q.queryType}`} />

      <div className="grid gap-4 md:grid-cols-4">
        <Stat title="Urgency" value={urgencyLabel} note={days === null ? "No travel date" : `${days} days`} t={urgencyTone} />
        <Stat title="SLA" value={slaLabel} note={`${elapsed}/${target} business days`} t={slaTone} />
        <Stat title="Ticket status" value={ticketStatus} note="QueryDesk ticket" t={statusTone(ticketStatus)} />
        <Stat title="Owner" value={q.ownerName.split(" ")[0]} note={q.ownerName} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
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
            <Mini label="ECIMS application status" value={ecimsStatus} />
            <Mini label="Original support agent" value={q.originalSupportAgentName || q.ownerName} />
            <Mini label="Last commenter" value={activity.who} />
            <Mini label="Last updated" value={fmtTime(activity.when)} />
          </div>
          <p className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600 ring-1 ring-slate-200">{q.queryDetails}</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Sel label="QueryDesk Ticket Status" value={ticketStatus} set={changeQueryStatus} opts={statusOptions} disabled={!canEditTicketStatus} />
            <Sel
              label="ECIMS Application Status"
              value={ecimsStatus}
              set={changeApplicationStatus}
              opts={ECIMS_APPLICATION_STATUSES}
              disabled={!permissions.canChangeApplicationStatus}
            />
          </div>
          {lockMessage && <p className="mt-2 text-xs font-semibold text-slate-500">{lockMessage}</p>}
          {!permissions.canChangeStatus && (
            <p className="mt-2 text-xs font-semibold text-slate-500">Only Supervisors and Coordinators can change QueryDesk ticket or ECIMS application status.</p>
          )}
        </Card>

        <Card>
          <h2 className="text-xl font-bold">Linked queries</h2>
          {parentQuery && (
            <button onClick={() => open(parentQuery)} className="mt-3 w-full rounded-xl bg-violet-50 p-3 text-left text-sm font-bold text-violet-700 ring-1 ring-violet-200">
              Open parent: {parentQuery.applicationNumber}
            </button>
          )}
          <div className="mt-3 space-y-2">
            {childrenQueries.length ? (
              childrenQueries.map((child) => (
                <button key={child.id} onClick={() => open(child)} className="w-full rounded-xl bg-slate-50 p-3 text-left text-sm ring-1 ring-slate-200">
                  Child: {child.queryDetails.slice(0, 70)}
                </button>
              ))
            ) : (
              <p className="text-sm text-slate-500">No child queries yet.</p>
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
        <label className="mt-5 block">
          <span className="mb-1 block text-sm font-semibold">Add comment</span>
            <textarea value={comment} onChange={(event) => setComment(event.target.value)} rows={4} disabled={!canComment} className="input disabled:bg-slate-100" />
        </label>
        <button onClick={addComment} disabled={!canComment || !comment.trim()} className="mt-3 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white disabled:bg-slate-300">
          Add comment
        </button>
      </Card>
    </div>
  );
}
