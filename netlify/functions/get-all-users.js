// netlify/functions/get-all-users.js

const { getDbClient } = require('./utils/db');
const { verifyJwt } = require('./utils/auth');

/**
 * Netlify Function handler for fetching a list of all users.
 * This endpoint requires authentication and specifically checks for an 'admin' role.
 * @param {object} event - The event object from Netlify.
 * @param {object} context - The context object.
 * @returns {object} A Netlify-compatible response with a list of all user profiles.
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
        // 1. Authenticate the request and verify the user has 'admin' role.
        const authResult = await verifyJwt(event.headers.authorization);
        if (!authResult || authResult.role !== 'admin') {
            return { statusCode: 403, headers, body: JSON.stringify({ error: 'Forbidden: Admin access required.' }) };
        }

        client = await getDbClient();
        // 2. Fetch all user records from the 'users' table, ordered by creation date.
        const res = await client.query('SELECT * FROM users ORDER BY created_at DESC');

        // 3. Return the list of user profiles.
        return { statusCode: 200, headers, body: JSON.stringify(res.rows) };

    } catch (error) {
        console.error('Error fetching all users:', error.message, error.stack);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to fetch users', details: error.message }),
        };
    }
};
