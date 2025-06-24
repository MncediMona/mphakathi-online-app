// netlify/functions/get-problem-by-id.js

const { getDbClient } = require('./db-config');

/**
 * Netlify Function to fetch a single problem by its ID.
 * @param {object} event - The event object from Netlify.
 * @returns {object} A Netlify-compatible response with the problem data.
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

    const { problemId } = event.queryStringParameters;

    if (!problemId) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Problem ID is required.' }) };
    }

    let client;
    try {
        client = await getDbClient();

        const res = await client.query('SELECT * FROM problems WHERE id = $1', [problemId]);

        if (res.rows.length === 0) {
            return { statusCode: 404, headers, body: JSON.stringify({ error: 'Problem not found.' }) };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(res.rows[0]),
        };
    } catch (error) {
        console.error('Error fetching problem by ID:', error.message, error.stack);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to fetch problem', details: error.message }),
        };
    } finally {
        if (client) {
            client.release();
        }
    }
};
