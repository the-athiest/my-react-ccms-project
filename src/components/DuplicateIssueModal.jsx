import React from 'react';
import { FiAlertTriangle, FiExternalLink, FiCheck, FiX } from 'react-icons/fi';
import StatusBadge from './StatusBadge';
import { getRelativeTime } from '../utils/dateUtils';

const DuplicateIssueModal = ({ duplicates = [], onProceed, onViewExisting, onCancel }) => {
  if (!duplicates || duplicates.length === 0) return null;

  const topMatch = duplicates[0];

  return (
    <div className="modal-backdrop animate-fade-in" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-header">
          <FiAlertTriangle className="modal-icon" aria-hidden="true" />
          <div>
            <h3 className="modal-title">Potential Duplicate Issue Detected</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              A similar issue has already been reported and is currently active. Supporting an existing issue helps prioritize it for resolution.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Existing Active Complaint ({topMatch.id}):
          </span>

          <div className="duplicate-match-item">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
              <span className="duplicate-match-title">{topMatch.title}</span>
              <StatusBadge status={topMatch.status} />
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {topMatch.description}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
              <span>Location: {topMatch.location}</span>
              <span>Reported: {getRelativeTime(topMatch.reportedDate)} • {topMatch.supportCount || 0} students affected</span>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            <FiX aria-hidden="true" />
            Back to Edit
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => onViewExisting(topMatch.id)}
            style={{ color: 'var(--accent)', borderColor: 'var(--accent-light)' }}
          >
            <FiExternalLink aria-hidden="true" />
            View Existing Issue
          </button>

          <button type="button" className="btn btn-primary" onClick={onProceed}>
            <FiCheck aria-hidden="true" />
            Submit Anyway
          </button>
        </div>
      </div>
    </div>
  );
};

export default DuplicateIssueModal;
