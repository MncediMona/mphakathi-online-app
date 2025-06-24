// netlify/functions/approve-provider.js

const { getDbClient } = require('./db-config');

/**
 * Netlify Function to approve or unapprove a provider's status.
 * This function should be strictly protected for admin access only.
 * @param {object} event - The event object from Netlify.
 * @returns {object} A Netlify-compatible response.
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

    // In a real application, you'd verify the user making this request is an admin
    // using their session token before proceeding.
    const { providerId, isApproved } = JSON.parse(event.body);

    if (!providerId || typeof isApproved !== 'boolean') {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Provider ID and approval status are required.' }),
        };
    }

    let client;
    try {
        client = await getDbClient();

        const res = await client.query(
            'UPDATE user_profiles SET is_provider_approved = $1 WHERE id = $2 AND role = $3 RETURNING *',
            [isApproved, providerId, 'provider']
        );

        if (res.rows.length === 0) {
            return { statusCode: 404, headers, body: JSON.stringify({ error: 'Provider not found or not a provider role.' }) };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(res.rows[0]), // Return the updated provider profile
        };
    } catch (error) {
        console.error('Error updating provider approval status:', error.message, error.stack);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to update provider status', details: error.message }),
        };
    } finally {
        if (client) {
            client.release();
        }
    }
};
