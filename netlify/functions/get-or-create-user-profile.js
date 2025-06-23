// netlify/functions/get-or-create-user-profile.js

// Import utility functions for database access and JWT verification
const { getDbClient } = require('./utils/db');
const { verifyJwt } = require('./utils/auth');

/**
 * Netlify Function handler for creating or retrieving a user profile in the database.
 * This function is typically called by the frontend after a successful Auth0 login.
 * It verifies the JWT from the request, then checks if the user exists in the 'users' table.
 * If the user does not exist, a new user profile is created. Otherwise, the existing profile is returned.
 * @param {object} event - The event object from Netlify, containing request details.
 * @param {object} context - The context object from Netlify (not directly used here but part of the signature).
 * @returns {object} A Netlify-compatible response object with status code, headers, and JSON body.
 */
exports.handler = async (event, context) => {
    // Define CORS headers to allow requests from your frontend.
    // In production, consider restricting `Access-Control-Allow-Origin` to your specific frontend domain.
    const headers = {
        'Access-Control-Allow-Origin': '*', // Allows requests from any origin
        'Access-Control-Allow-Headers': 'Content-Type, Authorization', // Allows these headers in the request
        'Access-Control-Allow-Methods': 'POST, OPTIONS' // Allows POST and OPTIONS methods
    };

    // Handle OPTIONS preflight requests: browsers send these before complex cross-origin requests.
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers }; // Return 204 No Content with CORS headers
    }

    // Only allow POST requests for this endpoint.
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405, // Method Not Allowed
            headers,
            body: JSON.stringify({ error: 'Method Not Allowed' }),
        };
    }

    let client; // Declare client variable to hold the database connection

    try {
        // 1. Authenticate the request using the JWT provided in the Authorization header.
        const authResult = await verifyJwt(event.headers.authorization);
        // If authentication fails (e.g., no token, invalid token), return 401 Unauthorized.
        if (!authResult || !authResult.userId) {
            return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
        }

        // Parse the request body to get user data from the frontend.
        const requestData = JSON.parse(event.body);
        const { auth0Id, email, name } = requestData;

        // 2. Security Check: Ensure the Auth0 ID from the token matches the ID sent in the request body.
        // This prevents users from trying to fetch/create profiles for other users.
        if (authResult.userId !== auth0Id) {
            return { statusCode: 403, headers, body: JSON.stringify({ error: 'Forbidden: Mismatched user ID in token and request.' }) };
        }

        // Get a database client instance. This will reuse an existing connection if available.
        client = await getDbClient();

        // 3. Check if a user with this Auth0 ID already exists in the 'users' table.
        let res = await client.query('SELECT * FROM users WHERE id = $1', [auth0Id]);

        let userProfile;
        if (res.rows.length === 0) {
            // 4. If user does NOT exist, create a new user profile in the database.
            // Assign a default role of 'member'.
            userProfile = (await client.query(
                `INSERT INTO users (id, name, email, role, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *`,
                [auth0Id, name, email, 'member']
            )).rows[0];
            console.log(`New user created: ${auth0Id}`);
        } else {
            // 5. If user DOES exist, return their existing profile.
            userProfile = res.rows[0];
            // Optionally, update the user's name and email if they might have changed in Auth0.
            await client.query(
                `UPDATE users SET name = $1, email = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3`,
                [name, email, auth0Id]
            );
            console.log(`Existing user profile retrieved and updated (if needed): ${auth0Id}`);
        }

        // Return the user's profile data.
        return {
            statusCode: 200, // OK
            headers,
            body: JSON.stringify(userProfile),
        };

    } catch (error) {
        // Log and return a 500 Internal Server Error for any unexpected issues.
        console.error('Error in get-or-create-user-profile function:', error.message, error.stack);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to process user profile', details: error.message }),
        };
    } finally {
        // In serverless functions using connection pooling or client caching,
        // you generally do NOT call `client.end()` here. Let the runtime manage the connection lifecycle.
    }
};
