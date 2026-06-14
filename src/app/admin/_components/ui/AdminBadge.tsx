import React from "react";
function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(" ");
}

type BadgeVariant = "green" | "blue" | "red" | "yellow" | "gray";

interface AdminBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  green: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
  blue: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20",
  red: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10",
  yellow: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
  gray: "bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-500/10",
};

export function AdminBadge({ variant = "gray", className, children, ...props }: AdminBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
