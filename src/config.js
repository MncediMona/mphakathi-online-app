// src/config.js
// This file provides the Auth0 configuration to your React frontend.
// It relies solely on environment variables (prefixed with REACT_APP_).

const config = {
  // Auth0 Domain: Your Auth0 tenant domain (e.g., dev-xxxx.us.auth0.com)
  domain: process.env.REACT_APP_AUTH0_DOMAIN || "dev-2yxylzdtf4dqt51i.us.auth0.com",

  // Auth0 Client ID: Your Auth0 Application Client ID (for your SPA)
  clientId: process.env.REACT_APP_AUTH0_CLIENT_ID || "lOnIDcw4GQKk3dEEDec74F7buYO56rH8",

  // Auth0 API Audience: The identifier for your custom API registered in Auth0
  // (e.g., https://api.mphakathi-online.com)
  audience: process.env.REACT_APP_AUTH0_API_AUDIENCE || "https://api.mphakathi-online.com",

  // You can also include your API_BASE_URL here for dynamic API calls.
  // This will be used in App.js for making fetch requests.
  // In Replit, window.location.origin will be your public Replit URL (e.g., https://your-repl-name-8888.your-username.repl.co)
  apiBaseUrl: process.env.NODE_ENV === 'development'
    ? `${window.location.origin}` // Use current origin for local/Replit dev
    : 'https://dashboard.mphakathi.online' // Your production deployment base URL
};

// Export the 'config' object as the default export.
export default config;

// REMOVED: import configJson from "./auth_config.json";
// REMOVED: export function getConfig() { ... }
// REMOVED: the duplicate 'const config = {...}' and 'export default config'