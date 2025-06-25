// src/stack.js (or .ts if using TypeScript)
import { createStackClientApp } from "@stackframe/stack";

// You must ensure these environment variables are correctly set
// in your .env file (for local) and Netlify (for deployment).
// Use REACT_APP_ for Create React App, VITE_ for Vite.
const projectId = process.env.REACT_APP_STACK_PROJECT_ID || process.env.VITE_STACK_PROJECT_ID;
const publishableClientKey = process.env.REACT_APP_STACK_PUBLISHABLE_CLIENT_KEY || process.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY;

if (!projectId || !publishableClientKey) {
  console.error("Stack Auth environment variables are not set. Please check your .env file or Netlify environment variables.");
}

export const stackClientApp = createStackClientApp({
  projectId: projectId,
  publishableClientKey: publishableClientKey,
  // Add other configuration options for Stack Auth here if needed,
  // such as redirect URIs if you have custom ones, or specific providers.
  // Example: redirectUri: "YOUR_APP_URL/handler/callback"
  // Stack Auth often uses a default /handler/callback, but confirm with their docs.
});