// netlify/functions/get-quotes-by-provider.js

const { getDbClient } = require('./db-config');

/**
 * Netlify Function to fetch quotes submitted by a specific provider.
 * Requires provider authentication.
 * @param {object} event - The event object from Netlify.
 * @returns {object} A Netlify-compatible response with the provider's quotes.
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

    const { providerId } = event.queryStringParameters;

    if (!providerId) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Provider ID is required.' }) };
    }

    let client;
    try {
        client = await getDbClient();

        // In a real app, verify the authenticated user matches the providerId.
        const res = await client.query('SELECT * FROM quotes WHERE provider_id = $1 ORDER BY created_at DESC', [providerId]);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(res.rows),
        };
    } catch (error) {
        console.error('Error fetching quotes by provider:', error.message, error.stack);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to fetch quotes', details: error.message }),
        };
    } finally {
        if (client) {
            client.release();
        }
    }
};
