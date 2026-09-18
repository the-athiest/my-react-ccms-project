import React from 'react';
import { getStatusBadgeClass } from '../utils/complaintUtils';

const StatusBadge = ({ status }) => {
  if (!status) return null;
  const badgeClass = getStatusBadgeClass(status);
  
  return (
    <span className={`status-badge ${badgeClass}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
