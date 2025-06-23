// netlify/functions/accept-quote.js

const { getDbClient } = require('./utils/db');
const { verifyJwt } = require('./utils/auth');

/**
 * Netlify Function handler for accepting a quote for a problem.
 * This endpoint requires authentication. Only the original problem requester can accept a quote.
 * Accepting a quote will:
 * 1. Mark the specified quote as 'accepted'.
 * 2. Mark all other quotes for the same problem as 'rejected'.
 * 3. Mark the associated problem's status as 'closed' and record the accepted quote ID.
 * All these operations are performed within a single database transaction for atomicity.
 * @param {object} event - The event object from Netlify.
 * @param {object} context - The context object.
 * @returns {object} A Netlify-compatible response with the updated problem and accepted quote data.
 */
exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'PUT, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') { return { statusCode: 204, headers }; }
    if (event.httpMethod !== 'PUT') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    let client;
    try {
        // 1. Authenticate the request.
        const authResult = await verifyJwt(event.headers.authorization);
        if (!authResult || !authResult.userId) {
            return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
        }
        const userId = authResult.userId; // The ID of the authenticated user

        // Parse the request body, expecting problemId and quoteId.
        const data = JSON.parse(event.body);
        const { problemId, quoteId } = data;

        // Basic validation.
        if (!problemId || !quoteId) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Problem ID and Quote ID are required.' }) };
        }

        client = await getDbClient();

        // 2. Verify that the authenticated user is the requester of the problem.
        // Also check if the problem is currently 'open' (only open problems can have quotes accepted).
        const problemRes = await client.query(
            'SELECT requester_id, status FROM problems WHERE id = $1',
            [problemId]
        );
        if (problemRes.rows.length === 0) {
            return { statusCode: 404, headers, body: JSON.stringify({ error: 'Problem not found.' }) };
        }
        const problem = problemRes.rows[0];

        if (userId !== problem.requester_id) {
            return { statusCode: 403, headers, body: JSON.stringify({ error: 'Forbidden: You are not the requester for this problem.' }) };
        }
        if (problem.status !== 'open') {
            return { statusCode: 400, headers, body: JSON.stringify({ error: `Problem status is '${problem.status}'. Only 'open' problems can have quotes accepted.` }) };
        }

        // 3. Start a database transaction for atomicity.
        await client.query('BEGIN');

        // 4. Mark the accepted quote as 'accepted'.
        const acceptedQuoteRes = await client.query(
            `UPDATE quotes SET status = 'accepted', updated_at = CURRENT_TIMESTAMP
             WHERE id = $1 AND problem_id = $2 RETURNING *`,
            [quoteId, problemId]
        );
        if (acceptedQuoteRes.rows.length === 0) {
            await client.query('ROLLBACK'); // Rollback if the quote couldn't be found/updated
            return { statusCode: 404, headers, body: JSON.stringify({ error: 'Quote not found for this problem or already accepted/rejected.' }) };
        }

        // 5. Mark all other (pending) quotes for this problem as 'rejected'.
        await client.query(
            `UPDATE quotes SET status = 'rejected', updated_at = CURRENT_TIMESTAMP
             WHERE problem_id = $1 AND id != $2 AND status = 'pending'`,
            [problemId, quoteId]
        );
        console.log(`Rejected other quotes for problem ${problemId}.`);

        // 6. Mark the problem as 'closed' and store the ID of the accepted quote.
        const problemUpdateRes = await client.query(
            `UPDATE problems SET status = 'closed', accepted_quote_id = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id = $2 RETURNING *`,
            [quoteId, problemId]
        );
        console.log(`Problem ${problemId} marked as closed with accepted quote ${quoteId}.`);

        // 7. Commit the transaction if all operations were successful.
        await client.query('COMMIT');

        // Return the updated problem and the accepted quote data.
        return {
            statusCode: 200,
            headers: headers,
            body: JSON.stringify({
                message: 'Quote accepted successfully! Problem closed and other quotes rejected.',
                problem: problemUpdateRes.rows[0],
                acceptedQuote: acceptedQuoteRes.rows[0],
            }),
        };

    } catch (error) {
        // If any error occurs, roll back the transaction to maintain data consistency.
        if (client) {
            await client.query('ROLLBACK');
            console.error('Transaction rolled back due to error.');
        }
        console.error('Error accepting quote:', error.message, error.stack);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to accept quote', details: error.message }),
        };
    }
};
