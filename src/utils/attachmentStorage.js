import { uid } from "./helpers.js";

const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
const ACCEPTED_TYPES = new Map([
  ["image/jpeg", "Image"],
  ["image/png", "Image"],
  ["application/pdf", "PDF"],
]);
const EXTENSION_TYPES = new Map([
  ["jpg", { mimeType: "image/jpeg", category: "Image" }],
  ["jpeg", { mimeType: "image/jpeg", category: "Image" }],
  ["png", { mimeType: "image/png", category: "Image" }],
  ["pdf", { mimeType: "application/pdf", category: "PDF" }],
]);

function extensionFor(fileName = "") {
  return fileName.split(".").pop()?.toLowerCase() || "";
}

function getFileType(file) {
  const fromMime = ACCEPTED_TYPES.get(file.type);
  if (fromMime) return { mimeType: file.type, category: fromMime };
  return EXTENSION_TYPES.get(extensionFor(file.name)) || null;
}

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read the selected file."));
    reader.readAsDataURL(file);
  });
}

export function validateAttachment(file) {
  const type = getFileType(file);

  if (!type) {
    return { valid: false, error: "Accepted files are JPG, PNG or PDF only." };
  }
  if (file.size > MAX_ATTACHMENT_BYTES) {
    return { valid: false, error: "Each file must be 10MB or smaller." };
  }

  return { valid: true, ...type };
}

export async function fileToAttachment(file, currentUser) {
  const validation = validateAttachment(file);
  if (!validation.valid) throw new Error(validation.error);

  return {
    id: uid("att"),
    name: file.name,
    mimeType: validation.mimeType,
    size: file.size,
    category: validation.category,
    uploadedAt: new Date().toISOString(),
    uploadedBy: currentUser.name,
    uploadedById: currentUser.id,
    storageMode: "local-prototype",
    url: null,
    // Prototype only: storing file data URLs in localStorage is for frontend testing.
    // Production should upload files to server storage, store metadata plus a secure
    // file path or URL in the database, and serve downloads through authenticated
    // backend routes instead of exposing public attachment links.
    dataUrl: await readAsDataUrl(file),
  };
}

export function normaliseAttachment(attachment) {
  if (typeof attachment === "string") {
    return {
      id: uid("legacy-att"),
      name: attachment,
      mimeType: "",
      size: 0,
      category: "File",
      uploadedAt: null,
      uploadedBy: "Unknown",
      storageMode: "legacy",
      url: null,
      dataUrl: null,
    };
  }

  return {
    id: attachment.id || uid("att"),
    name: attachment.name || "Attachment",
    mimeType: attachment.mimeType || "",
    size: Number(attachment.size || 0),
    category: attachment.category || "File",
    uploadedAt: attachment.uploadedAt || null,
    uploadedBy: attachment.uploadedBy || "Unknown",
    uploadedById: attachment.uploadedById || null,
    storageMode: attachment.storageMode || "local-prototype",
    url: attachment.url || null,
    dataUrl: attachment.dataUrl || null,
  };
}

export function normaliseAttachments(attachments = []) {
  return attachments.map((attachment) => normaliseAttachment(attachment));
}

export function attachmentSource(attachment) {
  return attachment?.dataUrl || attachment?.url || null;
}

export function formatFileSize(size = 0) {
  if (!size) return "Size unavailable";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function isImageAttachment(attachment) {
  return attachment?.category === "Image" || attachment?.mimeType?.startsWith("image/");
}

export function openAttachment(attachment) {
  const source = attachmentSource(attachment);
  if (!source) return false;
  window.open(source, "_blank", "noopener,noreferrer");
  return true;
}

export function downloadAttachment(attachment) {
  const source = attachmentSource(attachment);
  if (!source) return false;

  const link = document.createElement("a");
  link.href = source;
  link.download = attachment.name || "attachment";
  document.body.appendChild(link);
  link.click();
  link.remove();
  return true;
}
