import React from "react";
import { AdminButton } from "./ui/AdminButton";
import { Plus } from "lucide-react";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  action?: {
    href?: string;
    label: string;
    onClick?: () => void;
  };
}

export function AdminPageHeader({
  title,
  description,
  eyebrow,
  action,
}: AdminPageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        {eyebrow && <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">{eyebrow}</span>}
        <h1 className="text-2xl font-bold text-slate-900 mt-1">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-500 max-w-2xl">{description}</p>}
      </div>

      {action && (
        <AdminButton
          href={action.href}
          onClick={action.onClick}
          className="w-full sm:w-auto"
        >
          <Plus size={16} />
          {action.label}
        </AdminButton>
      )}
    </div>
  );
}

export default AdminPageHeader;
