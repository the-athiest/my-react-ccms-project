import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FiGrid, FiArrowRight, FiCheckCircle, FiClock, FiUsers, FiX, FiExternalLink } from 'react-icons/fi';
import { getComplaints } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import { getRelativeTime, formatDate } from '../utils/dateUtils';
import { getPriorityBadgeClass } from '../utils/complaintUtils';

const BOARD_STAGES = [
  { key: 'Received', label: 'Received', desc: 'Acknowledged by Helpdesk' },
  { key: 'Under Review', label: 'Under Review', desc: 'Inspection & Scoping' },
  { key: 'In Progress', label: 'In Progress', desc: 'Work Order Active' },
  { key: 'Resolved', label: 'Resolution Check', desc: 'Staff Resolved / Awaiting Verification' },
  { key: 'Verified', label: 'Verified', desc: 'Confirmed Fixed by Students' }
];

const ResolutionBoard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  useEffect(() => {
    fetchBoardData();
  }, []);

  const fetchBoardData = async () => {
    try {
      setLoading(true);
      const data = await getComplaints();
      setComplaints(data);
    } catch (err) {
      console.error('Failed to load board data:', err);
      setError('Unable to load resolution board data.');
    } finally {
      setLoading(false);
    }
  };

  // Group complaints by stage
  const stageGroups = useMemo(() => {
    const groups = {
      'Received': [],
      'Under Review': [],
      'In Progress': [],
      'Resolved': [],
      'Verified': []
    };

    complaints.forEach((item) => {
      if (item.status === 'Reported' || item.status === 'Received') {
        groups['Received'].push(item);
      } else if (item.status === 'Under Review' || item.status === 'Assigned') {
        groups['Under Review'].push(item);
      } else if (item.status === 'In Progress' || item.status === 'Reopened') {
        groups['In Progress'].push(item);
      } else if (item.status === 'Resolved') {
        groups['Resolved'].push(item);
      } else if (item.status === 'Verified') {
        groups['Verified'].push(item);
      }
    });

    return groups;
  }, [complaints]);

  return (
    <div className="board-container animate-fade-in">
      <div className="section-header">
        <h1 className="section-title">Resolution Workflow Board</h1>
        <p className="section-subtitle">
          Transparent pipeline showing end-to-end progress of campus concerns from initial intake to verified resolution.
        </p>
      </div>

      {loading ? (
        <Loading message="Loading resolution pipeline board..." />
      ) : error ? (
        <EmptyState
          title="Error Loading Board"
          description={error}
          actionText="Retry"
          onActionClick={fetchBoardData}
        />
      ) : (
        <div className="board-columns-grid">
          {BOARD_STAGES.map((stage) => {
            const items = stageGroups[stage.key] || [];
            return (
              <div key={stage.key} className="board-column">
                <div className="board-column-header">
                  <div>
                    <h3 className="board-column-title">{stage.label}</h3>
                    <span style={{ fontSize: '0.725rem', color: 'var(--text-tertiary)' }}>
                      {stage.desc}
                    </span>
                  </div>
                  <span className="board-column-count">{items.length}</span>
                </div>

                <div className="board-cards-list">
                  {items.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem 0.5rem', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                      No items in this stage
                    </div>
                  ) : (
                    items.map((complaint) => (
                      <div
                        key={complaint.id}
                        className="board-mini-card"
                        onClick={() => setSelectedComplaint(complaint)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && setSelectedComplaint(complaint)}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="complaint-id" style={{ fontSize: '0.75rem' }}>{complaint.id}</span>
                          <span className={`priority-badge ${getPriorityBadgeClass(complaint.priority)}`}>
                            {complaint.priority}
                          </span>
                        </div>

                        <h4 className="board-mini-title">{complaint.title}</h4>

                        <div className="board-mini-meta">
                          <span>{complaint.department || 'Unassigned'}</span>
                          <span>{getRelativeTime(complaint.reportedDate)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Complaint Inspection Modal */}
      {selectedComplaint && (
        <div className="modal-backdrop animate-fade-in" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                  <span className="complaint-id">{selectedComplaint.id}</span>
                  <StatusBadge status={selectedComplaint.status} />
                  <span className={`priority-badge ${getPriorityBadgeClass(selectedComplaint.priority)}`}>
                    {selectedComplaint.priority} Priority
                  </span>
                </div>
                <h3 className="modal-title">{selectedComplaint.title}</h3>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedComplaint(null)}
                aria-label="Close modal"
              >
                <FiX aria-hidden="true" />
              </button>
            </div>

            <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)' }}>
              {selectedComplaint.description}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'var(--surface-alt)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div>
                <span className="sidebar-label">Assigned Department</span>
                <p className="sidebar-value">{selectedComplaint.department || 'General Administration'}</p>
              </div>
              <div>
                <span className="sidebar-label">Location</span>
                <p className="sidebar-value">{selectedComplaint.location}</p>
              </div>
              <div>
                <span className="sidebar-label">Time Since Reported</span>
                <p className="sidebar-value">{getRelativeTime(selectedComplaint.reportedDate)} ({formatDate(selectedComplaint.reportedDate)})</p>
              </div>
              <div>
                <span className="sidebar-label">Student Support</span>
                <p className="sidebar-value">{selectedComplaint.supportCount || 0} Affected Students</p>
              </div>
            </div>

            {selectedComplaint.resolutionNote && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>Resolution Note:</span>
                <p style={{ fontSize: '0.875rem', color: '#14532d', marginTop: '0.2rem' }}>{selectedComplaint.resolutionNote}</p>
              </div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedComplaint(null)}
              >
                Close
              </button>
              <Link
                to={`/complaint/${selectedComplaint.id}`}
                className="btn btn-primary"
                onClick={() => setSelectedComplaint(null)}
              >
                <span>Open Full Details & Activity</span>
                <FiExternalLink aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResolutionBoard;
