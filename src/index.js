// src/index.js
import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css"; // Your main CSS file (e.g., Tailwind CSS setup)
import App from "./App"; // Your main App component
import { Auth0Provider } from "@auth0/auth0-react"; // Import the Auth0Provider (named import)
import config from "./config"; // Import the config object (default import)

// Auth0Provider configuration
const auth0Config = {
  domain: config.domain,
  clientId: config.clientId,
  authorizationParams: {
    redirect_uri: window.location.origin, // Dynamically sets the callback URL. Auth0 must allow this in its dashboard.
    audience: config.audience, // Your Auth0 API audience.
  },
  cacheLocation: 'localstorage', // Store tokens in localStorage for persistence
  useRefreshTokens: true, // Enable refresh tokens for better session management
};

// Get the root element where your React application will be mounted.
const root = createRoot(document.getElementById('root'));

// Render your React application wrapped with the Auth0Provider.
root.render(
  <React.StrictMode>
    <Auth0Provider {...auth0Config}>
      <App />
    </Auth0Provider>
  </React.StrictMode>,
);

// If you had serviceWorker.unregister() here, you can choose to remove it completely
// if you don't use service workers.
// REMOVED: import * as serviceWorker from "./serviceWorker";
// REMOVED: serviceWorker.unregister();