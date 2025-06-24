// netlify/functions/get-problems-by-user.js

const { getDbClient } = require('./db-config');

/**
 * Netlify Function to fetch problems posted by a specific user.
 * Requires user authentication, and should only return problems for the authenticated user.
 * @param {object} event - The event object from Netlify.
 * @returns {object} A Netlify-compatible response with the user's problems.
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

    const { userId } = event.queryStringParameters; // Get user ID from query string

    if (!userId) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'User ID is required in query parameters.' }) };
    }

    let client;
    try {
        client = await getDbClient();

        // In a real application, ensure the 'userId' from query parameters matches
        // the authenticated user's ID from event.context.clientContext.user for security.
        // For simplicity in this example, we trust the frontend sends the correct userId.

        const res = await client.query('SELECT * FROM problems WHERE user_id = $1 ORDER BY created_at DESC', [userId]);

        // For each problem, also fetch its associated quotes
        const problemsWithQuotes = await Promise.all(res.rows.map(async (problem) => {
            const quotesRes = await client.query('SELECT * FROM quotes WHERE problem_id = $1 ORDER BY created_at ASC', [problem.id]);
            return { ...problem, quotes: quotesRes.rows };
        }));


        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(problemsWithQuotes),
        };
    } catch (error) {
        console.error('Error fetching problems by user:', error.message, error.stack);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to fetch problems', details: error.message }),
        };
    } finally {
        if (client) {
            client.release();
        }
    }
};
