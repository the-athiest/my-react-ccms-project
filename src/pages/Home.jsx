import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlusCircle, FiSearch, FiActivity, FiArrowRight, FiCheckCircle, FiClock, FiSend } from 'react-icons/fi';
import { getComplaints, updateComplaint } from '../services/api';
import ComplaintCard from '../components/ComplaintCard';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';

const Home = () => {
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [totalActiveCount, setTotalActiveCount] = useState(0);
  const [topCategory, setTopCategory] = useState({ name: 'General', count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [supportedMap, setSupportedMap] = useState({});

  useEffect(() => {
    fetchLiveComplaints();
  }, []);

  const fetchLiveComplaints = async () => {
    try {
      setLoading(true);
      const data = await getComplaints();
      
      const activeList = data.filter(c => c.status !== 'Verified');
      setTotalActiveCount(activeList.length);

      // Compute top category in active issues
      const categoryCounts = activeList.reduce((acc, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + 1;
        return acc;
      }, {});

      let highestCat = { name: 'Campus Facilities', count: 0 };
      Object.entries(categoryCounts).forEach(([name, count]) => {
        if (count > highestCat.count) {
          highestCat = { name, count };
        }
      });
      setTopCategory(highestCat);

      // Get 4 most recent active or recently updated complaints
      const sorted = [...data].sort((a, b) => new Date(b.reportedDate) - new Date(a.reportedDate));
      setRecentComplaints(sorted.slice(0, 4));
    } catch (err) {
      console.error('Error fetching live complaints:', err);
      setError('Unable to retrieve current campus complaints. Please try again later.');
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
      setRecentComplaints((prev) =>
        prev.map((c) => (c.id === complaint.id ? updatedComplaint : c))
      );
    } catch (err) {
      console.error('Failed to support issue:', err);
    }
  };

  return (
    <div className="home-container animate-fade-in">
      {/* Hero Section */}
      <section className="hero-section">
        <span className="hero-tag">
          <FiActivity aria-hidden="true" />
          Campus Accountability System
        </span>
        <h1 className="hero-title">
          Where student concerns are heard, tracked, and resolved.
        </h1>
        <p className="hero-subtitle">
          CIVITAS provides an open, transparent pipeline for reporting campus infrastructure, academic, and facility issues with live lifecycle tracking and student verification.
        </p>
        <div className="hero-actions">
          <Link to="/report" className="btn btn-primary btn-lg">
            <FiPlusCircle aria-hidden="true" />
            Report an Issue
          </Link>
          <Link to="/track" className="btn btn-secondary btn-lg">
            <FiSearch aria-hidden="true" />
            Track Issue
          </Link>
          <Link to="/campus-pulse" className="btn btn-secondary btn-lg">
            <FiActivity aria-hidden="true" />
            Explore Campus Pulse
          </Link>
        </div>
      </section>

      {/* 3-Step How It Works */}
      <section className="how-it-works-section">
        <div className="section-header">
          <h2 className="section-title">How CIVITAS Works</h2>
          <p className="section-subtitle">A clear three-stage lifecycle ensuring total transparency.</p>
        </div>

        <div className="how-it-works-grid">
          <div className="step-card">
            <span className="step-number">1</span>
            <h3 className="step-title">Report & Aggregate</h3>
            <p className="step-desc">
              Submit your concern with precise details. Our duplicate detection engine aggregates matching student reports to elevate visibility.
            </p>
          </div>

          <div className="step-card">
            <span className="step-number">2</span>
            <h3 className="step-title">Track & Assign</h3>
            <p className="step-desc">
              Monitor the complaint in real time as it moves from administrative review directly to assigned facilities and maintenance departments.
            </p>
          </div>

          <div className="step-card">
            <span className="step-number">3</span>
            <h3 className="step-title">Resolve & Verify</h3>
            <p className="step-desc">
              When staff marks an issue resolved, students verify the fix. If the problem persists, the complaint is immediately reopened.
            </p>
          </div>
        </div>
      </section>

      {/* Campus Pulse Snapshot Banner */}
      <section className="pulse-snapshot-section">
        <div className="pulse-snapshot-card">
          <div className="pulse-snapshot-content">
            <span className="pulse-snapshot-badge">
              <FiActivity aria-hidden="true" />
              Live Campus Health Snapshot
            </span>
            <h3 className="pulse-snapshot-title">
              {totalActiveCount} active issues currently in resolution
            </h3>
            <p className="pulse-snapshot-desc">
              Highest current concentration is in <strong>{topCategory.name}</strong> ({topCategory.count} active reports). Check departmental workloads and progress on the pulse board.
            </p>
          </div>
          <Link to="/campus-pulse" className="btn btn-primary">
            <span>View Campus Pulse</span>
            <FiArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* Live Recent Complaints Section */}
      <section className="live-complaints-section">
        <div className="section-header-row">
          <div>
            <h2 className="section-title">Recent Campus Complaints</h2>
            <p className="section-subtitle">Live transparent feed of recent issues across university blocks.</p>
          </div>
          <Link to="/my-complaints" className="btn btn-secondary btn-sm">
            <span>View All Complaints</span>
            <FiArrowRight aria-hidden="true" />
          </Link>
        </div>

        {loading ? (
          <Loading message="Loading recent complaints..." />
        ) : error ? (
          <EmptyState
            title="Unable to load live complaints"
            description={error}
            actionText="Try Again"
            onActionClick={fetchLiveComplaints}
          />
        ) : recentComplaints.length === 0 ? (
          <EmptyState
            title="No active complaints"
            description="All campus complaints are currently resolved."
            actionText="Report an Issue"
            actionLink="/report"
          />
        ) : (
          <div className="complaints-list">
            {recentComplaints.map((complaint) => (
              <ComplaintCard
                key={complaint.id}
                complaint={complaint}
                onSupport={handleSupport}
                isSupported={Boolean(supportedMap[complaint.id])}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
