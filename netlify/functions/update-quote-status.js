// netlify/functions/update-quote-status.js

const { getDbClient } = require('./db-config');

/**
 * Netlify Function to update a quote's status (e.g., 'accepted', 'withdrawn').
 * Requires authentication and appropriate authorization.
 * @param {object} event - The event object from Netlify.
 * @returns {object} A Netlify-compatible response with the updated quote.
 */
exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS' // POST or PUT
    };

    if (event.httpMethod === 'OPTIONS') { return { statusCode: 204, headers }; }
    if (event.httpMethod !== 'POST') { // Assuming POST for status updates
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    const { quoteId, status, problemId, userId } = JSON.parse(event.body); // userId is the DB user id

    if (!quoteId || !status || !problemId || !userId) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Missing required fields: quoteId, status, problemId, or userId.' }),
        };
    }

    let client;
    try {
        client = await getDbClient();

        // Get problem owner's ID and current problem status
        const problemRes = await client.query('SELECT user_id, status FROM problems WHERE id = $1', [problemId]);
        if (problemRes.rows.length === 0) {
            return { statusCode: 404, headers, body: JSON.stringify({ error: 'Problem not found.' }) };
        }
        const problemOwnerId = problemRes.rows[0].user_id;
        const problemStatus = problemRes.rows[0].status;

        // Get quote's provider ID
        const quoteRes = await client.query('SELECT provider_id FROM quotes WHERE id = $1', [quoteId]);
        if (quoteRes.rows.length === 0) {
            return { statusCode: 404, headers, body: JSON.stringify({ error: 'Quote not found.' }) };
        }
        const quoteProviderId = quoteRes.rows[0].provider_id;

        let updatedQuote;

        if (status === 'accepted') {
            // Only the problem owner can accept a quote
            if (userId !== problemOwnerId) {
                return { statusCode: 403, headers, body: JSON.stringify({ error: 'Unauthorized to accept this quote.' }) };
            }
            // Only if problem is still open
            if (problemStatus !== 'open') {
                return { statusCode: 400, headers, body: JSON.stringify({ error: 'Cannot accept quote for a problem that is not open.' }) };
            }

            // Start transaction
            await client.query('BEGIN');

            // 1. Mark the selected quote as accepted
            const acceptRes = await client.query(
                `UPDATE quotes SET status = 'accepted' WHERE id = $1 RETURNING *`,
                [quoteId]
            );
            updatedQuote = acceptRes.rows[0];

            // 2. Mark all other quotes for this problem as rejected
            await client.query(
                `UPDATE quotes SET status = 'rejected' WHERE problem_id = $1 AND id != $2`,
                [problemId, quoteId]
            );

            // 3. Mark the problem itself as closed and link the accepted quote
            await client.query(
                `UPDATE problems SET status = 'closed', accepted_quote_id = $1 WHERE id = $2`,
                [quoteId, problemId]
            );

            await client.query('COMMIT'); // Commit transaction

        } else if (status === 'withdrawn') {
            // Only the provider who submitted the quote can withdraw it
            if (userId !== quoteProviderId) {
                return { statusCode: 403, headers, body: JSON.stringify({ error: 'Unauthorized to withdraw this quote.' }) };
            }
            // Only if the problem is still open and quote is pending
            if (problemStatus !== 'open' || quoteRes.rows[0].status !== 'pending') {
                return { statusCode: 400, headers, body: JSON.stringify({ error: 'Cannot withdraw a quote unless problem is open and quote is pending.' }) };
            }

            const withdrawRes = await client.query(
                `UPDATE quotes SET status = 'withdrawn' WHERE id = $1 RETURNING *`,
                [quoteId]
            );
            updatedQuote = withdrawRes.rows[0];
        } else {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid status provided.' }) };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(updatedQuote),
        };
    } catch (error) {
        await client?.query('ROLLBACK'); // Rollback transaction on error
        console.error('Error updating quote status:', error.message, error.stack);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to update quote status', details: error.message }),
        };
    } finally {
        if (client) {
            client.release();
        }
    }
};
