import { useState } from "react";
import { PERMISSIONS, USERS } from "../data/constants.js";
import Card from "../components/Card.jsx";

export default function LoginPage({ onLogin }) {
  const [userId, setUserId] = useState(USERS[0].id);
  const [pin, setPin] = useState("agent123");
  const [error, setError] = useState("");
  const selected = USERS.find((user) => user.id === userId) || USERS[0];

  const submit = (event) => {
    event.preventDefault();
    if (pin !== selected.pin) {
      setError("Invalid PIN for the selected user level.");
      return;
    }

    setError("");
    onLogin(selected);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-white p-6 text-slate-900">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1fr_420px]">
        <div>
          <div className="inline-grid h-16 w-16 place-items-center rounded-3xl bg-blue-600 text-2xl font-black text-white shadow-xl shadow-blue-600/20">
            QD
          </div>
          <h1 className="mt-8 text-5xl font-black tracking-tight">QueryDesk</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            A working ticketing and query management system with role-based login, parent/child queries, SLA tracking,
            urgency rules, comments, CSV export and access controls.
          </p>
          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {USERS.map((user) => (
              <Card key={user.id} className="shadow-none">
                <p className="font-bold">{user.role}</p>
                <p className="mt-1 text-sm text-slate-500">
                  Demo PIN: <span className="font-mono font-bold text-slate-800">{user.pin}</span>
                </p>
              </Card>
            ))}
          </div>
        </div>

        <Card>
          <form onSubmit={submit} className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold">Sign in</h2>
              <p className="mt-1 text-sm text-slate-500">Choose a user level to see its permissions.</p>
            </div>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold">User level</span>
              <select
                value={userId}
                onChange={(event) => {
                  setUserId(event.target.value);
                  const next = USERS.find((user) => user.id === event.target.value);
                  setPin(next?.pin || "");
                }}
                className="input"
              >
                {USERS.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} - {user.role}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold">PIN</span>
              <input value={pin} onChange={(event) => setPin(event.target.value)} className="input" type="password" />
            </label>
            {error && <p className="rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700 ring-1 ring-rose-200">{error}</p>}
            <button className="w-full rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700">
              Login as {selected.role}
            </button>
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 ring-1 ring-slate-200">
              <p className="font-bold text-slate-900">Permissions</p>
              <p className="mt-1">
                {PERMISSIONS[selected.level].scope === "all" ? "Can view all queries." : "Can view owned or assigned queries only."}
              </p>
              <p>
                {PERMISSIONS[selected.level].canChangeStatus
                  ? "Can change QueryDesk ticket and ECIMS application statuses."
                  : "Cannot change QueryDesk ticket or ECIMS application statuses."}
              </p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
