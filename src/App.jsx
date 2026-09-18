import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import ReportComplaint from './pages/ReportComplaint';
import MyComplaints from './pages/MyComplaints';
import ComplaintDetails from './pages/ComplaintDetails';
import TrackComplaint from './pages/TrackComplaint';
import CampusPulse from './pages/CampusPulse';
import ResolutionBoard from './pages/ResolutionBoard';
import NotFound from './pages/NotFound';
import { StaffProvider } from './context/StaffContext';

function App() {
  return (
    <StaffProvider>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/report" element={<ReportComplaint />} />
          <Route path="/my-complaints" element={<MyComplaints />} />
          <Route path="/complaint/:id" element={<ComplaintDetails />} />
          <Route path="/track" element={<TrackComplaint />} />
          <Route path="/campus-pulse" element={<CampusPulse />} />
          <Route path="/resolution-board" element={<ResolutionBoard />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </StaffProvider>
  );
}

export default App;
