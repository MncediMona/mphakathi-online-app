// netlify/functions/save-pricing-plan.js

const { getDbClient } = require('./utils/db');
const { verifyJwt } = require('./utils/auth');

/**
 * Netlify Function handler for creating or updating pricing plans.
 * This endpoint requires authentication and specifically checks for an 'admin' role.
 * It supports both creating new plans (POST) and updating existing ones (PUT).
 * @param {object} event - The event object from Netlify.
 * @param {object} context - The context object (used to generate ID for new plans).
 * @returns {object} A Netlify-compatible response with the created or updated pricing plan data.
 */
exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, PUT, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') { return { statusCode: 204, headers }; }
    // Allow both POST (for creation) and PUT (for update) methods.
    if (!['POST', 'PUT'].includes(event.httpMethod)) {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    let client;
    try {
        // 1. Authenticate the request and verify the user has 'admin' role.
        const authResult = await verifyJwt(event.headers.authorization);
        if (!authResult || authResult.role !== 'admin') {
            return { statusCode: 403, headers, body: JSON.stringify({ error: 'Forbidden: Admin access required.' }) };
        }

        // 2. Parse the request body for pricing plan details.
        const data = JSON.parse(event.body);
        const { id, name, price_display, raw_price, interval, plan_code, features } = data;

        // Basic validation for required fields for any pricing plan.
        if (!name || !price_display || !interval || !features) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing required fields for pricing plan: name, price_display, interval, features are mandatory.' }) };
        }

        client = await getDbClient();
        let res;

        if (id) {
            // 3. If an 'id' is provided, it's an update operation (PUT).
            res = await client.query(
                `UPDATE pricing_plans
                 SET name = $1, price_display = $2, raw_price = $3, interval = $4, plan_code = $5, features = $6, updated_at = CURRENT_TIMESTAMP
                 WHERE id = $7 RETURNING *`,
                [name, price_display, raw_price, interval, plan_code, features, id]
            );
            if (res.rows.length === 0) {
                return { statusCode: 404, headers, body: JSON.stringify({ error: 'Pricing plan not found for update.' }) };
            }
        } else {
            // 4. If no 'id' is provided, it's a creation operation (POST).
            const newId = context.awsRequestId; // Use AWS Lambda request ID for a unique ID
            res = await client.query(
                `INSERT INTO pricing_plans (id, name, price_display, raw_price, interval, plan_code, features, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *`,
                [newId, name, price_display, raw_price, interval, plan_code, features]
            );
            // Check for uniqueness constraint if a unique name is expected and it conflicts
            // This might throw a 23505 (unique_violation) error from PostgreSQL
            if (res.rows.length === 0) {
                return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to create pricing plan. Possible duplicate name.' }) };
            }
        }

        // 5. Return the created or updated pricing plan data.
        return { statusCode: 200, headers, body: JSON.stringify(res.rows[0]) };

    } catch (error) {
        // Handle specific PostgreSQL unique constraint violation for 'name'
        if (error.code === '23505' && error.constraint === 'pricing_plans_name_key') {
            console.error('Duplicate pricing plan name:', error.message);
            return {
                statusCode: 409, // Conflict
                headers,
                body: JSON.stringify({ error: 'Pricing plan with this name already exists.', details: error.message }),
            };
        }
        console.error('Error saving pricing plan:', error.message, error.stack);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to save pricing plan', details: error.message }),
        };
    }
};
