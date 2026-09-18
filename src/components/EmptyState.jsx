import React from 'react';
import { FiInbox } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const EmptyState = ({
  icon: Icon = FiInbox,
  title = 'No complaints found',
  description = 'There are currently no complaints matching your criteria.',
  actionText,
  actionLink,
  onActionClick
}) => {
  return (
    <div className="empty-state-box animate-fade-in">
      <div className="empty-state-icon">
        <Icon aria-hidden="true" />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-text">{description}</p>
      {actionText && actionLink && (
        <Link to={actionLink} className="btn btn-primary btn-sm" style={{ marginTop: '0.5rem' }}>
          {actionText}
        </Link>
      )}
      {actionText && onActionClick && !actionLink && (
        <button onClick={onActionClick} className="btn btn-secondary btn-sm" style={{ marginTop: '0.5rem' }}>
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
