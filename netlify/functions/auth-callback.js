// netlify/functions/auth-callback.js
// This Netlify Function handles the OAuth callback from GitHub for Neon Auth.

const { handleAuthCallback } = require('@neondatabase/auth-helpers-server');
const { getDbClient } = require('./db-config'); // Assuming your db-config.js is in the same directory

exports.handler = async (event, context) => {
    // Ensure this function only responds to GET requests from the OAuth redirect
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            body: 'Method Not Allowed',
        };
    }

    const { queryStringParameters } = event;
    const code = queryStringParameters.code;
    const state = queryStringParameters.state; // OAuth state for CSRF protection

    if (!code) {
        return {
            statusCode: 400,
            body: 'Missing authorization code.',
        };
    }

    // Environment variables for Neon Auth Helpers
    const authSecret = process.env.AUTH_SECRET;
    const githubClientId = process.env.GITHUB_OAUTH_CLIENT_ID;
    const githubClientSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET;
    const neonDbUrl = process.env.NEON_DB_URL; // Your database URL

    if (!authSecret || !githubClientId || !githubClientSecret || !neonDbUrl) {
        console.error("Missing required environment variables for Neon Auth.");
        return {
            statusCode: 500,
            body: 'Server configuration error.',
        };
    }

    let client;
    try {
        // Get a database client from your pool
        client = await getDbClient();

        // Use Neon Auth Helpers to handle the OAuth callback
        const {
            session, // Session object with user ID and expires_at
            cookie,  // Set-Cookie header value
            isNewUser, // Boolean if this is a new user
            userProfile // User profile data (e.g., from GitHub API)
        } = await handleAuthCallback({
            code,
            state,
            authSecret,
            githubClientId,
            githubClientSecret,
            dbClient: client, // Pass the database client
            // If you want to use the session to store custom data, you can provide an updateSession callback
            // updateSession: async (session, userProfile) => {
            //    // Store userProfile.id or other details in your 'users' table
            //    // For example: await client.query('INSERT INTO users (id, email, name) VALUES ($1, $2, $3) ON CONFLICT (id) DO UPDATE SET email = $2, name = $3', [userProfile.id, userProfile.email, userProfile.name]);
            //    return session; // Return updated session
            // }
        });

        // Redirect back to the frontend with the session cookie
        const redirectUrl = '/'; // Or any specific dashboard route

        return {
            statusCode: 302, // Redirect
            headers: {
                'Location': redirectUrl,
                'Set-Cookie': cookie, // Set the session cookie
                'Content-Type': 'text/html', // Ensure browser correctly handles redirect
            },
            body: '', // No body needed for a redirect
        };

    } catch (error) {
        console.error('Auth callback error:', error);
        // Redirect to an error page or main page with an error message
        return {
            statusCode: 302,
            headers: {
                'Location': '/?authError=true', // Redirect to home with an error query
            },
            body: '',
        };
    } finally {
        if (client) {
            client.release(); // Release the database client back to the pool
        }
    }
};
