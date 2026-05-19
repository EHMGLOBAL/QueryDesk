export const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

export const isoDate = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export const localDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
};

export const startDay = (date) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

export const fmtDate = (value) => {
  const date = typeof value === "string" && value.length === 10 ? localDate(value) : new Date(value);
  return date && !Number.isNaN(date.getTime())
    ? new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date)
    : "Not provided";
};

export const fmtTime = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not provided"
    : new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
};

export function daysUntil(date, ref = new Date()) {
  const target = localDate(date);
  return target ? Math.ceil((startDay(target) - startDay(ref)) / 86400000) : null;
}

export function businessDays(start, end = new Date()) {
  let current = startDay(start);
  const finish = startDay(end);
  let count = 0;

  if (Number.isNaN(current.getTime()) || Number.isNaN(finish.getTime()) || current > finish) return 0;

  while (current <= finish) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) count += 1;
    current.setDate(current.getDate() + 1);
  }

  return count;
}
