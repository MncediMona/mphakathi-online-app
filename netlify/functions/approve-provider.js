// netlify/functions/approve-provider.js

const { getDbClient } = require('./utils/db');
const { verifyJwt } = require('./utils/auth');

/**
 * Netlify Function handler for approving or unapproving a provider.
 * This endpoint requires authentication and specifically checks for an 'admin' role.
 * @param {object} event - The event object from Netlify.
 * @param {object} context - The context object.
 * @returns {object} A Netlify-compatible response with the updated provider's user data.
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
        // 1. Authenticate the request and verify the user has 'admin' role.
        const authResult = await verifyJwt(event.headers.authorization);
        // This check assumes Auth0 is configured to include roles in the JWT,
        // and your `verifyJwt` utility is updated to extract them.
        if (!authResult || authResult.role !== 'admin') {
            return { statusCode: 403, headers, body: JSON.stringify({ error: 'Forbidden: Admin access required.' }) };
        }

        // 2. Parse the request body for the provider's ID and the approval status.
        const { providerId, isApproved } = JSON.parse(event.body);
        if (!providerId || typeof isApproved !== 'boolean') {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Provider ID and boolean isApproved status are required.' }) };
        }

        client = await getDbClient();

        // 3. Update the `is_provider_approved` status for the specified user,
        // ensuring they also have the 'provider' role.
        const res = await client.query(
            `UPDATE users SET is_provider_approved = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id = $2 AND role = 'provider' RETURNING *`,
            [isApproved, providerId]
        );

        // 4. If no rows were updated, the provider was not found or did not have the 'provider' role.
        if (res.rows.length === 0) {
            return { statusCode: 404, headers, body: JSON.stringify({ error: 'Provider not found or user is not a provider.' }) };
        }

        // 5. Return the updated provider's user data.
        return { statusCode: 200, headers, body: JSON.stringify(res.rows[0]) };

    } catch (error) {
        console.error('Error approving provider:', error.message, error.stack);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to approve provider', details: error.message }),
        };
    }
};
