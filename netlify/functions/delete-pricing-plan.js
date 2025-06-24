// netlify/functions/delete-pricing-plan.js

const { getDbClient } = require('./db-config');

/**
 * Netlify Function to delete a pricing plan.
 * This function should be strictly protected for admin access only.
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

    // In a real application, you'd verify the user making this request is an admin.
    const { id } = JSON.parse(event.body);

    if (!id) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Pricing plan ID is required.' }) };
    }

    let client;
    try {
        client = await getDbClient();

        const res = await client.query('DELETE FROM pricing_plans WHERE id = $1 RETURNING id', [id]);

        if (res.rows.length === 0) {
            return { statusCode: 404, headers, body: JSON.stringify({ error: 'Pricing plan not found.' }) };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: `Pricing plan ${id} deleted successfully.` }),
        };
    } catch (error) {
        console.error('Error deleting pricing plan:', error.message, error.stack);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to delete pricing plan', details: error.message }),
        };
    } finally {
        if (client) {
            client.release();
        }
    }
};
