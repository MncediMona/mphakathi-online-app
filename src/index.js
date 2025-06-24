// src/index.js
import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css"; // Ensure this path is correct if you use a global CSS file
import App from "./App";
import { SessionProvider } from "next-auth/react"; // Correct Auth.js import

// Get the root element from index.html where your React app will be mounted
const container = document.getElementById('root');

// If the root element is not found, log an error (useful for debugging HTML)
if (!container) {
  console.error('Root element #root not found in index.html. React app cannot mount.');
} else {
  // Create a root for the React app
  const root = createRoot(container);

  // Render your React application wrapped with the SessionProvider.
  root.render(
    <React.StrictMode>
      {/* SessionProvider makes the Auth.js session available throughout your app */}
      <SessionProvider>
        <App />
      </SessionProvider>
    </React.StrictMode>
  );
}