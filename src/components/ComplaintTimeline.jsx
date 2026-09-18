import React from 'react';
import { FiClock, FiActivity } from 'react-icons/fi';
import { formatDate } from '../utils/dateUtils';

const ComplaintTimeline = ({ activity = [], resolutionNote = '' }) => {
  if (!activity || activity.length === 0) {
    return (
      <div className="timeline-container">
        <h4 className="timeline-title">
          <FiActivity aria-hidden="true" />
          Activity Trail
        </h4>
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>No activity records logged yet.</p>
      </div>
    );
  }

  return (
    <div className="timeline-container">
      <div className="timeline-header">
        <h4 className="timeline-title">
          <FiActivity aria-hidden="true" />
          Activity Trail
        </h4>
        <span className="timeline-badge">{activity.length} Updates</span>
      </div>

      <ol className="timeline-list">
        {activity.map((item, index) => {
          const isLatest = index === activity.length - 1;
          return (
            <li key={item.id || index} className="timeline-item">
              <div className="timeline-dot" aria-hidden="true" />
              <div className="timeline-meta">
                <span>{formatDate(item.date)}</span>
                {item.time && <span>• {item.time}</span>}
              </div>
              <div className="timeline-action">{item.action}</div>
              {isLatest && resolutionNote && (
                <div className="timeline-note">
                  <strong>Resolution Details:</strong> {resolutionNote}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default ComplaintTimeline;
