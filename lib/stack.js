// lib/stack.js
import { StackClientApp } from "@stackframe/stack";

let clientAppInstance = null;

export function getStackClientApp() {
  if (typeof window === 'undefined') {
    return null; // Return null immediately if on the server
  }

  if (!clientAppInstance) {
    const projectId = process.env.NEXT_PUBLIC_STACK_PROJECT_ID;
    const publishableClientKey = process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY;

    if (!projectId || !publishableClientKey) {
      console.error("Stack Auth: Missing NEXT_PUBLIC_STACK_PROJECT_ID or NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY. Cannot initialize StackClientApp.");
      return null;
    }

    try {
      clientAppInstance = new StackClientApp({
        projectId: projectId,
        publishableClientKey: publishableClientKey,
      });
    } catch (error) {
      console.error("Stack Auth: Error initializing StackClientApp:", error);
      clientAppInstance = null;
      return null;
    }
  }
  return clientAppInstance;
}
