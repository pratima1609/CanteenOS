import React from 'react';

const statusMap = {
  pending: { label: 'Pending', className: 'badge-warning' },
  approved: { label: 'Approved', className: 'badge-success' },
  rejected: { label: 'Rejected', className: 'badge-danger' },
  received: { label: 'Received', className: 'badge-primary' },
  accepted: { label: 'Accepted', className: 'badge-teal' },
  preparing: { label: 'Preparing', className: 'badge-teal', live: true },
  ready: { label: 'Ready', className: 'badge-success', live: true },
  picked_up: { label: 'Picked Up', className: 'badge-secondary' },
  cancelled: { label: 'Cancelled', className: 'badge-danger' },
  complete: { label: 'Complete', className: 'badge-success' },
  active: { label: 'Active', className: 'badge-success', live: true },
  open: { label: 'Open', className: 'badge-success', live: true },
  closed: { label: 'Closed', className: 'badge-secondary' },
  suspended: { label: 'Suspended', className: 'badge-danger' },
};

const StatusBadge = ({ status, label: customLabel }) => {
  const key = (status || '').toLowerCase().replace(/\s+/g, '_');
  const config = statusMap[key] || { label: status, className: 'badge-secondary' };
  const displayLabel = customLabel || config.label;

  return (
    <span className={`badge ${config.className}`}>
      {config.live && <span className="pulse-dot" />}
      {displayLabel}
    </span>
  );
};

export default StatusBadge;
