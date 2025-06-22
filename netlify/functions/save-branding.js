// netlify/functions/save-branding.js

const { getDbClient } = require('./utils/db');
const { verifyJwt } = require('./utils/auth');

/**
 * Netlify Function handler for saving (updating) application branding settings.
 * This endpoint requires authentication and specifically checks for an 'admin' role.
 * It inserts new branding data (if none exists) or updates the existing one (for ID 1).
 * @param {object} event - The event object from Netlify.
 * @param {object} context - The context object.
 * @returns {object} A Netlify-compatible response with the updated branding data.
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
        if (!authResult || authResult.role !== 'admin') {
            return { statusCode: 403, headers, body: JSON.stringify({ error: 'Forbidden: Admin access required.' }) };
        }

        // 2. Parse the request body for branding details.
        const data = JSON.parse(event.body);
        const { app_name, app_logo_url } = data; // Expect app_name and app_logo_url

        // Basic validation.
        if (app_name === undefined && app_logo_url === undefined) {
             return { statusCode: 400, headers, body: JSON.stringify({ error: 'No branding fields provided for update.' }) };
        }

        client = await getDbClient();

        // 3. Insert or Update the branding data for a fixed ID (e.g., ID 1) to manage global settings.
        // `ON CONFLICT (id) DO UPDATE` allows updating if the row exists, inserting if it doesn't.
        const res = await client.query(
            `INSERT INTO branding (id, app_name, app_logo_url, updated_at)
             VALUES (1, $1, $2, CURRENT_TIMESTAMP)
             ON CONFLICT (id) DO UPDATE SET
                app_name = COALESCE(EXCLUDED.app_name, branding.app_name),
                app_logo_url = COALESCE(EXCLUDED.app_logo_url, branding.app_logo_url),
                updated_at = CURRENT_TIMESTAMP
             RETURNING *`,
            [app_name, app_logo_url]
        );
        // COALESCE is used here to ensure that if a field is not provided in the update,
        // it retains its existing value rather than becoming null.

        // 4. Return the updated branding data.
        return { statusCode: 200, headers, body: JSON.stringify(res.rows[0]) };

    } catch (error) {
        console.error('Error saving branding:', error.message, error.stack);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to save branding', details: error.message }),
        };
    }
};
