import React from 'react';
import { Link } from 'react-router-dom';
import { FiAlertOctagon, FiHome } from 'react-icons/fi';

const NotFound = () => {
  return (
    <div className="empty-state-box animate-fade-in" style={{ padding: '5rem 2rem' }}>
      <div className="empty-state-icon" style={{ color: 'var(--accent)' }}>
        <FiAlertOctagon aria-hidden="true" />
      </div>
      <h1 className="empty-state-title" style={{ fontSize: '2rem' }}>404 — Page Not Found</h1>
      <p className="empty-state-text">
        The page or complaint record you are attempting to access does not exist or has been relocated.
      </p>
      <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
        <FiHome aria-hidden="true" />
        <span>Return to Home</span>
      </Link>
    </div>
  );
};

export default NotFound;
