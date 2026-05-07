import React from 'react';

const Skeleton = ({ variant = 'text', width, height, count = 1, style = {} }) => {
  const base = { width, height, ...style };

  const items = Array.from({ length: count }, (_, i) => (
    <div key={i} className={`skeleton skeleton-${variant}`} style={base} />
  ));

  return count === 1 ? items[0] : <div className="flex flex-col gap-2">{items}</div>;
};

export const SkeletonCard = () => (
  <div className="glass-card no-hover" style={{ padding: '20px' }}>
    <Skeleton variant="card" height="120px" style={{ marginBottom: '16px' }} />
    <Skeleton variant="title" />
    <Skeleton variant="text" />
    <Skeleton variant="text" width="50%" />
  </div>
);

export const SkeletonRow = ({ cols = 4 }) => (
  <tr>
    {Array.from({ length: cols }, (_, i) => (
      <td key={i} style={{ padding: '14px 16px' }}>
        <Skeleton variant="text" width={i === 0 ? '80%' : '60%'} />
      </td>
    ))}
  </tr>
);

export default Skeleton;
