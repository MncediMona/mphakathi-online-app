// netlify/functions/get-my-problems.js

const { getDbClient } = require('./utils/db');
const { verifyJwt } = require('./utils/auth');

/**
 * Netlify Function handler for fetching problems posted by the authenticated user.
 * This endpoint requires authentication.
 * @param {object} event - The event object from Netlify.
 * @param {object} context - The context object.
 * @returns {object} A Netlify-compatible response containing a list of problems posted by the user.
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
        // Authenticate the request and get the user's ID from the JWT.
        const authResult = await verifyJwt(event.headers.authorization);
        if (!authResult || !authResult.userId) {
            return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
        }
        const requesterId = authResult.userId; // The ID of the authenticated user

        client = await getDbClient();
        // Fetch all problems where the requester_id matches the authenticated user's ID.
        const res = await client.query(
            'SELECT * FROM problems WHERE requester_id = $1 ORDER BY created_at DESC',
            [requesterId]
        );

        // Return the list of problems.
        return { statusCode: 200, headers, body: JSON.stringify(res.rows) };

    } catch (error) {
        console.error('Error fetching problems for user:', error.message, error.stack);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to fetch problems', details: error.message }),
        };
    }
};
