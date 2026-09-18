import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, 
  FiMapPin, 
  FiCalendar, 
  FiTag, 
  FiThumbsUp, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiShield, 
  FiSave,
  FiRotateCcw,
  FiHelpCircle
} from 'react-icons/fi';
import { getComplaintById, updateComplaint } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import ComplaintTimeline from '../components/ComplaintTimeline';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import { useStaff } from '../context/StaffContext';
import { 
  STATUSES, 
  DEPARTMENTS, 
  PRIORITIES, 
  getPriorityBadgeClass 
} from '../utils/complaintUtils';
import { formatDate, getCurrentDateFormatted, getCurrentTimeFormatted } from '../utils/dateUtils';

const ComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isStaffMode } = useStaff();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Staff Form state
  const [staffStatus, setStaffStatus] = useState('');
  const [staffDepartment, setStaffDepartment] = useState('');
  const [staffPriority, setStaffPriority] = useState('');
  const [staffResolutionNote, setStaffResolutionNote] = useState('');
  const [staffSaveSuccess, setStaffSaveSuccess] = useState(false);

  useEffect(() => {
    fetchComplaintDetails();
  }, [id]);

  const fetchComplaintDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplaintById(id);
      setComplaint(data);
      setStaffStatus(data.status);
      setStaffDepartment(data.department || 'General Administration');
      setStaffPriority(data.priority || 'Medium');
      setStaffResolutionNote(data.resolutionNote || '');
    } catch (err) {
      console.error('Error fetching complaint details:', err);
      setError(`Complaint with ID "${id}" could not be found.`);
    } finally {
      setLoading(false);
    }
  };

  const handleSupport = async () => {
    if (isSupported || !complaint) return;
    try {
      setActionLoading(true);
      const updated = {
        ...complaint,
        supportCount: (complaint.supportCount || 0) + 1
      };
      const result = await updateComplaint(complaint.id, updated);
      setComplaint(result);
      setIsSupported(true);
    } catch (err) {
      console.error('Failed to support complaint:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Resolution Verification: "Yes, Issue Resolved"
  const handleVerifyResolved = async () => {
    if (!complaint) return;
    try {
      setActionLoading(true);
      const currentDate = getCurrentDateFormatted();
      const currentTime = getCurrentTimeFormatted();

      const newActivity = [
        ...(complaint.activity || []),
        {
          id: (complaint.activity?.length || 0) + 1,
          action: 'Resolution verified and confirmed by student',
          date: currentDate,
          time: currentTime
        }
      ];

      const updated = {
        ...complaint,
        status: 'Verified',
        activity: newActivity
      };

      const result = await updateComplaint(complaint.id, updated);
      setComplaint(result);
      setStaffStatus('Verified');
    } catch (err) {
      console.error('Failed to verify resolution:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Resolution Verification: "Still Facing the Issue"
  const handleReopenIssue = async () => {
    if (!complaint) return;
    try {
      setActionLoading(true);
      const currentDate = getCurrentDateFormatted();
      const currentTime = getCurrentTimeFormatted();

      const newActivity = [
        ...(complaint.activity || []),
        {
          id: (complaint.activity?.length || 0) + 1,
          action: 'Complaint reopened after student verification. Problem reported as persisting.',
          date: currentDate,
          time: currentTime
        }
      ];

      const updated = {
        ...complaint,
        status: 'Reopened',
        activity: newActivity
      };

      const result = await updateComplaint(complaint.id, updated);
      setComplaint(result);
      setStaffStatus('Reopened');
    } catch (err) {
      console.error('Failed to reopen issue:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Staff Mode: Apply administrative updates
  const handleStaffUpdate = async (e) => {
    e.preventDefault();
    if (!complaint) return;

    try {
      setActionLoading(true);
      setStaffSaveSuccess(false);

      const currentDate = getCurrentDateFormatted();
      const currentTime = getCurrentTimeFormatted();
      const activities = [...(complaint.activity || [])];

      let actionDesc = '';
      if (staffStatus !== complaint.status && staffDepartment !== complaint.department) {
        actionDesc = `Status updated to "${staffStatus}" and assigned to "${staffDepartment}" by staff`;
      } else if (staffStatus !== complaint.status) {
        actionDesc = `Status updated to "${staffStatus}" by staff`;
      } else if (staffDepartment !== complaint.department) {
        actionDesc = `Reassigned to "${staffDepartment}" by staff`;
      } else if (staffPriority !== complaint.priority) {
        actionDesc = `Priority adjusted to "${staffPriority}" by staff`;
      } else if (staffResolutionNote && staffResolutionNote !== complaint.resolutionNote) {
        actionDesc = 'Staff added resolution and investigation notes';
      } else {
        actionDesc = 'Complaint administrative records updated by staff';
      }

      activities.push({
        id: activities.length + 1,
        action: actionDesc,
        date: currentDate,
        time: currentTime
      });

      const updated = {
        ...complaint,
        status: staffStatus,
        department: staffDepartment,
        priority: staffPriority,
        resolutionNote: staffResolutionNote,
        activity: activities
      };

      const result = await updateComplaint(complaint.id, updated);
      setComplaint(result);
      setStaffSaveSuccess(true);
      setTimeout(() => setStaffSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Staff update failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <Loading message={`Loading complaint details for ${id}...`} />;
  }

  if (error || !complaint) {
    return (
      <EmptyState
        title="Complaint Not Found"
        description={error || `No record matches the ID "${id}".`}
        actionText="Back to Complaints"
        actionLink="/my-complaints"
      />
    );
  }

  const priorityClass = getPriorityBadgeClass(complaint.priority);
  const isResolved = complaint.status === 'Resolved';

  return (
    <div className="details-container animate-fade-in">
      <div>
        <Link to="/my-complaints" className="back-link">
          <FiArrowLeft aria-hidden="true" />
          <span>Back to Complaints Repository</span>
        </Link>
      </div>

      <div className="details-grid">
        {/* Main Column */}
        <div className="details-main">
          <div className="details-header">
            <div className="details-id-row">
              <span className="complaint-id" style={{ fontSize: '1rem' }}>
                {complaint.id}
              </span>
              <div className="complaint-card-badges">
                <span className={`priority-badge ${priorityClass}`}>
                  {complaint.priority} Priority
                </span>
                <StatusBadge status={complaint.status} />
              </div>
            </div>

            <h1 className="details-title">{complaint.title}</h1>

            <div className="details-meta-row">
              <span className="category-badge">
                <FiTag aria-hidden="true" />
                {complaint.category}
              </span>
              <span className="meta-item">
                <FiMapPin aria-hidden="true" />
                {complaint.location}
              </span>
              <span className="meta-item">
                <FiCalendar aria-hidden="true" />
                Reported {formatDate(complaint.reportedDate)}
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="details-section-title">Issue Description</h3>
            <p className="details-description-text">{complaint.description}</p>
          </div>

          {/* Image Attachment */}
          {complaint.image && (
            <div>
              <h3 className="details-section-title">Attached Evidence</h3>
              <div className="complaint-image-wrapper">
                <img
                  src={complaint.image}
                  alt={`Evidence for ${complaint.title}`}
                  className="complaint-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}

          {/* Resolution Verification Widget (Only shown if status is Resolved) */}
          {isResolved && (
            <div className="resolution-verify-box animate-fade-in">
              <div className="verify-box-header">
                <FiHelpCircle aria-hidden="true" />
                <span>Resolution Verification Required</span>
              </div>
              <p className="verify-box-desc">
                Facilities staff has marked this complaint as resolved. As a member of the campus community, please confirm if the issue is completely fixed.
              </p>
              <div className="verify-actions">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleVerifyResolved}
                  disabled={actionLoading}
                >
                  <FiCheckCircle aria-hidden="true" />
                  Yes, Issue Resolved
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleReopenIssue}
                  disabled={actionLoading}
                  style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                >
                  <FiRotateCcw aria-hidden="true" />
                  Still Facing the Issue
                </button>
              </div>
            </div>
          )}

          {/* Activity Timeline */}
          <ComplaintTimeline
            activity={complaint.activity || []}
            resolutionNote={complaint.resolutionNote}
          />
        </div>

        {/* Sidebar Column */}
        <aside className="details-sidebar">
          {/* Support Widget */}
          <div className="sidebar-card">
            <h3 className="sidebar-card-title">Student Impact</h3>
            <div className="sidebar-info-row">
              <span className="sidebar-label">Community Support</span>
              <span className="sidebar-value" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                {complaint.supportCount || 0} Students Affected
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Supporting this issue elevates its priority on the Campus Pulse board.
            </p>
            <button
              type="button"
              className={`btn ${isSupported ? 'btn-secondary' : 'btn-primary'}`}
              onClick={handleSupport}
              disabled={isSupported || actionLoading}
              style={{ width: '100%' }}
            >
              <FiThumbsUp aria-hidden="true" />
              {isSupported ? 'Supported by You' : 'Support This Issue'}
            </button>
          </div>

          {/* Assignment & Department Card */}
          <div className="sidebar-card">
            <h3 className="sidebar-card-title">Routing & Department</h3>
            <div className="sidebar-info-row">
              <span className="sidebar-label">Assigned Department</span>
              <span className="sidebar-value">{complaint.department || 'General Administration'}</span>
            </div>
            <div className="sidebar-info-row">
              <span className="sidebar-label">Current Stage</span>
              <span className="sidebar-value">{complaint.status}</span>
            </div>
            <div className="sidebar-info-row">
              <span className="sidebar-label">Logged On</span>
              <span className="sidebar-value">{formatDate(complaint.reportedDate)}</span>
            </div>
          </div>

          {/* Staff Control Panel (Visible when Staff Mode is toggled ON) */}
          {isStaffMode && (
            <div className="staff-control-card animate-fade-in">
              <div className="staff-control-title">
                <FiShield aria-hidden="true" />
                <span>Staff Control Panel</span>
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                Directly manage complaint assignment, workflow stage, and resolution notes.
              </p>

              {staffSaveSuccess && (
                <div style={{ fontSize: '0.825rem', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <FiCheckCircle aria-hidden="true" />
                  <span>Timeline and status updated successfully.</span>
                </div>
              )}

              <form onSubmit={handleStaffUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="staffStatus">Lifecycle Status</label>
                  <select
                    id="staffStatus"
                    className="form-select"
                    value={staffStatus}
                    onChange={(e) => setStaffStatus(e.target.value)}
                  >
                    {STATUSES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="staffDepartment">Assigned Department</label>
                  <select
                    id="staffDepartment"
                    className="form-select"
                    value={staffDepartment}
                    onChange={(e) => setStaffDepartment(e.target.value)}
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="staffPriority">Priority</label>
                  <select
                    id="staffPriority"
                    className="form-select"
                    value={staffPriority}
                    onChange={(e) => setStaffPriority(e.target.value)}
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p.level} value={p.level}>{p.level}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="staffResolutionNote">Resolution / Investigation Note</label>
                  <textarea
                    id="staffResolutionNote"
                    className="form-textarea"
                    rows={3}
                    placeholder="Enter diagnostic details, parts ordered, or work completed..."
                    value={staffResolutionNote}
                    onChange={(e) => setStaffResolutionNote(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={actionLoading}
                  style={{ marginTop: '0.5rem', width: '100%' }}
                >
                  <FiSave aria-hidden="true" />
                  {actionLoading ? 'Saving Changes...' : 'Save Staff Updates'}
                </button>
              </form>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default ComplaintDetails;
