import { cn } from "../../lib/utils";

export default function Input({ className, type = "text", ...props }) {
  return (
    <input
      type={type}
      className={cn(
        "w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700",
        "text-slate-200 placeholder-slate-500",
        "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent",
        "transition-all duration-200",
        className
      )}
      {...props}
    />
  );
}
