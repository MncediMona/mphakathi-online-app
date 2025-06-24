// netlify/functions/save-branding.js

const { getDbClient } = require('./db-config');

/**
 * Netlify Function to save/update application branding settings.
 * This function should be strictly protected for admin access only.
 * @param {object} event - The event object from Netlify.
 * @returns {object} A Netlify-compatible response with the updated branding data.
 */
exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'PUT, POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') { return { statusCode: 204, headers }; }
    if (event.httpMethod !== 'PUT' && event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    // In a real application, you'd verify the user making this request is an admin.
    const { app_name, app_logo_url } = JSON.parse(event.body);

    let client;
    try {
        client = await getDbClient();

        // Assuming there's typically one branding record, usually with ID 1
        // We'll use UPSERT (INSERT ON CONFLICT) to create if not exists, update if exists.
        const res = await client.query(
            `INSERT INTO branding (id, app_name, app_logo_url)
             VALUES (1, $1, $2)
             ON CONFLICT (id) DO UPDATE SET
               app_name = EXCLUDED.app_name,
               app_logo_url = EXCLUDED.app_logo_url
             RETURNING *`,
            [app_name, app_logo_url]
        );

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(res.rows[0]),
        };
    } catch (error) {
        console.error('Error saving branding:', error.message, error.stack);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to save branding', details: error.message }),
        };
    } finally {
        if (client) {
            client.release();
        }
    }
};
