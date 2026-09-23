import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import App from './App';
import './index.css';

// All API calls use relative paths like '/api/users'. Set VITE_API_URL
// (see .env.example) to point the app at a deployed backend.
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
