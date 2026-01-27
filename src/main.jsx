import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Log immediately when script loads
console.log('%c🚀 HERD APP SCRIPT LOADED', 'background: #8b5cf6; color: white; font-size: 16px; padding: 10px; font-weight: bold;');
console.log('Timestamp:', new Date().toISOString());

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
