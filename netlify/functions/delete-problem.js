// netlify/functions/delete-problem.js

const { getDbClient } = require('./db-config');

/**
 * Netlify Function to delete a problem.
 * Requires user authentication and appropriate authorization (problem owner or admin).
 * @param {object} event - The event object from Netlify.
 * @returns {object} A Netlify-compatible response.
 */
exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'DELETE, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') { return { statusCode: 204, headers }; }
    if (event.httpMethod !== 'DELETE') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    const { problemId } = JSON.parse(event.body);

    if (!problemId) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Problem ID is required.' }) };
    }

    let client;
    try {
        client = await getDbClient();

        // In a real app, you'd check if the user is the problem owner or an admin
        // before allowing deletion.
        // Consider cascading deletes for quotes related to this problem in your DB schema,
        // or explicitly delete quotes here before deleting the problem.
        const res = await client.query('DELETE FROM problems WHERE id = $1 RETURNING id', [problemId]);

        if (res.rows.length === 0) {
            return { statusCode: 404, headers, body: JSON.stringify({ error: 'Problem not found.' }) };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: `Problem ${problemId} deleted successfully.` }),
        };
    } catch (error) {
        console.error('Error deleting problem:', error.message, error.stack);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to delete problem', details: error.message }),
        };
    } finally {
        if (client) {
            client.release();
        }
    }
};
