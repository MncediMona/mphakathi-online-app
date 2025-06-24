// netlify/functions/auth/[...authjs].js
// This is the main NextAuth.js (Auth.js) handler for Netlify Functions.
// It uses a catch-all route [...authjs].js to handle all authentication requests.

import { NetlifyAdapter } from "@auth/netlify"; // Auth.js adapter for Netlify
import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";

// Ensure all required environment variables are present
if (!process.env.GITHUB_ID || !process.env.GITHUB_SECRET) {
  throw new Error("GitHub OAuth environment variables (GITHUB_ID, GITHUB_SECRET) are not set.");
}
if (!process.env.AUTH_SECRET) {
  throw new Error("AUTH_SECRET environment variable is not set. It is required for Auth.js.");
}
if (!process.env.NEON_DB_URL) {
  throw new Error("NEON_DB_URL environment variable is not set. It is required for the database adapter.");
}
// Add explicit check for NEXTAUTH_URL as it's critical for local dev redirects
if (!process.env.NEXTAUTH_URL) {
    console.warn("NEXTAUTH_URL environment variable is NOT set. This is critical for Auth.js redirects, especially in development.");
    // Fallback to NETLIFY_SITE_URL if NEXTAUTH_URL is missing, although NEXTAUTH_URL is preferred by Auth.js
    if (!process.env.NETLIFY_SITE_URL) {
        console.error("Neither NEXTAUTH_URL nor NETLIFY_SITE_URL is set. Auth.js redirects will likely fail.");
    }
}


// Define Auth.js options
export const authOptions = {
  // Use the NetlifyAdapter for database integration
  adapter: NetlifyAdapter(
    process.env.NEON_DB_URL,
    {
      // Optional: Pass PG options directly if needed by adapter
      connection: {
        ssl: {
          rejectUnauthorized: false, // Required for Neon free tier or self-signed certs
        },
      },
    }
  ),
  // Configure authentication providers
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    // Add other providers here if needed
  ],
  // Debug mode for detailed logs (set to true in development)
  debug: process.env.NODE_ENV === "development",
  // Callback for session management
  callbacks: {
    async session({ session, user }) {
      // Add user ID from the database to the session object
      // This 'user' object is provided by the adapter and contains the database user record
      if (user?.id) {
        session.user.id = user.id; // user.id here is the DB user_profiles.id
      }
      return session;
    },
  },
  // Custom pages for better user experience (e.g., /auth/signin, /auth/error)
  pages: {
    signIn: '/login', // Your custom login page route in React
    error: '/auth/error', // Your custom error page route in React
  },
  // Secret used for signing cookies and tokens
  secret: process.env.AUTH_SECRET,
  // Session strategy (default is 'jwt', 'database' for NetlifyAdapter)
  session: {
    strategy: "database", // Must be "database" for adapter to work with a database
  },
  // Base URL for Auth.js, crucial for correct redirects
  url: process.env.NEXTAUTH_URL || process.env.NETLIFY_SITE_URL,
};

// Netlify Functions handler boilerplate for Auth.js
// This part routes the incoming request to the NextAuth.js core.
exports.handler = async (event, context) => {
  // Log event details for debugging
  console.log('AUTH_FUNCTION_DEBUG: Auth.js Netlify Function triggered!');
  console.log('AUTH_FUNCTION_DEBUG: Event object:', JSON.stringify(event, null, 2)); // Log full event for inspection
  console.log('AUTH_FUNCTION_DEBUG: Context object:', JSON.stringify(context, null, 2)); // Log full context

  console.log('AUTH_FUNCTION_DEBUG: Path:', event.path);
  console.log('AUTH_FUNCTION_DEBUG: HTTP Method:', event.httpMethod);
  console.log('AUTH_FUNCTION_DEBUG: Query String Parameters:', event.queryStringParameters);
  console.log('AUTH_FUNCTION_DEBUG: Headers (Host):', event.headers.host);
  console.log('AUTH_FUNCTION_DEBUG: NETLIFY_SITE_URL (Env):', process.env.NETLIFY_SITE_URL);
  console.log('AUTH_FUNCTION_DEBUG: NEXTAUTH_URL (Env):', process.env.NEXTAUTH_URL);
  console.log('AUTH_FUNCTION_DEBUG: AUTH_SECRET (masked):', process.env.AUTH_SECRET ? 'SET' : 'NOT SET');
  console.log('AUTH_FUNCTION_DEBUG: GITHUB_ID (masked):', process.env.GITHUB_ID ? 'SET' : 'NOT SET');
  console.log('AUTH_FUNCTION_DEBUG: GITHUB_SECRET (masked):', process.env.GITHUB_SECRET ? 'SET' : 'NOT SET');
  console.log('AUTH_FUNCTION_DEBUG: NEON_DB_URL (masked):', process.env.NEON_DB_URL ? 'SET' : 'NOT SET');

  // NextAuth expects the URL to be rewritten relative to the base of the API route.
  // Netlify Functions rewrite /api/auth/* to /.netlify/functions/auth/*
  // So, we need to adjust the path so NextAuth correctly parses it.
  const authPath = event.path.replace('/.netlify/functions/auth', '/api/auth');

  // Construct a dummy URL object that NextAuth can parse.
  // The host must be correctly set for NextAuth to generate correct redirect URLs.
  // Use `event.headers.host` for local dev to capture the correct Replit domain.
  const baseUrl = `https://${event.headers.host}`; // Use HTTPS as Replit provides it
  const dummyUrl = new URL(authPath, baseUrl);

  // Re-map the event to a format NextAuth can understand directly.
  const nextAuthRequest = {
    ...event,
    url: dummyUrl.toString(),
    headers: {
        ...event.headers,
        host: dummyUrl.host,
        'x-forwarded-proto': 'https', // Explicitly tell Auth.js it's HTTPS
    },
    body: event.body,
  };

  // Run NextAuth with the adjusted request
  const response = await NextAuth(nextAuthRequest, authOptions);

  // Return the NextAuth response in a format compatible with Netlify Functions
  return {
    statusCode: response.status || 200,
    headers: {
      ...response.headers,
      'Access-Control-Allow-Origin': '*', // Ensure CORS is still handled
      'Access-Control-Allow-Credentials': 'true', // Important for cookies/sessions
    },
    body: response.body, // The actual response body from Auth.js
  };
};
