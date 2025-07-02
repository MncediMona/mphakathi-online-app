// lib/stack.ts
import { StackClientApp } from "@stackframe/stack";

let clientAppInstance: StackClientApp | null = null;

export function getStackClientApp(): StackClientApp | null {
  // Only attempt to initialize if we are in a browser environment
  if (typeof window === 'undefined') {
    // console.log("getStackClientApp: Running on server, returning null.");
    return null; // Return null immediately if on the server
  }

  // If we are on the client and instance is not yet created
  if (!clientAppInstance) {
    const projectId = process.env.NEXT_PUBLIC_STACK_PROJECT_ID;
    const publishableClientKey = process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY;

    if (!projectId || !publishableClientKey) {
      console.error("Stack Auth: Missing NEXT_PUBLIC_STACK_PROJECT_ID or NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY. Cannot initialize StackClientApp.");
      return null; // Explicitly return null if keys are missing on the client
    }

    try {
      clientAppInstance = new StackClientApp({
        projectId: projectId,
        publishableClientKey: publishableClientKey,
      });
      // console.log("StackClientApp initialized successfully on client.");
    } catch (error) {
      console.error("Stack Auth: Error initializing StackClientApp:", error);
      clientAppInstance = null; // Reset if initialization fails
      return null;
    }
  }
  return clientAppInstance;
}
