// netlify/functions/get-all-users.js

const { getDbClient } = require('./db-config');

/**
 * Netlify Function to get all user profiles.
 * This function should be protected for admin access only in a production environment.
 * For this example, we assume the frontend restricts access.
 * @param {object} event - The event object from Netlify.
 * @returns {object} A Netlify-compatible response with all user profiles.
 */
exports.handler = async (event) => {
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
        client = await getDbClient();

        // Fetch all user profiles
        const res = await client.query('SELECT * FROM user_profiles ORDER BY created_at DESC');

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(res.rows),
        };
    } catch (error) {
        console.error('Error fetching all users:', error.message, error.stack);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to fetch users', details: error.message }),
        };
    } finally {
        if (client) {
            client.release();
        }
    }
};
