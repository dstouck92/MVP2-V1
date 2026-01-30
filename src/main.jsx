// Log BEFORE any imports
console.log('%c🚀 MAIN.JSX SCRIPT STARTING', 'background: #8b5cf6; color: white; font-size: 16px; padding: 10px; font-weight: bold;');
console.log('Timestamp:', new Date().toISOString());
console.log('Current URL:', window.location.href);

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Log immediately when script loads
console.log('%c🚀 HERD APP SCRIPT LOADED', 'background: #8b5cf6; color: white; font-size: 16px; padding: 10px; font-weight: bold;');
console.log('✅ All imports successful');
console.log('✅ React version:', React.version);

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found!');
  }
  
  console.log('✅ Root element found, rendering App...');
  
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
  
  console.log('✅ App rendered successfully');
} catch (error) {
  console.error('%c❌ FATAL ERROR IN MAIN.JSX', 'background: #dc2626; color: white; font-size: 16px; padding: 10px; font-weight: bold;');
  console.error('Error:', error);
  console.error('Stack:', error.stack);
}
