import React from "react";
function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(" ");
}

const inputBaseStyles =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400 placeholder:text-slate-400";

interface FieldWrapperProps {
  label?: string;
  helperText?: React.ReactNode;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}

export function AdminField({ label, helperText, htmlFor, className, children }: FieldWrapperProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      {children}
      {helperText && <p className="text-xs text-slate-500">{helperText}</p>}
    </div>
  );
}

export const AdminInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return <input ref={ref} className={cn(inputBaseStyles, className)} {...props} />;
  }
);
AdminInput.displayName = "AdminInput";

export const AdminTextarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return <textarea ref={ref} className={cn(inputBaseStyles, className)} {...props} />;
  }
);
AdminTextarea.displayName = "AdminTextarea";

export const AdminSelect = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => {
    return <select ref={ref} className={cn(inputBaseStyles, className)} {...props} />;
  }
);
AdminSelect.displayName = "AdminSelect";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: React.ReactNode;
  description?: React.ReactNode;
}

export const AdminCheckbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, ...props }, ref) => {
    return (
      <label className={cn("flex items-start gap-3 select-none", props.disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer")}>
        <div className="flex h-5 items-center mt-0.5">
          <input
            type="checkbox"
            ref={ref}
            className={cn(
              "h-4 w-4 rounded border-slate-300 text-blue-600 shadow-sm focus:ring-blue-500",
              className
            )}
            {...props}
          />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-slate-900">{label}</span>
          {description && <span className="text-xs text-slate-500">{description}</span>}
        </div>
      </label>
    );
  }
);
AdminCheckbox.displayName = "AdminCheckbox";
