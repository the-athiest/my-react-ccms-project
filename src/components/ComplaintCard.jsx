import React from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiClock, FiThumbsUp, FiTag } from 'react-icons/fi';
import StatusBadge from './StatusBadge';
import { getPriorityBadgeClass } from '../utils/complaintUtils';
import { getRelativeTime } from '../utils/dateUtils';

const ComplaintCard = ({ complaint, onSupport, isSupported = false }) => {
  if (!complaint) return null;

  const handleSupportClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onSupport) {
      onSupport(complaint);
    }
  };

  const priorityClass = getPriorityBadgeClass(complaint.priority);

  return (
    <Link to={`/complaint/${complaint.id}`} className="complaint-card animate-fade-in">
      <div className="complaint-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="complaint-id">{complaint.id}</span>
          <span className="category-badge">
            <FiTag aria-hidden="true" />
            {complaint.category}
          </span>
        </div>
        <div className="complaint-card-badges">
          <span className={`priority-badge ${priorityClass}`}>
            {complaint.priority} Priority
          </span>
          <StatusBadge status={complaint.status} />
        </div>
      </div>

      <div>
        <h3 className="complaint-title">{complaint.title}</h3>
        <p className="complaint-description-snippet">{complaint.description}</p>
      </div>

      <div className="complaint-card-footer">
        <div className="complaint-meta-info">
          <span className="meta-item">
            <FiMapPin aria-hidden="true" />
            {complaint.location}
          </span>
          <span className="meta-item">
            <FiClock aria-hidden="true" />
            {getRelativeTime(complaint.reportedDate)}
          </span>
        </div>

        <button
          type="button"
          className={`support-btn-pill ${isSupported ? 'supported' : ''}`}
          onClick={handleSupportClick}
          title="Support this issue to increase visibility"
        >
          <FiThumbsUp aria-hidden="true" />
          <span>{complaint.supportCount || 0} Affected</span>
        </button>
      </div>
    </Link>
  );
};

export default ComplaintCard;
