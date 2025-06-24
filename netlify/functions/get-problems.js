// netlify/functions/get-problems.js

const { getDbClient } = require('./db-config'); // Correct path

/**
 * Netlify Function handler for fetching all approved problems.
 * This endpoint is public and does not require authentication.
 * @param {object} event - The event object from Netlify.
 * @param {object} context - The context object.
 * @returns {object} A Netlify-compatible response containing a list of approved problems.
 */
exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers };
    }
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    let client;
    try {
        console.log('DB_CLIENT_LOG: Attempting to connect to DB for problems...'); // Debugging log
        client = await getDbClient();
        console.log('DB_CLIENT_LOG: DB client acquired for problems. Querying...'); // Debugging log

        // Fetch only problems that have been marked as 'is_approved = TRUE'.
        // This ensures only vetted problems are displayed publicly.
        // Order by creation date, latest first.
        const res = await client.query('SELECT * FROM problems WHERE is_approved = TRUE ORDER BY created_at DESC');
        console.log('DB_CLIENT_LOG: Problems query result count:', res.rows.length); // Debugging log

        return {
            statusCode: 200,
            headers: headers,
            body: JSON.stringify(res.rows),
        };
    } catch (error) {
        console.error('Error fetching problems:', error.message, error.stack);
        return {
            statusCode: 500,
            headers: headers,
            body: JSON.stringify({ error: 'Failed to fetch problems', details: error.message }),
        };
    } finally {
        if (client) {
            client.release();
            console.log('DB_CLIENT_LOG: DB client released for problems.'); // Debugging log
        }
    }
};