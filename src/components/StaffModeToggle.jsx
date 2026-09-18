import React from 'react';
import { FiUser, FiShield } from 'react-icons/fi';
import { useStaff } from '../context/StaffContext';

const StaffModeToggle = () => {
  const { isStaffMode, toggleStaffMode } = useStaff();

  return (
    <div className="staff-toggle-wrapper" title="Switch between Student Portal and Staff Administration">
      <button
        type="button"
        className={`staff-toggle-btn ${!isStaffMode ? 'active' : ''}`}
        onClick={() => {
          if (isStaffMode) toggleStaffMode();
        }}
        aria-pressed={!isStaffMode}
      >
        <FiUser aria-hidden="true" />
        Student
      </button>

      <button
        type="button"
        className={`staff-toggle-btn ${isStaffMode ? 'active' : ''}`}
        onClick={() => {
          if (!isStaffMode) toggleStaffMode();
        }}
        aria-pressed={isStaffMode}
      >
        <FiShield aria-hidden="true" />
        Staff
      </button>
    </div>
  );
};

export default StaffModeToggle;
