import React, { useState, useEffect, useMemo } from 'react';
import { FiActivity, FiTag, FiCheckCircle } from 'react-icons/fi';
import { getComplaints, updateComplaint } from '../services/api';
import ComplaintCard from '../components/ComplaintCard';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import { CATEGORIES } from '../utils/complaintUtils';

const CampusPulse = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [supportedMap, setSupportedMap] = useState({});

  useEffect(() => {
    fetchPulseData();
  }, []);

  const fetchPulseData = async () => {
    try {
      setLoading(true);
      const data = await getComplaints();
      setComplaints(data);
    } catch (err) {
      console.error('Failed to load campus pulse data:', err);
      setError('Unable to load campus pulse data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSupport = async (complaint) => {
    if (supportedMap[complaint.id]) return;

    try {
      const updatedComplaint = {
        ...complaint,
        supportCount: (complaint.supportCount || 0) + 1
      };
      await updateComplaint(complaint.id, updatedComplaint);
      setSupportedMap((prev) => ({ ...prev, [complaint.id]: true }));
      setComplaints((prev) =>
        prev.map((c) => (c.id === complaint.id ? updatedComplaint : c))
      );
    } catch (err) {
      console.error('Failed to support complaint:', err);
    }
  };

  // Group active complaints by category
  const activeComplaints = useMemo(() => {
    return complaints.filter((c) => c.status !== 'Verified' && c.status !== 'Resolved');
  }, [complaints]);

  const categoryStats = useMemo(() => {
    const counts = {};
    CATEGORIES.forEach((cat) => {
      counts[cat] = 0;
    });

    activeComplaints.forEach((c) => {
      if (counts[c.category] !== undefined) {
        counts[c.category] += 1;
      } else {
        counts[c.category] = 1;
      }
    });

    return counts;
  }, [activeComplaints]);

  const filteredComplaints = useMemo(() => {
    if (selectedCategory === 'All') {
      return activeComplaints;
    }
    return activeComplaints.filter((c) => c.category === selectedCategory);
  }, [activeComplaints, selectedCategory]);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="section-header">
        <h1 className="section-title">Campus Pulse</h1>
        <p className="section-subtitle">
          Real-time aggregated view of unresolved student concerns by facility domain. Click a card to focus on active issues.
        </p>
      </div>

      {loading ? (
        <Loading message="Aggregating campus pulse data..." />
      ) : error ? (
        <EmptyState
          title="Error Loading Pulse"
          description={error}
          actionText="Retry"
          onActionClick={fetchPulseData}
        />
      ) : (
        <>
          {/* Interactive Category Cards */}
          <div className="pulse-categories-grid">
            <div
              className={`pulse-category-card ${selectedCategory === 'All' ? 'selected' : ''}`}
              onClick={() => setSelectedCategory('All')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedCategory('All')}
            >
              <div className="pulse-category-header">
                <span className="pulse-category-name">All Active Issues</span>
                <span className="pulse-count-badge">{activeComplaints.length}</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Viewing all unresolved campus concerns
              </p>
            </div>

            {CATEGORIES.map((cat) => {
              const count = categoryStats[cat] || 0;
              const isSelected = selectedCategory === cat;
              return (
                <div
                  key={cat}
                  className={`pulse-category-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedCategory(cat)}
                >
                  <div className="pulse-category-header">
                    <span className="pulse-category-name">{cat}</span>
                    <span className="pulse-count-badge">{count}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {count === 0
                      ? 'No active issues'
                      : `${count} active ${count === 1 ? 'report' : 'reports'}`}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Active Complaints List for Selected Category */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="section-header-row">
              <div>
                <h2 className="section-title" style={{ fontSize: '1.35rem' }}>
                  {selectedCategory === 'All' ? 'All Unresolved Issues' : `${selectedCategory} Issues`}
                </h2>
                <p className="section-subtitle">
                  {filteredComplaints.length} active {filteredComplaints.length === 1 ? 'complaint' : 'complaints'} awaiting or undergoing resolution.
                </p>
              </div>

              {selectedCategory !== 'All' && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSelectedCategory('All')}
                >
                  Show All Categories
                </button>
              )}
            </div>

            {filteredComplaints.length === 0 ? (
              <EmptyState
                title={`No active ${selectedCategory} issues`}
                description="Everything in this category is currently in good standing or verified."
                actionText="View All Categories"
                onActionClick={() => setSelectedCategory('All')}
              />
            ) : (
              <div className="complaints-list">
                {filteredComplaints.map((item) => (
                  <ComplaintCard
                    key={item.id}
                    complaint={item}
                    onSupport={handleSupport}
                    isSupported={Boolean(supportedMap[item.id])}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CampusPulse;
