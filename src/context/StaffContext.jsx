import React, { createContext, useContext, useState, useEffect } from 'react';

const StaffContext = createContext();

const STORAGE_KEY = 'civitas_staff_mode';

export const StaffProvider = ({ children }) => {
  const [isStaffMode, setIsStaffMode] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved === 'true';
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(isStaffMode));
    } catch (e) {
      console.error('Failed to save staff mode setting to localStorage', e);
    }
  }, [isStaffMode]);

  const toggleStaffMode = () => {
    setIsStaffMode((prev) => !prev);
  };

  return (
    <StaffContext.Provider value={{ isStaffMode, setIsStaffMode, toggleStaffMode }}>
      {children}
    </StaffContext.Provider>
  );
};

export const useStaff = () => {
  const context = useContext(StaffContext);
  if (!context) {
    throw new Error('useStaff must be used within a StaffProvider');
  }
  return context;
};
