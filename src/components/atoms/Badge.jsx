import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Badge = forwardRef(({ 
  className, 
  variant = "default", 
  children, 
  ...props 
}, ref) => {
  const variants = {
    default: "bg-slate-100 text-slate-700",
    scheduled: "bg-blue-100 text-blue-700 border border-blue-200",
    progress: "bg-orange-100 text-orange-700 border border-orange-200",
    completed: "bg-green-100 text-green-700 border border-green-200",
    paid: "bg-emerald-100 text-emerald-700 border border-emerald-200"
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
        variants[variant],
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </span>
  );
});

Badge.displayName = "Badge";

export default Badge;