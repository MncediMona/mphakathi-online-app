import React from 'react';
import ReactDOM from 'react-dom/client';
// If you have a global CSS file, you would import it here, e.g.:
// import './index.css';
import App from './App'; // Import your main App component

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);