import React from 'react';

export function BookingStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    requested: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    approved: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    cancelled: 'bg-neutral-100 text-neutral-800 border-neutral-200',
    expired: 'bg-neutral-100 text-neutral-600 border-neutral-200',
    completed: 'bg-blue-100 text-blue-800 border-blue-200',
  };
  
  const config = colors[status] || colors.requested;
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold tracking-wide uppercase border shadow-sm ${config}`}>
      {status}
    </span>
  );
}
