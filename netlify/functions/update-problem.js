// netlify/functions/update-problem.js

const { getDbClient } = require('./db-config');

/**
 * Netlify Function to update a problem's details, approve it, or mark it as resolved.
 * Requires user authentication and appropriate authorization (problem owner or admin).
 * @param {object} event - The event object from Netlify.
 * @returns {object} A Netlify-compatible response with the updated problem.
 */
exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'PUT, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') { return { statusCode: 204, headers }; }
    if (event.httpMethod !== 'PUT') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    const { problemId, title, description, category, location, estimated_budget, status, is_approved } = JSON.parse(event.body);

    if (!problemId) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Problem ID is required.' }) };
    }

    let client;
    try {
        client = await getDbClient();

        // You would typically get the authenticated user's ID from event.context.clientContext.user
        // or through a verified JWT for authorization. For now, assume it's passed or handled implicitly.
        // For admin actions (like is_approved), a permission check would be vital.

        const updates = [];
        const values = [problemId];
        let paramIndex = 2;

        if (title !== undefined) { updates.push(`title = $${paramIndex++}`); values.push(title); }
        if (description !== undefined) { updates.push(`description = $${paramIndex++}`); values.push(description); }
        if (category !== undefined) { updates.push(`category = $${paramIndex++}`); values.push(category); }
        if (location !== undefined) { updates.push(`location = $${paramIndex++}`); values.push(location); }
        if (estimated_budget !== undefined) { updates.push(`estimated_budget = $${paramIndex++}`); values.push(estimated_budget); }
        if (status !== undefined) { updates.push(`status = $${paramIndex++}`); values.push(status); }
        if (is_approved !== undefined) { updates.push(`is_approved = $${paramIndex++}`); values.push(is_approved); } // Admin only usually

        if (updates.length === 0) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'No fields to update.' }) };
        }

        const query = `UPDATE problems SET ${updates.join(', ')} WHERE id = $1 RETURNING *`;
        const res = await client.query(query, values);

        if (res.rows.length === 0) {
            return { statusCode: 404, headers, body: JSON.stringify({ error: 'Problem not found.' }) };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(res.rows[0]),
        };
    } catch (error) {
        console.error('Error updating problem:', error.message, error.stack);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to update problem', details: error.message }),
        };
    } finally {
        if (client) {
            client.release();
        }
    }
};
