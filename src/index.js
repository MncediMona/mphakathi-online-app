// src/index.js

import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css"; // Assuming you have a CSS file for global styles
import App from "./App"; // Your main App component
import * as serviceWorker from "./serviceWorker"; // For offline capabilities, if desired
import { Auth0Provider } from "@auth0/auth0-react"; // Import the Auth0Provider
import history from "./utils/history"; // Import the custom history object
import { getConfig } from "./config"; // Import the function to get Auth0 configuration

/**
 * This function is called after Auth0 authenticates the user and redirects them back to your app.
 * It's responsible for redirecting the user back to the page they were trying to access,
 * or to the main application path if no specific return path is provided.
 * @param {object} appState - Contains state passed during the login redirect (e.g., returnTo URL).
 */
const onRedirectCallback = (appState) => {
  history.push(
    appState && appState.returnTo
      ? appState.returnTo
      : window.location.pathname
  );
};

// Get the Auth0 configuration details from your config.js file.
// This function reads from auth_config.json indirectly.
const config = getConfig();

// Define the configuration for the Auth0Provider.
const providerConfig = {
  domain: config.domain,
  clientId: config.clientId,
  onRedirectCallback, // The callback function for post-login redirection
  authorizationParams: {
    redirect_uri: window.location.origin, // The URL Auth0 should redirect back to after authentication
    // Optionally include audience if you are also calling a secured API
    ...(config.audience ? { audience: config.audience } : null),
  },
  cacheLocation: 'localstorage', // Store tokens in localStorage instead of memory
  useRefreshTokens: true, // Enable refresh tokens for better session management
};

// Get the root element where your React application will be mounted.
const root = createRoot(document.getElementById('root'));

// Render your React application wrapped with the Auth0Provider.
// This makes Auth0 authentication state and methods available throughout your App component tree.
root.render(
  <Auth0Provider
    {...providerConfig} // Spread the provider configuration props here
  >
    <App /> {/* Your main application component */}
  </Auth0Provider>,
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
