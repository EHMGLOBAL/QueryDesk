import { useState } from "react";
import Card from "../components/Card.jsx";
import { Field, Sel } from "../components/FormControls.jsx";
import Header from "../components/Header.jsx";
import { APP_TYPES, ECIMS_APPLICATION_STATUSES, QUERY_ORIGINS, QUERY_TYPES, SERVICE_TYPES } from "../data/constants.js";
import { audit, uid } from "../utils/helpers.js";
import { getTicketStatus } from "../utils/queryRules.js";

export default function RaisePage({ data, user, create, open, notify }) {
  const [form, setForm] = useState({
    applicationNumber: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    applicantEmail: "",
    applicantPhone: "",
    queryType: QUERY_TYPES[0],
    queryOrigin: "",
    ecimsStatus: ECIMS_APPLICATION_STATUSES[0],
    travelDate: "",
    serviceType: SERVICE_TYPES[0],
    applicationType: APP_TYPES[0],
    groupReferenceNumber: "",
    trackingNumber: "",
    queryDetails: "",
    attachmentsText: "",
  });

  const set = (key, value) => setForm((current) => ({ ...current, [key]: key === "applicationNumber" ? value.toUpperCase() : value }));
  const normalise = (value) => String(value || "").trim().toLowerCase();

  const matches = data
    .map((query) => {
      let score = 0;
      if (form.applicationNumber && normalise(query.applicationNumber) === normalise(form.applicationNumber)) score += 5;
      if (form.applicantEmail && normalise(query.applicantEmail) === normalise(form.applicantEmail)) score += 4;
      if (form.dateOfBirth && query.dateOfBirth === form.dateOfBirth) score += 2;
      if (form.firstName && normalise(query.firstName).includes(normalise(form.firstName))) score += 1;
      if (form.lastName && normalise(query.lastName).includes(normalise(form.lastName))) score += 1;
      if (
        form.applicationType === "Group Application" &&
        form.groupReferenceNumber &&
        normalise(query.groupReferenceNumber) === normalise(form.groupReferenceNumber)
      ) {
        score += 4;
      }
      return { query, score };
    })
    .filter((match) => match.score >= 4)
    .sort((a, b) => b.score - a.score)
    .map((match) => match.query);

  const missing =
    !form.firstName ||
    !form.lastName ||
    !form.applicantEmail ||
    !form.queryType ||
    !form.queryOrigin ||
    !form.queryDetails ||
    (form.queryOrigin === "Phone" && !form.applicantPhone);

  const submit = () => {
    if (missing) {
      notify("Please complete all mandatory fields before creating the query.");
      return;
    }

    create({
      ...form,
      id: uid("q"),
      parentId: null,
      attachments: form.attachmentsText
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
      ownerId: user.id,
      ownerName: user.name,
      assignedIds: [user.id, "u3"],
      ticketStatus: "Open",
      resolvedAt: null,
      reopenedAt: null,
      originalSupportAgentId: user.id,
      originalSupportAgentName: user.name,
      createdAt: new Date().toISOString(),
      comments: [audit(user, `Initial query raised: ${form.queryDetails}`)],
    });
  };

  return (
    <div className="space-y-7">
      <Header title="Raise New Query" desc="Search first. If a parent query already exists, open it and add a comment or child query instead." />
      {matches.length > 0 && (
        <Card className="bg-amber-50 ring-amber-200">
          <p className="font-bold text-amber-950">Possible existing query found</p>
          <p className="mt-1 text-sm text-amber-800">
            Do not create a duplicate unless this is genuinely a separate issue. Open the existing case and add a comment or child query first.
          </p>
          <div className="mt-3 space-y-3">
            {matches.slice(0, 3).map((query) => (
              <button key={query.id} onClick={() => open(query)} className="block w-full rounded-xl bg-white p-3 text-left text-sm ring-1 ring-amber-200">
                <b>{query.applicationNumber || "No reference"}</b> - {query.firstName} {query.lastName} - {getTicketStatus(query)}
              </button>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Application Reference Number" value={form.applicationNumber} set={(value) => set("applicationNumber", value)} />
          <Field label="Applicant First Name" value={form.firstName} set={(value) => set("firstName", value)} required />
          <Field label="Applicant Surname" value={form.lastName} set={(value) => set("lastName", value)} required />
          <Field label="Date of Birth" type="date" value={form.dateOfBirth} set={(value) => set("dateOfBirth", value)} />
          <Field label="Applicant Email" type="email" value={form.applicantEmail} set={(value) => set("applicantEmail", value)} required />
          <Sel label="Query Origin" value={form.queryOrigin} set={(value) => set("queryOrigin", value)} opts={["", ...QUERY_ORIGINS]} required />
          <Field label="Applicant Phone" value={form.applicantPhone} set={(value) => set("applicantPhone", value)} required={form.queryOrigin === "Phone"} />
          <Sel label="Query Type" value={form.queryType} set={(value) => set("queryType", value)} opts={QUERY_TYPES} required />
          <Sel label="ECIMS Application Status" value={form.ecimsStatus} set={(value) => set("ecimsStatus", value)} opts={ECIMS_APPLICATION_STATUSES} />
          <Field label="Travel Date" type="date" value={form.travelDate} set={(value) => set("travelDate", value)} />
          <Sel label="Service Type" value={form.serviceType} set={(value) => set("serviceType", value)} opts={SERVICE_TYPES} />
          <Sel label="Application Type" value={form.applicationType} set={(value) => set("applicationType", value)} opts={APP_TYPES} required />
          {form.applicationType === "Group Application" && (
            <Field label="Group Application Reference Number" value={form.groupReferenceNumber} set={(value) => set("groupReferenceNumber", value)} />
          )}
          <Field label="Tracking Number" value={form.trackingNumber} set={(value) => set("trackingNumber", value)} />
          <Field label="Attachments / Evidence" value={form.attachmentsText} set={(value) => set("attachmentsText", value)} />
        </div>
        <label className="mt-4 block">
          <span className="mb-1 block text-sm font-semibold">
            Query Details <span className="text-rose-600">*</span>
          </span>
          <textarea value={form.queryDetails} onChange={(event) => set("queryDetails", event.target.value)} rows={5} className="input" />
        </label>
        <div className="mt-6 flex justify-end">
          <button disabled={missing} onClick={submit} className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:bg-slate-300">
            Create parent query
          </button>
        </div>
      </Card>
    </div>
  );
}
