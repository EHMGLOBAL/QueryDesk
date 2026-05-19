import { cn } from "../utils/helpers.js";

export default function Card({ children, className = "" }) {
  return (
    <div className={cn("rounded-[1.5rem] bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.06)] ring-1 ring-slate-200/90", className)}>
      {children}
    </div>
  );
}
