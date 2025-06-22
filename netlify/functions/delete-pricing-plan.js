// netlify/functions/delete-pricing-plan.js

const { getDbClient } = require('./utils/db');
const { verifyJwt } = require('./utils/auth');

/**
 * Netlify Function handler for deleting a pricing plan.
 * This endpoint requires authentication and specifically checks for an 'admin' role.
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
        // 1. Authenticate the request and verify the user has 'admin' role.
        const authResult = await verifyJwt(event.headers.authorization);
        if (!authResult || authResult.role !== 'admin') {
            return { statusCode: 403, headers, body: JSON.stringify({ error: 'Forbidden: Admin access required.' }) };
        }

        // 2. Expect the pricing plan ID in the request body.
        const { id } = JSON.parse(event.body);
        if (!id) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Pricing plan ID is required for deletion.' }) };
        }

        client = await getDbClient();
        // 3. Delete the pricing plan from the database.
        const res = await client.query('DELETE FROM pricing_plans WHERE id = $1 RETURNING id', [id]);

        // 4. If no rows were returned, the pricing plan was not found.
        if (res.rows.length === 0) {
            return { statusCode: 404, headers, body: JSON.stringify({ error: 'Pricing plan not found.' }) };
        }

        // 5. Return a success message.
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'Pricing plan deleted successfully.', id: id }),
        };

    } catch (error) {
        console.error('Error deleting pricing plan:', error.message, error.stack);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to delete pricing plan', details: error.message }),
        };
    }
};
