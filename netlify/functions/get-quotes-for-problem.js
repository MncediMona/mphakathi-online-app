// netlify/functions/get-quotes-for-problem.js

const { getDbClient } = require('./db-config');

/**
 * Netlify Function to fetch all quotes for a specific problem.
 * This should typically be restricted to the problem owner or admin,
 * or for public viewing after problem resolution/acceptance.
 * For now, it fetches all but client-side logic will hide confidential info.
 * @param {object} event - The event object from Netlify.
 * @returns {object} A Netlify-compatible response with the problem's quotes.
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

        // Join with user_profiles to get provider names for display
        const res = await client.query(
            `SELECT q.*, up.name as provider_name, up.email as provider_email
             FROM quotes q
             JOIN user_profiles up ON q.provider_id = up.id
             WHERE q.problem_id = $1 ORDER BY q.created_at ASC`,
            [problemId]
        );

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(res.rows),
        };
    } catch (error) {
        console.error('Error fetching quotes for problem:', error.message, error.stack);
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
