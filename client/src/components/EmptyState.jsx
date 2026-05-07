import React from 'react';
import { Link } from 'react-router-dom';

const EmptyState = ({ icon = '📭', title, subtitle, actionLabel, actionTo }) => {
  return (
    <div className="glass-panel empty-state">
      <div className="empty-icon">{icon}</div>
      <div className="empty-title">{title}</div>
      {subtitle && <div className="empty-subtitle">{subtitle}</div>}
      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn btn-primary">{actionLabel}</Link>
      )}
    </div>
  );
};

export default EmptyState;
