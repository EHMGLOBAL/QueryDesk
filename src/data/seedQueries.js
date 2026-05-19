import { addDays, isoDate } from "../utils/date.js";

export function seedQueries() {
  const now = new Date();
  const make = (
    id,
    applicationNumber,
    queryType,
    ecimsStatus,
    travelOffset,
    serviceType,
    ownerId,
    ownerName,
    ticketStatus,
    createdOffset,
    queryDetails,
    firstName,
    lastName,
    dateOfBirth,
    attachments = []
  ) => {
    const createdAt = addDays(now, createdOffset).toISOString();

    return {
      id,
      parentId: null,
      applicationNumber,
      firstName,
      lastName,
      dateOfBirth,
      queryType,
      ecimsStatus,
      travelDate: isoDate(addDays(now, travelOffset)),
      serviceType,
      applicationType: "Single Application",
      groupReferenceNumber: "",
      applicantEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      applicantPhone: "+44 7700 900000",
      trackingNumber: "",
      queryDetails,
      attachments,
      queryOrigin: "Email",
      ownerId,
      ownerName,
      originalSupportAgentId: ownerId,
      originalSupportAgentName: ownerName,
      assignedIds: [ownerId, "u3"],
      ticketStatus,
      resolvedAt: ticketStatus === "Resolved" ? createdAt : null,
      reopenedAt: null,
      createdAt,
      comments: [
        {
          id: `${id}-c1`,
          author: ownerName,
          authorId: ownerId,
          role: "Support Agent",
          timestamp: createdAt,
          body: "Initial query raised by support.",
        },
      ],
    };
  };

  return [
    make(
      "q1",
      "GVWE2026050002147",
      "Payment and transaction issue",
      "Pending",
      2,
      "Expedited",
      "u1",
      "Amma Mensah",
      "Open",
      -2,
      "Applicant paid but payment is still pending.",
      "Kwame",
      "Mensah",
      "1991-04-12",
      ["payment-receipt.png"]
    ),
    make(
      "q2",
      "GVDC2026040009182",
      "Applicant document or portal access issue",
      "Queried",
      8,
      "Standard",
      "u2",
      "Doreen Grant",
      "In Progress",
      -5,
      "Applicant uploaded replacement document and needs portal access reopened.",
      "Abena",
      "Owusu",
      "1988-11-03"
    ),
    make(
      "q3",
      "GVDC2026040007710",
      "Courier, return label or tracking issue",
      "Despatched",
      22,
      "Standard",
      "u1",
      "Amma Mensah",
      "Resolved",
      -9,
      "Applicant is asking for tracking details.",
      "Yaw",
      "Boateng",
      "1979-07-21"
    ),
    make(
      "q4",
      "GVWE2026040006102",
      "Incomplete or cancelled application",
      "Incomplete",
      4,
      "Standard",
      "u2",
      "Doreen Grant",
      "Unresolved",
      -19,
      "Applicant provided return label late and application is incomplete.",
      "Akua",
      "Asante",
      "1994-02-18",
      ["return-label.pdf"]
    ),
  ];
}
