export function Field({ label, value, set, type = "text", required = false }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold">
        {label}
        {required && <span className="text-rose-600"> *</span>}
      </span>
      <input type={type} value={value} onChange={(event) => set(event.target.value)} className="input" />
    </label>
  );
}

export function Sel({ label, value, set, opts, required = false, disabled = false }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold">
        {label}
        {required && <span className="text-rose-600"> *</span>}
      </span>
      <select
        value={value}
        onChange={(event) => set(event.target.value)}
        disabled={disabled}
        className="input disabled:bg-slate-100 disabled:text-slate-500"
      >
        {opts.map((option, index) => (
          <option key={`${option}-${index}`} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
