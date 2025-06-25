// netlify/functions/get-or-create-user-profile.js

const { getDbClient } = require('./db-config');

/**
 * Netlify Function to get an existing user profile or create a new one.
 * Triggered after successful authentication (e.g., by Auth.js adapter or frontend).
 * @param {object} event - The event object from Netlify.
 * @returns {object} A Netlify-compatible response with the user profile data.
 */
exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') { return { statusCode: 204, headers }; }
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    let client;
    try {
        const { auth0Id, email, name } = JSON.parse(event.body);

        if (!auth0Id || !email) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing auth0Id or email in request body.' }),
            };
        }

        client = await getDbClient();

        // Try to find an existing user profile by their auth0_id (provider ID from Auth.js)
        let res = await client.query('SELECT * FROM user_profiles WHERE auth0_id = $1', [auth0Id]);

        let userProfile;

        if (res.rows.length > 0) {
            // User profile exists
            userProfile = res.rows[0];
            console.log(`User profile found for ${email}. ID: ${userProfile.id}`);
        } else {
            // User profile does not exist, create a new one
            console.log(`Creating new user profile for ${email}...`);
            const insertRes = await client.query(
                `INSERT INTO user_profiles (auth0_id, email, name, role, is_paid_member, is_provider_approved)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 ON CONFLICT (email) DO UPDATE SET
                    auth0_id = EXCLUDED.auth0_id,
                    name = EXCLUDED.name
                 RETURNING *`,
                [auth0Id, email, name || email.split('@')[0], 'member', false, false] // Default role 'member', not paid, not approved provider
            );
            userProfile = insertRes.rows[0];
            console.log(`New user profile created with ID: ${userProfile.id}`);
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(userProfile),
        };
    } catch (error) {
        console.error('Error in get-or-create-user-profile:', error.message, error.stack);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to process user profile', details: error.message }),
        };
    } finally {
        if (client) {
            client.release();
        }
    }
};
