export default function DashboardIcon({ type, colour = "blue" }) {
  const stroke =
    {
      blue: "#2563eb",
      amber: "#f97316",
      green: "#10b981",
      red: "#e11d48",
      slate: "#64748b",
    }[colour] || "#2563eb";
  const common = { fill: "none", stroke, strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round" };

  if (type === "urgent") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
        <circle cx="12" cy="12" r="9" {...common} />
        <path d="M12 7v6" {...common} />
        <path d="M12 17h.01" {...common} />
      </svg>
    );
  }

  if (type === "shield") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
        <path d="M12 3l7 3v5c0 5-3.2 8.4-7 10-3.8-1.6-7-5-7-10V6l7-3z" {...common} />
      </svg>
    );
  }

  if (type === "lock") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
        <rect x="5" y="10" width="14" height="10" rx="2" {...common} />
        <path d="M8 10V8a4 4 0 018 0v2" {...common} />
        <path d="M12 14v2" {...common} />
      </svg>
    );
  }

  if (type === "check") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
        <circle cx="12" cy="12" r="9" {...common} />
        <path d="M8 12.5l2.5 2.5L16 9" {...common} />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
      <rect x="7" y="4" width="10" height="16" rx="2" {...common} />
      <path d="M9 8h6M9 12h6M9 16h4" {...common} />
      <path d="M10 3h4" {...common} />
    </svg>
  );
}
