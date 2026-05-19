export default function Header({ title, desc }) {
  return (
    <div>
      <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 ring-1 ring-blue-100">
        <span className="h-2 w-2 rounded-full bg-blue-600" />
        Internal query management
      </div>
      <h1 className="mt-4 text-4xl font-medium tracking-tight text-slate-950">{title}</h1>
      <p className="mt-2 max-w-3xl text-base leading-7 text-slate-500">{desc}</p>
    </div>
  );
}
