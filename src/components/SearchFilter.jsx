import React from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { CATEGORIES, STATUSES } from '../utils/complaintUtils';

const SearchFilter = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  sortBy,
  onSortChange,
  onClearFilters,
  totalResults
}) => {
  const hasActiveFilters = Boolean(
    searchTerm || selectedCategory !== 'All' || selectedStatus !== 'All' || sortBy !== 'newest'
  );

  return (
    <div className="filter-panel animate-fade-in">
      <div className="search-input-wrapper">
        <FiSearch className="search-icon" aria-hidden="true" />
        <input
          type="text"
          className="search-input"
          placeholder="Search complaints by keyword, ID, or campus location..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search complaints"
        />
      </div>

      <div className="filter-row">
        <select
          className="filter-select"
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          aria-label="Filter by category"
        >
          <option value="All">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select
          className="filter-select"
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="All">All Statuses</option>
          {STATUSES.map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>

        <select
          className="filter-select"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          aria-label="Sort complaints by"
        >
          <option value="newest">Sort: Newest First</option>
          <option value="priority">Sort: Highest Priority</option>
          <option value="supported">Sort: Most Supported</option>
          <option value="oldest">Sort: Oldest First</option>
        </select>

        {hasActiveFilters && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onClearFilters}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <FiX aria-hidden="true" />
            Reset
          </button>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
        <span>Showing {totalResults} {totalResults === 1 ? 'complaint' : 'complaints'}</span>
      </div>
    </div>
  );
};

export default SearchFilter;
