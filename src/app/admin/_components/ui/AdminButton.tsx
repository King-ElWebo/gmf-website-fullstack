import React from "react";
import Link from "next/link";

function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(" ");
}

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "icon";

type ButtonSize = "default" | "sm" | "lg";

interface AdminButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  asChild?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-blue-600 text-white shadow-sm hover:bg-blue-700 disabled:bg-blue-300",
  secondary:
    "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:bg-slate-50 disabled:text-slate-400",
  danger:
    "border border-red-200 bg-white text-red-600 hover:bg-red-50 disabled:opacity-60",
  ghost:
    "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  icon:
    "h-8 w-8 p-0 text-slate-500 hover:bg-slate-100 hover:text-slate-900 rounded-lg flex items-center justify-center",
};

const sizeStyles: Record<ButtonSize, string> = {
  default: "px-4 py-2.5",
  sm: "px-3 py-1.5 text-xs",
  lg: "px-6 py-3 text-base",
};

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-colors disabled:cursor-not-allowed";

export const AdminButton = React.forwardRef<HTMLButtonElement, AdminButtonProps>(
  ({ className, variant = "primary", size = "default", href, ...props }, ref) => {
    const compClassName = cn(
      variant !== "icon" ? baseStyles : variantStyles.icon,
      variant !== "icon" && variantStyles[variant],
      variant !== "icon" && sizeStyles[size],
      className
    );

    if (href) {
      return (
        <Link href={href} className={compClassName}>
          {props.children}
        </Link>
      );
    }

    return <button ref={ref} className={compClassName} {...props} />;
  }
);

AdminButton.displayName = "AdminButton";
