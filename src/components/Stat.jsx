import { cn } from "../utils/helpers.js";
import { tone } from "../utils/queryRules.js";
import Card from "./Card.jsx";

export default function Stat({ title, value, note, t = "blue" }) {
  return (
    <Card>
      <div className="flex items-center gap-4">
        <div className={cn("grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-xl font-black ring-1", tone(t))}>
          {String(title).slice(0, 1)}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
          <p className={cn("mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1", tone(t))}>{note}</p>
        </div>
      </div>
    </Card>
  );
}
