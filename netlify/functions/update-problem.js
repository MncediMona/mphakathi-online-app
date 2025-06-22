// netlify/functions/update-problem.js

const { getDbClient } = require('./utils/db');
const { verifyJwt } = require('./utils/auth');

/**
 * Netlify Function handler for updating an existing problem.
 * Requires authentication. Only the original problem requester or an admin can update.
 * @param {object} event - The event object from Netlify.
 * @param {object} context - The context object.
 * @returns {object} A Netlify-compatible response with the updated problem data.
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
        // Authenticate the request.
        const authResult = await verifyJwt(event.headers.authorization);
        if (!authResult || !authResult.userId) {
            return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
        }
        const userId = authResult.userId; // The authenticated user's ID
        const data = JSON.parse(event.body);
        const { problemId, title, description, category, location, estimated_budget, status, is_approved, accepted_quote_id } = data;

        // Basic validation.
        if (!problemId) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Problem ID is required for update.' }) };
        }

        client = await getDbClient();

        // 1. Retrieve the problem to check requester_id and current status.
        const problemRes = await client.query('SELECT requester_id, status FROM problems WHERE id = $1', [problemId]);
        if (problemRes.rows.length === 0) {
            return { statusCode: 404, headers, body: JSON.stringify({ error: 'Problem not found.' }) };
        }
        const problem = problemRes.rows[0];
        const requesterId = problem.requester_id;

        // 2. Authorization Check: Only the original requester or an 'admin' can update this problem.
        // REMINDER: `authResult.role` relies on Auth0 custom claims for roles.
        if (userId !== requesterId && authResult.role !== 'admin') {
            return { statusCode: 403, headers, body: JSON.stringify({ error: 'Forbidden: Not authorized to update this problem.' }) };
        }

        // 3. Construct the dynamic UPDATE query.
        const updates = [];
        const values = [];
        let paramIndex = 1;

        // Add fields to update only if they are provided in the request body.
        if (title !== undefined) { updates.push(`title = $${paramIndex++}`); values.push(title); }
        if (description !== undefined) { updates.push(`description = $${paramIndex++}`); values.push(description); }
        if (category !== undefined) { updates.push(`category = $${paramIndex++}`); values.push(category); }
        if (location !== undefined) { updates.push(`location = $${paramIndex++}`); values.push(location); }
        if (estimated_budget !== undefined) { updates.push(`estimated_budget = $${paramIndex++}`); values.push(estimated_budget); }
        if (status !== undefined) { updates.push(`status = $${paramIndex++}`); values.push(status); }
        // Admin-only updates for `is_approved` and `accepted_quote_id`
        if (is_approved !== undefined && authResult.role === 'admin') { updates.push(`is_approved = $${paramIndex++}`); values.push(is_approved); }
        if (accepted_quote_id !== undefined) { updates.push(`accepted_quote_id = $${paramIndex++}`); values.push(accepted_quote_id); }

        // Always update the `updated_at` timestamp.
        updates.push(`updated_at = CURRENT_TIMESTAMP`);

        // If no actual data fields were provided for update (only timestamp would be updated), return early.
        if (updates.length === 1 && updates[0].includes('updated_at')) {
            return { statusCode: 200, headers, body: JSON.stringify({ message: 'No changes provided for problem update.' }) };
        }

        // Add the problem ID to the values array for the WHERE clause.
        values.push(problemId);

        // Execute the UPDATE query.
        const queryText = `UPDATE problems SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
        const res = await client.query(queryText, values);

        // Return the updated problem data.
        return { statusCode: 200, headers, body: JSON.stringify(res.rows[0]) };

    } catch (error) {
        console.error('Error updating problem:', error.message, error.stack);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to update problem', details: error.message }),
        };
    }
};
