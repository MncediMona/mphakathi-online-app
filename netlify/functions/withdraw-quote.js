// netlify/functions/withdraw-quote.js

const { getDbClient } = require('./utils/db');
const { verifyJwt } = require('./utils/auth');

/**
 * Netlify Function handler for a provider to withdraw a submitted quote.
 * This endpoint requires authentication. A quote can only be withdrawn if:
 * 1. The authenticated user is the original provider of the quote.
 * 2. The quote's status is still 'pending' (i.e., not yet accepted or rejected).
 * @param {object} event - The event object from Netlify.
 * @param {object} context - The context object.
 * @returns {object} A Netlify-compatible response indicating success or failure.
 */
exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'DELETE, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') { return { statusCode: 204, headers }; }
    if (event.httpMethod !== 'DELETE') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    let client;
    try {
        // 1. Authenticate the request.
        const authResult = await verifyJwt(event.headers.authorization);
        if (!authResult || !authResult.userId) {
            return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
        }
        const providerId = authResult.userId; // The ID of the authenticated user

        // Expect the quote ID to be in the request body.
        const { quoteId } = JSON.parse(event.body);
        if (!quoteId) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Quote ID is required for withdrawal.' }) };
        }

        client = await getDbClient();

        // 2. Verify that the authenticated user is the provider of this quote
        // and that the quote is still in 'pending' status.
        const quoteRes = await client.query('SELECT provider_id, status FROM quotes WHERE id = $1', [quoteId]);
        if (quoteRes.rows.length === 0) {
            return { statusCode: 404, headers, body: JSON.stringify({ error: 'Quote not found.' }) };
        }
        const quote = quoteRes.rows[0];

        if (providerId !== quote.provider_id) {
            return { statusCode: 403, headers, body: JSON.stringify({ error: 'Forbidden: Not authorized to withdraw this quote.' }) };
        }
        if (quote.status !== 'pending') {
            return { statusCode: 400, headers, body: JSON.stringify({ error: `Cannot withdraw a quote that is not pending (current status: ${quote.status}).` }) };
        }

        // 3. Delete the quote from the database.
        const res = await client.query('DELETE FROM quotes WHERE id = $1 RETURNING id', [quoteId]);

        // If no rows were returned, the quote wasn't found (though already checked).
        if (res.rows.length === 0) {
            return { statusCode: 404, headers, body: JSON.stringify({ error: 'Quote not found during final deletion step.' }) };
        }

        // Return a success message.
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'Quote withdrawn successfully.', id: quoteId }),
        };

    } catch (error) {
        console.error('Error withdrawing quote:', error.message, error.stack);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to withdraw quote', details: error.message }),
        };
    }
};
