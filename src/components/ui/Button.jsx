import { cn } from "../../lib/utils";

export default function Button({
  children,
  className,
  variant = "default",
  ...props
}) {
  const variants = {
    default: "bg-emerald-500 text-white hover:bg-emerald-600",
    outline:
      "border border-slate-700 bg-slate-800/50 text-white hover:bg-slate-700",
    ghost: "hover:bg-slate-800",
  };

  return (
    <button
      className={cn(
        "px-4 py-2 rounded-lg font-medium transition-colors duration-200 w-full",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
