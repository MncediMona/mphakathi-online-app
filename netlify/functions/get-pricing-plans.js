// netlify/functions/get-pricing-plans.js

const { getDbClient } = require('./utils/db');

/**
 * Netlify Function handler for fetching all pricing plans.
 * This is a public endpoint and does not require authentication.
 * @param {object} event - The event object from Netlify.
 * @param {object} context - The context object.
 * @returns {object} A Netlify-compatible response containing a list of pricing plans.
 */
exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') { return { statusCode: 204, headers }; }
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    let client;
    try {
        client = await getDbClient();
        // Fetch all pricing plans, ordered by raw_price (numeric price) in ascending order.
        const res = await client.query('SELECT * FROM pricing_plans ORDER BY raw_price ASC');

        // Return the list of pricing plans.
        return { statusCode: 200, headers, body: JSON.stringify(res.rows) };

    } catch (error) {
        console.error('Error fetching pricing plans:', error.message, error.stack);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to fetch pricing plans', details: error.message }),
        };
    }
};
