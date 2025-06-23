// netlify/functions/update-user-profile.js

const { getDbClient } = require('./utils/db');
const { verifyJwt } = require('./utils/auth');

/**
 * Netlify Function handler for updating a user's profile.
 * Only the authenticated user can update their own profile.
 * @param {object} event - The event object from Netlify.
 * @param {object} context - The context object.
 * @returns {object} A Netlify-compatible response.
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
        // Authenticate the request and get the user's ID from the JWT.
        const authResult = await verifyJwt(event.headers.authorization);
        if (!authResult || !authResult.userId) {
            return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
        }
        const userId = authResult.userId; // The ID of the authenticated user

        // Parse the request body, which contains the fields to update.
        const data = JSON.parse(event.body);
        // Destructure fields. Note: Using snake_case for `company_name` and `specialties`
        // to match the database column names if your frontend sends them in camelCase.
        const { name, email, phone, address, bio, companyName, specialties } = data;

        client = await getDbClient();

        // Construct dynamic SQL UPDATE statement based on provided fields.
        const updates = [];
        const values = [];
        let paramIndex = 1;

        if (name !== undefined) { updates.push(`name = $${paramIndex++}`); values.push(name); }
        if (email !== undefined) { updates.push(`email = $${paramIndex++}`); values.push(email); }
        if (phone !== undefined) { updates.push(`phone = $${paramIndex++}`); values.push(phone); }
        if (address !== undefined) { updates.push(`address = $${paramIndex++}`); values.push(address); }
        if (bio !== undefined) { updates.push(`bio = $${paramIndex++}`); values.push(bio); }
        // Ensure you map 'companyName' from frontend to 'company_name' in DB if different
        if (companyName !== undefined) { updates.push(`company_name = $${paramIndex++}`); values.push(companyName); }
        if (specialties !== undefined) { updates.push(`specialties = $${paramIndex++}`); values.push(specialties); }

        // Always update the `updated_at` timestamp.
        updates.push(`updated_at = CURRENT_TIMESTAMP`);

        // If only `updated_at` is being updated, it means no other data was provided for update.
        if (updates.length === 1 && updates[0].includes('updated_at')) {
            return { statusCode: 200, headers, body: JSON.stringify({ message: 'No profile changes provided.' }) };
        }

        // Add the user ID for the WHERE clause.
        values.push(userId);

        // Construct the final SQL query.
        const queryText = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
        const res = await client.query(queryText, values);

        // If no rows were updated, it means the user was not found or the ID was incorrect.
        if (res.rows.length === 0) {
            return { statusCode: 404, headers, body: JSON.stringify({ error: 'User not found or not authorized to update.' }) };
        }

        // Return the updated user profile.
        return { statusCode: 200, headers, body: JSON.stringify(res.rows[0]) };

    } catch (error) {
        console.error('Error updating user profile:', error.message, error.stack);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to update profile', details: error.message }),
        };
    }
};
