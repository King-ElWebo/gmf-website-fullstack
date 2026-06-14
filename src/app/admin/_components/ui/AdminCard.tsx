import React from "react";
function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(" ");
}

interface AdminCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  headerAction?: React.ReactNode;
}

export function AdminCard({
  title,
  description,
  headerAction,
  children,
  className,
  ...props
}: AdminCardProps) {
  return (
    <section
      className={cn(
        "rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6",
        className
      )}
      {...props}
    >
      {(title || description || headerAction) && (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {title && <h2 className="text-lg font-semibold text-slate-900">{title}</h2>}
            {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div>{children}</div>
    </section>
  );
}
