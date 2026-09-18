import React from 'react';

const Loading = ({ message = 'Loading campus complaints...' }) => {
  return (
    <div className="loading-container animate-fade-in" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true"></div>
      <p className="loading-text">{message}</p>
    </div>
  );
};

export default Loading;
