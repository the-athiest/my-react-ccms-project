import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <h3 className="footer-brand-title">CIVITAS</h3>
            <p className="footer-tagline">
              A transparent platform where student concerns are heard, tracked, and resolved.
            </p>
          </div>

          <ul className="footer-links">
            <li>
              <Link to="/report" className="footer-link">Report Issue</Link>
            </li>
            <li>
              <Link to="/track" className="footer-link">Track Complaint</Link>
            </li>
            <li>
              <Link to="/campus-pulse" className="footer-link">Campus Pulse</Link>
            </li>
            <li>
              <Link to="/resolution-board" className="footer-link">Resolution Board</Link>
            </li>
          </ul>
        </div>

        <div className="footer-bottom">
          <span>&copy; {new Date().getFullYear()} CIVITAS College Complaint Management Platform. All rights reserved.</span>
          <span>Institutional Transparency & Accountability System</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
