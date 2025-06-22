// netlify/functions/get-branding.js

const { getDbClient } = require('./utils/db');

/**
 * Netlify Function handler for fetching application branding settings.
 * This is a public endpoint and does not require authentication.
 * It retrieves the app name and logo URL from a 'branding' table in the database.
 * If no branding is found in the database, it returns default values.
 * @param {object} event - The event object from Netlify.
 * @param {object} context - The context object.
 * @returns {object} A Netlify-compatible response with the branding data.
 */
exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type', // No Authorization header needed for public endpoint
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') { return { statusCode: 204, headers }; }
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    let client;
    try {
        client = await getDbClient();
        // Assuming a 'branding' table with a single row (e.g., ID 1) for global settings.
        const res = await client.query('SELECT app_name, app_logo_url FROM branding WHERE id = 1');

        if (res.rows.length === 0) {
            // If no branding data is found in the database, return hardcoded defaults.
            console.warn('No branding data found in DB, returning default values.');
            return {
                statusCode: 200,
                headers: headers,
                body: JSON.stringify({
                    app_name: 'Mphakathi Online',
                    app_logo_url: 'https://placehold.co/100x40/964b00/ffffff?text=Logo' // Placeholder logo
                }),
            };
        }

        // Return the branding data found in the database.
        return { statusCode: 200, headers, body: JSON.stringify(res.rows[0]) };

    } catch (error) {
        console.error('Error fetching branding:', error.message, error.stack);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to fetch branding', details: error.message }),
        };
    }
};
