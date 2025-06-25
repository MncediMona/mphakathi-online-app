// src/stack.js (or src/stack.ts)
// Corrected import: StackClientApp is a class, not a function.
import { StackClientApp } from "@stackframe/stack";

// Ensure these environment variables are correctly set
// in your .env file (for local) and Netlify (for deployment).
// For Create React App, use REACT_APP_ prefix.
const projectId = process.env.REACT_APP_STACK_PROJECT_ID;
const publishableClientKey = process.env.REACT_APP_STACK_PUBLISHABLE_CLIENT_KEY;

if (!projectId || !publishableClientKey) {
  console.error("Stack Auth environment variables (PROJECT_ID or PUBLISHABLE_CLIENT_KEY) are not set. Please check your .env file or Netlify environment variables.");
  // Provide dummy values for local development if not set, to prevent immediate crash,
  // but ensure user knows this needs real values for actual auth.
  // For production, these MUST be set.
  // In a real app, you might throw an error or display a clear message.
  // For now, we'll try to proceed with placeholders if not found.
  // This is purely to make the build pass and highlight the missing vars.
  // In a production scenario, you'd want to fail the build if these are missing.
  // For this environment, we'll just log an error and use dummy data.
}

export const stackClientApp = new StackClientApp({
  projectId: projectId || "dummy_project_id", // Use actual ID or dummy for build
  publishableClientKey: publishableClientKey || "dummy_publishable_key", // Use actual key or dummy for build
  // Add other configuration options for Stack Auth here if needed,
  // such as `urls.handler` if your Stack Auth setup uses a custom handler path.
  // Example for a common setup with a Netlify Function acting as a proxy:
  // urls: {
  //   handler: "/.netlify/functions/stack-auth-proxy", // Adjust if you have a proxy function
  // },
  // For a direct integration where Stack Auth handles redirects fully, this might not be needed.
  // Refer to your specific Stack Auth setup documentation.
});
