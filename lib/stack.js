// lib/stack.js
import { StackClientApp } from "@stackframe/stack";

let clientAppInstance = null;

// This function will only be called in a client-side context
// where window and process.env.NEXT_PUBLIC_ variables are reliably available.
export function getStackClientApp() {
  // If we are on the server during build/SSR, clientAppInstance might be null.
  // We explicitly check for `typeof window !== 'undefined'` to ensure it's client-side.
  if (typeof window !== 'undefined' && !clientAppInstance) {
    const projectId = process.env.NEXT_PUBLIC_STACK_PROJECT_ID;
    const publishableClientKey = process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY;

    if (!projectId || !publishableClientKey) {
      console.error("Stack Auth environment variables (NEXT_PUBLIC_STACK_PROJECT_ID or NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY) are not set. Please ensure they are configured in your Netlify Environment Variables AND your local .env file. Skipping StackClientApp initialization on client due to missing keys.");
      // In a production app, you might want to redirect to an error page or show a clear message.
      // For now, we'll let it proceed with a non-functional auth instance.
      // Alternatively, return null here and handle null in StackProvider's `app` prop.
      // For StackProvider, an `app` prop of `null` or `undefined` might cause issues.
      // Let's create a *dummy* StackClientApp if the keys are missing for development,
      // but emphasize this will NOT work for actual authentication.
      return { login: () => console.log("Login not configured, missing keys."), logout: () => console.log("Logout not configured, missing keys.") };
    }

    clientAppInstance = new StackClientApp({
      projectId: projectId,
      publishableClientKey: publishableClientKey,
      // Add other configuration options if needed, e.g., handler URLs for specific proxy setups
    });
  }
  // Return the instance, which might be null on the server, or a dummy/real instance on client
  return clientAppInstance;
}
