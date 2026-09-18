import React, { useState, useEffect, useMemo } from 'react';
import { getComplaints, updateComplaint } from '../services/api';
import ComplaintCard from '../components/ComplaintCard';
import SearchFilter from '../components/SearchFilter';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';

const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [supportedMap, setSupportedMap] = useState({});

  useEffect(() => {
    fetchComplaintsList();
  }, []);

  const fetchComplaintsList = async () => {
    try {
      setLoading(true);
      const data = await getComplaints();
      setComplaints(data);
    } catch (err) {
      console.error('Failed to load complaints repository:', err);
      setError('Unable to load complaints database. Please check your local server.');
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
      console.error('Failed to update support count:', err);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedStatus('All');
    setSortBy('newest');
  };

  const filteredComplaints = useMemo(() => {
    return complaints.filter((item) => {
      // Search term filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(query);
        const matchesDesc = item.description?.toLowerCase().includes(query);
        const matchesLoc = item.location?.toLowerCase().includes(query);
        const matchesId = item.id?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesLoc && !matchesId) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'All' && item.status !== selectedStatus) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.reportedDate) - new Date(a.reportedDate);
      } else if (sortBy === 'oldest') {
        return new Date(a.reportedDate) - new Date(b.reportedDate);
      } else if (sortBy === 'supported') {
        return (b.supportCount || 0) - (a.supportCount || 0);
      } else if (sortBy === 'priority') {
        const priorityWeight = { High: 3, Medium: 2, Low: 1 };
        return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
      }
      return 0;
    });
  }, [complaints, searchTerm, selectedCategory, selectedStatus, sortBy]);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="section-header">
        <h1 className="section-title">Campus Complaints Repository</h1>
        <p className="section-subtitle">
          Search, filter, and review active and resolved student concerns across all university facilities.
        </p>
      </div>

      <SearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onClearFilters={handleClearFilters}
        totalResults={filteredComplaints.length}
      />

      {loading ? (
        <Loading message="Loading complaints directory..." />
      ) : error ? (
        <EmptyState
          title="Error Loading Complaints"
          description={error}
          actionText="Retry"
          onActionClick={fetchComplaintsList}
        />
      ) : filteredComplaints.length === 0 ? (
        <EmptyState
          title="No complaints match your filters"
          description="Try adjusting your search keywords, category, or status criteria."
          actionText="Reset Filters"
          onActionClick={handleClearFilters}
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
  );
};

export default MyComplaints;
