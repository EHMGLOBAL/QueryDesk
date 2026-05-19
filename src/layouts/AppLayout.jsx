import Badge from "../components/Badge.jsx";
import Notice from "../components/Notice.jsx";
import { NAV } from "../data/constants.js";
import { cn } from "../utils/helpers.js";

export default function AppLayout({ children, sessionUser, permissions, page, current, notice, goto, resetDemo, logout, dismissNotice }) {
  const visibleNav = NAV.filter(([key]) => permissions.nav.includes(key));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-[#f6f9fc] to-blue-50 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white/90 p-5 backdrop-blur lg:block">
          <div className="rounded-3xl bg-blue-600 p-5 text-white shadow-xl shadow-blue-600/20">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-xl font-black ring-1 ring-white/20">
              QD
            </div>
            <p className="mt-4 text-lg font-bold">QueryDesk</p>
            <p className="text-sm text-blue-100">Raise. Link. Resolve.</p>
          </div>

          <nav className="mt-5 space-y-1">
            {visibleNav.map(([key, label]) => (
              <button
                key={key}
                onClick={() => goto(key)}
                className={cn(
                  "flex w-full rounded-2xl px-4 py-3 text-sm font-semibold",
                  page === key && !current ? "bg-blue-50 text-blue-700 shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                )}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="mt-8 rounded-3xl bg-blue-50 p-4 text-blue-900 ring-1 ring-blue-100">
            <p className="font-bold">Logged in as</p>
            <p className="mt-1 text-sm leading-6">
              {sessionUser.name}
              <br />
              {sessionUser.role}
            </p>
          </div>
        </aside>

        <main className="flex-1">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-4 py-4 shadow-sm backdrop-blur lg:px-8">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <select value={page} onChange={(event) => goto(event.target.value)} className="rounded-xl border px-3 py-2.5 text-sm lg:hidden">
                {visibleNav.map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>

              <div>
                <p className="text-sm font-semibold text-slate-500">Welcome back,</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <p className="text-xl font-bold text-slate-950">{sessionUser.name}</p>
                  <Badge t={sessionUser.level === "coordinator" ? "blue" : sessionUser.level === "supervisor" ? "purple" : "slate"}>
                    {sessionUser.role}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={resetDemo} className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-700 ring-1 ring-slate-200">
                  Reset demo
                </button>
                <button onClick={logout} className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white">
                  Logout
                </button>
              </div>
            </div>
          </header>

          <Notice notice={notice} onDismiss={dismissNotice} />
          <div key={current ? current.id : page} className="mx-auto max-w-7xl p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
