import React from "react";
function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(" ");
}

export function AdminTable({ children, className }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto rounded-[24px] border border-slate-200 bg-white shadow-sm">
      <table className={cn("min-w-full divide-y divide-slate-200 text-sm", className)}>
        {children}
      </table>
    </div>
  );
}

export function AdminTableHead({ children, className }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={cn("bg-slate-50/80 text-left text-slate-500", className)}>
      {children}
    </thead>
  );
}

export function AdminTableRow({ children, className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={cn("transition-colors hover:bg-slate-50/50 group", className)} {...props}>
      {children}
    </tr>
  );
}

export function AdminTableHeader({ children, className }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={cn("px-4 py-3.5 font-medium whitespace-nowrap", className)}>
      {children}
    </th>
  );
}

export function AdminTableCell({ children, className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn("px-4 py-3.5 align-middle border-t border-slate-100", className)} {...props}>
      {children}
    </td>
  );
}

export function AdminTableEmpty({ colSpan, children }: { colSpan: number; children: React.ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center text-slate-500 border-t border-slate-100">
        {children}
      </td>
    </tr>
  );
}
