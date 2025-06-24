// netlify/functions/get-pricing-plans.js

const { getDbClient } = require('./db-config'); // Correct path

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
        console.log('DB_CLIENT_LOG: Attempting to connect to DB for pricing plans...'); // Debugging log
        client = await getDbClient();
        console.log('DB_CLIENT_LOG: DB client acquired for pricing plans. Querying...'); // Debugging log

        // Fetch all pricing plans, ordered by raw_price (numeric price) in ascending order.
        // The CASE statement handles NULL raw_price for 'Contact Us' plans to appear last.
        const res = await client.query(`
            SELECT *
            FROM pricing_plans
            ORDER BY
                CASE WHEN raw_price IS NULL THEN 2 -- Platinum (Contact Us) will be last
                     WHEN raw_price = 0 THEN 0   -- Free plan will be first
                     ELSE 1                      -- All other plans
                END,
                raw_price ASC
        `);
        console.log('DB_CLIENT_LOG: Pricing plans query result count:', res.rows.length); // Debugging log

        return { statusCode: 200, headers, body: JSON.stringify(res.rows) };

    } catch (error) {
        console.error('Error fetching pricing plans:', error.message, error.stack);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to fetch pricing plans', details: error.message }),
        };
    } finally {
        if (client) {
            client.release();
            console.log('DB_CLIENT_LOG: DB client released for pricing plans.'); // Debugging log
        }
    }
};