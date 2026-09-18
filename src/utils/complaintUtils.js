/**
 * Complaint categories, status definitions, lifecycle steps, and duplicate detection
 */

export const CATEGORIES = [
  'Classroom facilities',
  'Hostel',
  'Transport',
  'Canteen',
  'Library',
  'Internet / Wi-Fi',
  'Cleanliness',
  'Electrical',
  'Infrastructure',
  'Academic facilities',
  'Other'
];

export const STATUSES = [
  'Reported',
  'Received',
  'Under Review',
  'Assigned',
  'In Progress',
  'Resolved',
  'Verified',
  'Reopened'
];

export const RESOLUTION_BOARD_STAGES = [
  'Received',
  'Under Review',
  'In Progress',
  'Resolved',
  'Verified'
];

export const PRIORITIES = [
  {
    level: 'Low',
    helperText: 'Non-urgent improvement, cosmetic fix, or minor inconvenience.'
  },
  {
    level: 'Medium',
    helperText: 'Affects daily routine or workflow, but partial workarounds exist.'
  },
  {
    level: 'High',
    helperText: 'Critical disruption, safety/hazard risk, or widespread campus outage.'
  }
];

export const DEPARTMENTS = [
  'IT Support',
  'Civil & Maintenance',
  'Electrical & HVAC',
  'Plumbing & Sanitation',
  'Transport Dept',
  'Housekeeping & Hygiene',
  'AV & Media Support',
  'Canteen Committee',
  'Hostel Administration',
  'General Administration'
];

export const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Reported':
      return 'status-reported';
    case 'Received':
      return 'status-received';
    case 'Under Review':
      return 'status-review';
    case 'Assigned':
      return 'status-assigned';
    case 'In Progress':
      return 'status-progress';
    case 'Resolved':
      return 'status-resolved';
    case 'Verified':
      return 'status-verified';
    case 'Reopened':
      return 'status-reopened';
    default:
      return 'status-default';
  }
};

export const getPriorityBadgeClass = (priority) => {
  switch (priority?.toLowerCase()) {
    case 'high':
      return 'priority-high';
    case 'medium':
      return 'priority-medium';
    case 'low':
      return 'priority-low';
    default:
      return 'priority-default';
  }
};

const STOP_WORDS = new Set([
  'the', 'is', 'at', 'which', 'on', 'in', 'and', 'or', 'to', 'for', 'of', 'a',
  'an', 'not', 'are', 'was', 'were', 'it', 'by', 'this', 'that', 'from', 'with',
  'issue', 'problem', 'broken', 'not', 'working'
]);

export const findDuplicateComplaints = (newComplaint, existingComplaints) => {
  if (!newComplaint || !newComplaint.title || !existingComplaints?.length) {
    return [];
  }

  const cleanTitleWords = newComplaint.title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOP_WORDS.has(word));

  const cleanLocationWords = (newComplaint.location || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOP_WORDS.has(word));

  const activeComplaints = existingComplaints.filter(
    item => item.status !== 'Verified' && item.status !== 'Resolved'
  );

  const matched = [];

  for (const item of activeComplaints) {
    let score = 0;

    // Category exact match
    if (newComplaint.category && item.category === newComplaint.category) {
      score += 2;
    }

    const itemTitleWords = item.title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2 && !STOP_WORDS.has(word));

    const itemLocationWords = (item.location || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2 && !STOP_WORDS.has(word));

    // Common words in title
    const commonTitleWords = cleanTitleWords.filter(w => itemTitleWords.includes(w));
    score += commonTitleWords.length * 2;

    // Common words in location
    const commonLocationWords = cleanLocationWords.filter(w => itemLocationWords.includes(w));
    score += commonLocationWords.length * 1.5;

    // Direct substring check
    if (item.title.toLowerCase().includes(newComplaint.title.toLowerCase().trim()) ||
        newComplaint.title.toLowerCase().trim().includes(item.title.toLowerCase())) {
      score += 4;
    }

    if (score >= 4) {
      matched.push({
        ...item,
        duplicateScore: score
      });
    }
  }

  return matched.sort((a, b) => b.duplicateScore - a.duplicateScore);
};

export const generateNextComplaintId = (existingComplaints) => {
  if (!existingComplaints || existingComplaints.length === 0) {
    return 'CV-1001';
  }

  const numbers = existingComplaints
    .map(c => {
      const match = c.id?.match(/CV-(\d+)/i);
      return match ? parseInt(match[1], 10) : null;
    })
    .filter(n => n !== null && !isNaN(n));

  const maxId = numbers.length ? Math.max(...numbers) : 1000;
  return `CV-${maxId + 1}`;
};
