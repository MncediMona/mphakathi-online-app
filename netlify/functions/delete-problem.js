// netlify/functions/delete-problem.js

const { getDbClient } = require('./utils/db');
const { verifyJwt } = require('./utils/auth');

/**
 * Netlify Function handler for deleting a problem and its associated quotes.
 * Requires authentication. Only the original problem requester or an admin can delete.
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
        // Authenticate the request.
        const authResult = await verifyJwt(event.headers.authorization);
        if (!authResult || !authResult.userId) {
            return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
        }
        const userId = authResult.userId; // The authenticated user's ID

        // Expect the problem ID to be in the request body for DELETE operations.
        const { problemId } = JSON.parse(event.body);
        if (!problemId) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Problem ID is required for deletion.' }) };
        }

        client = await getDbClient();

        // 1. Retrieve the problem to verify the requester and authorization.
        const problemRes = await client.query('SELECT requester_id FROM problems WHERE id = $1', [problemId]);
        if (problemRes.rows.length === 0) {
            return { statusCode: 404, headers, body: JSON.stringify({ error: 'Problem not found.' }) };
        }
        const requesterId = problemRes.rows[0].requester_id;

        // 2. Authorization Check: Only the original requester or an 'admin' can delete this problem.
        if (userId !== requesterId && authResult.role !== 'admin') {
            return { statusCode: 403, headers, body: JSON.stringify({ error: 'Forbidden: Not authorized to delete this problem.' }) };
        }

        // 3. Start a database transaction for atomicity.
        // This ensures that either both deletion operations succeed or both fail together.
        await client.query('BEGIN');

        // 4. Delete related quotes first (due to foreign key constraint with problems table).
        await client.query('DELETE FROM quotes WHERE problem_id = $1', [problemId]);
        console.log(`Deleted quotes associated with problem ${problemId}`);

        // 5. Delete the problem itself.
        const res = await client.query('DELETE FROM problems WHERE id = $1 RETURNING id', [problemId]);
        console.log(`Deleted problem ${problemId}`);

        // 6. Commit the transaction if all operations were successful.
        await client.query('COMMIT');

        // If no rows were returned from the problem deletion, it means the problem wasn't found (though we checked earlier).
        if (res.rows.length === 0) {
            return { statusCode: 404, headers, body: JSON.stringify({ error: 'Problem not found during final deletion step.' }) };
        }

        // Return a success message.
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'Problem and associated quotes deleted successfully.', id: problemId }),
        };

    } catch (error) {
        // If any error occurs during the transaction, roll back all changes.
        if (client) { // Ensure client exists before attempting rollback
            await client.query('ROLLBACK');
            console.error('Transaction rolled back due to error.');
        }
        console.error('Error deleting problem:', error.message, error.stack);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to delete problem', details: error.message }),
        };
    }
};
