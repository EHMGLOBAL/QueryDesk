export default function Notice({ notice, onDismiss }) {
  if (!notice) return null;

  return (
    <div className="mx-auto mt-4 max-w-7xl px-4 lg:px-8">
      <div className="rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-900 ring-1 ring-amber-200">
        <div className="flex items-start justify-between gap-4">
          <p>{notice}</p>
          <button onClick={onDismiss} className="shrink-0 rounded-lg bg-amber-100 px-2 py-1 text-xs font-bold text-amber-900">
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
