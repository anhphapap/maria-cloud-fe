import { cn } from "../../lib/utils";

export default function Card({ children, className, ...props }) {
  return (
    <div
      className={cn(
        "bg-slate-800/40 border border-slate-700/50 rounded-xl p-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
