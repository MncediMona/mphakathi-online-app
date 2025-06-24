// netlify/functions/save-pricing-plan.js

const { getDbClient } = require('./db-config');

/**
 * Netlify Function to save or update a pricing plan.
 * This function should be strictly protected for admin access only.
 * @param {object} event - The event object from Netlify.
 * @returns {object} A Netlify-compatible response with the saved/updated plan.
 */
exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, PUT, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') { return { statusCode: 204, headers }; }
    if (event.httpMethod !== 'POST' && event.httpMethod !== 'PUT') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    // In a real application, you'd verify the user making this request is an admin.
    const { id, name, description, price_cents, price_display, features, raw_price, interval, plan_code } = JSON.parse(event.body);

    if (!name || !price_display || features === undefined) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Missing required plan fields (name, price_display, features).' }),
        };
    }

    let client;
    try {
        client = await getDbClient();

        let res;
        if (id) { // Update existing plan
            const query = `
                UPDATE pricing_plans
                SET name = $1, description = $2, price_cents = $3, price_display = $4, features = $5,
                    raw_price = $6, interval = $7, plan_code = $8
                WHERE id = $9 RETURNING *`;
            res = await client.query(query, [name, description, price_cents, price_display, features, raw_price, interval, plan_code, id]);
        } else { // Insert new plan
            const query = `
                INSERT INTO pricing_plans (name, description, price_cents, price_display, features, raw_price, interval, plan_code)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`;
            res = await client.query(query, [name, description, price_cents, price_display, features, raw_price, interval, plan_code]);
        }

        if (res.rows.length === 0) {
            return { statusCode: 404, headers, body: JSON.stringify({ error: 'Pricing plan not found for update, or failed to create.' }) };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(res.rows[0]),
        };
    } catch (error) {
        console.error('Error saving pricing plan:', error.message, error.stack);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to save pricing plan', details: error.message }),
        };
    } finally {
        if (client) {
            client.release();
        }
    }
};
