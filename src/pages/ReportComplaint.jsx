import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlusCircle, FiAlertCircle, FiCheck, FiImage } from 'react-icons/fi';
import { getComplaints, createComplaint } from '../services/api';
import { 
  CATEGORIES, 
  PRIORITIES, 
  findDuplicateComplaints, 
  generateNextComplaintId 
} from '../utils/complaintUtils';
import { getCurrentDateFormatted, getCurrentTimeFormatted } from '../utils/dateUtils';
import DuplicateIssueModal from '../components/DuplicateIssueModal';

const ReportComplaint = () => {
  const navigate = useNavigate();

  const [existingComplaints, setExistingComplaints] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    location: '',
    priority: 'Medium',
    description: '',
    image: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [potentialDuplicates, setPotentialDuplicates] = useState([]);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  useEffect(() => {
    const fetchExisting = async () => {
      try {
        const data = await getComplaints();
        setExistingComplaints(data);
      } catch (err) {
        console.error('Error fetching existing complaints for duplicate detection:', err);
      }
    };
    fetchExisting();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handlePrioritySelect = (level) => {
    setFormData((prev) => ({ ...prev, priority: level }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Please enter a clear, descriptive title for the issue.';
    } else if (formData.title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters long.';
    }

    if (!formData.category) {
      newErrors.category = 'Please select the relevant category.';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Please specify the exact campus location (e.g. Block A, Room 204).';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Please provide a detailed description of the problem.';
    } else if (formData.description.trim().length < 15) {
      newErrors.description = 'Description should be at least 15 characters to assist staff investigation.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Check for potential duplicate complaints
    const duplicates = findDuplicateComplaints(formData, existingComplaints);
    if (duplicates.length > 0) {
      setPotentialDuplicates(duplicates);
      setShowDuplicateModal(true);
    } else {
      executeSubmission();
    }
  };

  const executeSubmission = async () => {
    try {
      setIsSubmitting(true);
      setShowDuplicateModal(false);

      const newId = generateNextComplaintId(existingComplaints);
      const currentDate = getCurrentDateFormatted();
      const currentTime = getCurrentTimeFormatted();

      const newComplaintData = {
        id: newId,
        title: formData.title.trim(),
        category: formData.category,
        location: formData.location.trim(),
        priority: formData.priority,
        description: formData.description.trim(),
        image: formData.image.trim(),
        status: 'Reported',
        department: 'General Administration',
        supportCount: 1,
        reportedDate: currentDate,
        activity: [
          {
            id: 1,
            action: 'Complaint submitted by student',
            date: currentDate,
            time: currentTime
          }
        ],
        resolutionNote: ''
      };

      const created = await createComplaint(newComplaintData);
      navigate(`/complaint/${created.id}`);
    } catch (err) {
      console.error('Failed to submit complaint:', err);
      setErrors((prev) => ({
        ...prev,
        submit: 'Failed to record complaint. Please verify JSON Server is running on port 3000.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewExisting = (id) => {
    setShowDuplicateModal(false);
    navigate(`/complaint/${id}`);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="form-container">
        <div className="form-header">
          <h2>Report a Campus Issue</h2>
          <p style={{ marginTop: '0.4rem' }}>
            Submit an infrastructure, academic, or facility concern. All submissions are logged to the public transparency timeline.
          </p>
        </div>

        {errors.submit && (
          <div
            style={{
              padding: '0.85rem 1rem',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 'var(--radius-md)',
              color: '#991b1b',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem'
            }}
          >
            <FiAlertCircle aria-hidden="true" />
            <span>{errors.submit}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="title">
              Complaint Title <span className="required-mark">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              className={`form-input ${errors.title ? 'input-error' : ''}`}
              placeholder="e.g., Damaged ceiling fan in Room 204"
              value={formData.title}
              onChange={handleChange}
            />
            {errors.title && <span className="field-error-text">{errors.title}</span>}
          </div>

          {/* Category & Location (2-col) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="category">
                Category <span className="required-mark">*</span>
              </label>
              <select
                id="category"
                name="category"
                className={`form-select ${errors.category ? 'input-error' : ''}`}
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && <span className="field-error-text">{errors.category}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="location">
                Exact Location <span className="required-mark">*</span>
              </label>
              <input
                type="text"
                id="location"
                name="location"
                className={`form-input ${errors.location ? 'input-error' : ''}`}
                placeholder="e.g., Block B - 3rd Floor East"
                value={formData.location}
                onChange={handleChange}
              />
              {errors.location && <span className="field-error-text">{errors.location}</span>}
            </div>
          </div>

          {/* Priority Selection with Helper text */}
          <div className="form-group">
            <label className="form-label">
              Priority Level <span className="required-mark">*</span>
            </label>
            <div className="priority-selector-grid">
              {PRIORITIES.map((p) => {
                const isSelected = formData.priority === p.level;
                return (
                  <button
                    key={p.level}
                    type="button"
                    className={`priority-option-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => handlePrioritySelect(p.level)}
                  >
                    <div className="priority-option-header">
                      {p.level} Priority
                    </div>
                    <div className="priority-option-desc">{p.helperText}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="description">
              Detailed Description <span className="required-mark">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              className={`form-textarea ${errors.description ? 'input-error' : ''}`}
              placeholder="Provide specific details about the issue, when it started, and its impact on students..."
              value={formData.description}
              onChange={handleChange}
            />
            {errors.description && <span className="field-error-text">{errors.description}</span>}
          </div>

          {/* Image URL */}
          <div className="form-group">
            <label className="form-label" htmlFor="image">
              Image Evidence URL <span style={{ fontWeight: 'normal', color: 'var(--text-tertiary)' }}>(Optional)</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="url"
                id="image"
                name="image"
                className="form-input"
                placeholder="https://example.com/evidence-photo.jpg"
                value={formData.image}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              <FiPlusCircle aria-hidden="true" />
              {isSubmitting ? 'Logging Complaint...' : 'Submit Complaint'}
            </button>
          </div>
        </form>
      </div>

      {showDuplicateModal && (
        <DuplicateIssueModal
          duplicates={potentialDuplicates}
          onProceed={executeSubmission}
          onViewExisting={handleViewExisting}
          onCancel={() => setShowDuplicateModal(false)}
        />
      )}
    </div>
  );
};

export default ReportComplaint;
