// lib/stack.js
import { StackClientApp } from "@stackframe/stack";

let clientAppInstance = null;

export function getStackClientApp() {
  // Only attempt to initialize if we are in a browser environment
  if (typeof window !== 'undefined') {
    if (!clientAppInstance) {
      const projectId = process.env.NEXT_PUBLIC_STACK_PROJECT_ID;
      const publishableClientKey = process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY;

      if (!projectId || !publishableClientKey) {
        console.error("Stack Auth environment variables (NEXT_PUBLIC_STACK_PROJECT_ID or NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY) are not set. Please ensure they are configured in your Netlify Environment Variables AND your local .env file. Returning null for StackClientApp.");
        return null; // Explicitly return null if keys are missing on the client
      }

      clientAppInstance = new StackClientApp({
        projectId: projectId,
        publishableClientKey: publishableClientKey,
      });
    }
    return clientAppInstance;
  }
  return null; // Return null if not in a browser environment (i.e., on the server)
}
