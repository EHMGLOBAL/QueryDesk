import { cn } from "../utils/helpers.js";
import { tone } from "../utils/queryRules.js";

export default function Badge({ children, t = "slate" }) {
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1", tone(t))}>{children}</span>;
}
