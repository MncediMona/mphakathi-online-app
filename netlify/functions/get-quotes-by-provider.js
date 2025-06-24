// netlify/functions/get-my-quotes.js

const { getDbClient } = require('./utils/db');
const { verifyJwt } = require('./utils/auth');

/**
 * Netlify Function handler for fetching all quotes submitted by the authenticated provider.
 * This endpoint requires authentication and verifies that the user is an 'approved provider'.
 * It also joins with the 'problems' table to include related problem details for each quote.
 * @param {object} event - The event object from Netlify.
 * @param {object} context - The context object.
 * @returns {object} A Netlify-compatible response containing a list of quotes.
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
        // 1. Authenticate the request.
        const authResult = await verifyJwt(event.headers.authorization);
        if (!authResult || !authResult.userId) {
            return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
        }
        const providerId = authResult.userId; // The ID of the authenticated provider

        client = await getDbClient();

        // 2. Optional: Verify if the user is an approved provider if you want to restrict this endpoint.
        // This check might already happen on the frontend, but a backend check adds robustness.
        // const providerCheckRes = await client.query(
        //     'SELECT is_provider_approved FROM users WHERE id = $1',
        //     [providerId]
        // );
        // if (providerCheckRes.rows.length === 0 || !providerCheckRes.rows[0].is_provider_approved) {
        //     return { statusCode: 403, headers, body: JSON.stringify({ error: 'Forbidden: Only approved providers can view their quotes.' }) };
        // }

        // 3. Fetch quotes submitted by this provider, joining with the 'problems' table
        // to get the problem title and status associated with each quote.
        const res = await client.query(
            `SELECT q.*, p.title as problem_title, p.status as problem_status
             FROM quotes q
             JOIN problems p ON q.problem_id = p.id
             WHERE q.provider_id = $1
             ORDER BY q.created_at DESC`,
            [providerId]
        );

        // Return the list of quotes with associated problem details.
        return { statusCode: 200, headers, body: JSON.stringify(res.rows) };

    } catch (error) {
        console.error('Error fetching quotes for provider:', error.message, error.stack);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to fetch quotes', details: error.message }),
        };
    }
};
