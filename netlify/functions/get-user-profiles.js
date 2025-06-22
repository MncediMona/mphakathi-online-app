// netlify/functions/get-user-profile.js

const { getDbClient } = require('./utils/db');
const { verifyJwt } = require('./utils/auth');

/**
 * Netlify Function handler for fetching a user's profile.
 * Allows an authenticated user to fetch their own profile, and an admin user to fetch any profile.
 * @param {object} event - The event object from Netlify.
 * @param {object} context - The context object.
 * @returns {object} A Netlify-compatible response.
 */
exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') { return { statusCode: 204, headers }; }
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    let client;
    try {
        // Authenticate the request. This endpoint requires authentication.
        const authResult = await verifyJwt(event.headers.authorization);
        if (!authResult || !authResult.userId) {
            return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
        }
        const currentUserId = authResult.userId; // The ID of the currently authenticated user

        // Determine the target user ID: either from query parameters (for admin access)
        // or default to the current authenticated user's ID.
        const targetUserId = event.queryStringParameters.id || currentUserId;

        // Authorization check:
        // A regular user can only fetch their own profile (currentUserId === targetUserId).
        // An 'admin' user (if roles are configured in Auth0 and available in `authResult.role`)
        // can fetch any user's profile.
        // REMINDER: You need to set up Auth0 custom claims for roles for `authResult.role` to work.
        if (currentUserId !== targetUserId && authResult.role !== 'admin') {
            return { statusCode: 403, headers, body: JSON.stringify({ error: 'Forbidden: Not authorized to view this profile.' }) };
        }

        client = await getDbClient();
        const res = await client.query('SELECT * FROM users WHERE id = $1', [targetUserId]);

        if (res.rows.length === 0) {
            return { statusCode: 404, headers, body: JSON.stringify({ error: 'User profile not found.' }) };
        }

        return { statusCode: 200, headers, body: JSON.stringify(res.rows[0]) };

    } catch (error) {
        console.error('Error fetching user profile:', error.message, error.stack);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to fetch profile', details: error.message }),
        };
    }
};
