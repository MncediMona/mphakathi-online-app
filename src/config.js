// src/config.js
// This file provides the configuration to your React frontend.
// It relies solely on environment variables (prefixed with REACT_APP_).

const getApiBaseUrl = () => {
  if (process.env.NODE_ENV === 'development') {
    // In Replit, window.location.origin might sometimes be an internal IP (e.g., 172.x.x.x)
    // We can explicitly construct the public URL for Netlify Functions hosted by 'netlify dev'
    // in Replit using Replit's environment variables.
    // Assuming netlify dev is exposing port 8888 publicly.
    if (process.env.REPL_SLUG && process.env.REPL_OWNER) {
      // Corrected: Removed unnecessary backslashes from template literal
      return `https://8888-${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`;
    }
    // Fallback if Replit vars aren't available or if running truly locally (outside Codespaces/Replit)
    return `${window.location.origin}`;
  }
  // For production deployment on Netlify
  return 'https://dashboard.mphakathi.online'; // Your production deployment base URL
};

const config = {
  // Auth.js environment variables are read by Auth.js itself on the backend.
  // Frontend config needs API base URL for its own fetch calls.
  apiBaseUrl: getApiBaseUrl()
};

// Export the 'config' object as the default export.
export default config;
