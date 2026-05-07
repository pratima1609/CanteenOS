import React from 'react';

const PageWrapper = ({ title, subtitle, actions, children }) => {
  return (
    <div className="page-content page-enter">
      {(title || actions) && (
        <div className="flex justify-between items-center mb-4" style={{ flexWrap: 'wrap', gap: '16px' }}>
          <div>
            {title && <h2>{title}</h2>}
            {subtitle && <p className="text-muted mt-1" style={{ fontSize: '0.9rem' }}>{subtitle}</p>}
          </div>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default PageWrapper;
