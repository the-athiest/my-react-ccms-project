import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// Import CSS Design System & Stylesheets
import './styles/global.css';
import './styles/navbar.css';
import './styles/home.css';
import './styles/complaints.css';
import './styles/timeline.css';
import './styles/responsive.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
