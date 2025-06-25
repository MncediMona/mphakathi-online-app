// lib/stack.js
// This file will initialize the StackClientApp instance.
import { StackClientApp } from "@stackframe/stack";

// Use NEXT_PUBLIC_ prefix for client-side environment variables in Next.js
const projectId = process.env.NEXT_PUBLIC_STACK_PROJECT_ID;
const publishableClientKey = process.env.NEXT_PUBLIC_STACK_PUBLISHable_CLIENT_KEY;

if (!projectId || !publishableClientKey) {
  console.error("Stack Auth environment variables (NEXT_PUBLIC_STACK_PROJECT_ID or NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY) are not set. Please check your .env file or Netlify environment variables.");
  // For production, you would typically throw an error here, but for development
  // and to allow initial compilation, we might use placeholders.
}

export const stackClientApp = new StackClientApp({
  projectId: projectId || "fallback-project-id", // Provide a fallback if not set
  publishableClientKey: publishableClientKey || "fallback-publishable-key", // Provide a fallback
  // If your Stack Auth setup requires a specific handler URL (e.g., for custom proxy functions)
  // you would add it here. For typical direct integration with hosted pages, it might not be needed.
  // For Netlify Functions and Stack Auth, you might need something like:
  // urls: {
  //   handler: "/.netlify/functions/your-stack-auth-proxy-function",
  // },
  // But generally, for App Router, Stack Auth handles its own redirects.
});
