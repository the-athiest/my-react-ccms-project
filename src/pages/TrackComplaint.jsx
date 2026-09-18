import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiArrowRight, FiCheckCircle, FiInfo } from 'react-icons/fi';
import { getComplaints } from '../services/api';
import EmptyState from '../components/EmptyState';
import Loading from '../components/Loading';

const TrackComplaint = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchId, setSearchId] = useState('');
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [notFoundId, setNotFoundId] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const data = await getComplaints();
        setComplaints(data);
      } catch (err) {
        console.error('Error fetching complaints for tracking:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    setSearchAttempted(true);
    const cleanedInput = searchId.trim().toUpperCase();
    // Normalize format: if user enters 1001, match with CV-1001
    const normalizedInput = cleanedInput.startsWith('CV-') ? cleanedInput : `CV-${cleanedInput}`;

    const matched = complaints.find(
      (c) => c.id?.toUpperCase() === normalizedInput || c.id?.toUpperCase() === cleanedInput
    );

    if (matched) {
      navigate(`/complaint/${matched.id}`);
    } else {
      setNotFoundId(searchId.trim());
    }
  };

  const handleChipClick = (id) => {
    setSearchId(id);
    navigate(`/complaint/${id}`);
  };

  if (loading) {
    return <Loading message="Loading complaint tracking system..." />;
  }

  const sampleRecentIds = complaints.slice(0, 5).map((c) => c.id);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="track-hero-box">
        <h1 className="hero-title" style={{ fontSize: '2.25rem' }}>
          Track Complaint Progress
        </h1>
        <p className="hero-subtitle">
          Enter your unique tracking reference number (e.g. CV-1001) to view the current resolution status and live activity trail.
        </p>

        <form onSubmit={handleTrackSubmit} className="track-search-form">
          <input
            type="text"
            className="track-input"
            placeholder="Enter Complaint ID (e.g. CV-1001)"
            value={searchId}
            onChange={(e) => {
              setSearchId(e.target.value);
              setSearchAttempted(false);
            }}
            aria-label="Complaint ID"
          />
          <button type="submit" className="btn btn-primary btn-lg">
            <FiSearch aria-hidden="true" />
            <span>Track</span>
          </button>
        </form>

        <div className="track-recent-chips">
          <span>Quick Lookup Recent IDs:</span>
          {sampleRecentIds.map((sampleId) => (
            <button
              key={sampleId}
              type="button"
              className="chip-btn"
              onClick={() => handleChipClick(sampleId)}
            >
              {sampleId}
            </button>
          ))}
        </div>
      </div>

      {searchAttempted && notFoundId && (
        <div style={{ marginTop: '2rem' }}>
          <EmptyState
            title="No Matching Record Found"
            description={`We could not locate any campus complaint registered under "${notFoundId}". Please double check your reference number.`}
            actionText="View All Complaints"
            actionLink="/my-complaints"
          />
        </div>
      )}
    </div>
  );
};

export default TrackComplaint;
