import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  FiShield, 
  FiPlusCircle, 
  FiList, 
  FiActivity, 
  FiSearch, 
  FiGrid, 
  FiMenu, 
  FiX,
  FiHome
} from 'react-icons/fi';
import StaffModeToggle from './StaffModeToggle';
import { useStaff } from '../context/StaffContext';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isStaffMode } = useStaff();

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { to: '/', label: 'Home', icon: FiHome },
    { to: '/report', label: 'Report Issue', icon: FiPlusCircle },
    { to: '/my-complaints', label: 'My Complaints', icon: FiList },
    { to: '/campus-pulse', label: 'Campus Pulse', icon: FiActivity },
    { to: '/track', label: 'Track Issue', icon: FiSearch },
    { to: '/resolution-board', label: 'Resolution Board', icon: FiGrid },
  ];

  return (
    <header className="navbar">
      {isStaffMode && (
        <div className="staff-mode-banner">
          <FiShield aria-hidden="true" />
          <span>Staff Mode Active — Department assignment and status controls unlocked</span>
        </div>
      )}

      <div className="navbar-container">
        <Link to="/" className="brand-logo" onClick={closeMobileMenu}>
          <FiShield className="brand-icon" aria-hidden="true" />
          <span>CIVITAS</span>
          <span className="brand-badge">Campus</span>
        </Link>

        <nav className="nav-links" aria-label="Main Navigation">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="navbar-actions">
          <StaffModeToggle />

          <button
            type="button"
            className="mobile-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <FiX aria-hidden="true" /> : <FiMenu aria-hidden="true" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="mobile-nav-drawer animate-fade-in">
          <ul className="mobile-nav-list">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMobileMenu}
                >
                  <Icon aria-hidden="true" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
};

export default Navbar;
