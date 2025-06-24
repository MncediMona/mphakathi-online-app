// netlify/functions/update-user-profile.js

const { getDbClient } = require('./db-config');

/**
 * Netlify Function to update a user's profile.
 * Requires authentication (session data will be available from Auth.js).
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

    // In a production setup with NextAuth.js, you'd typically retrieve the user
    // from the session object available in the context or headers (via JWT/session token).
    // For simplicity, we'll rely on the frontend sending the user's DB ID from its session.
    // Ensure your frontend sends `userProfile.id` in the body for update.
    const { id, name, email, phone, bio, address, company_name, specialties, role, is_provider_approved } = JSON.parse(event.body);

    if (!id) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'User ID is required.' }) };
    }

    let client;
    try {
        client = await getDbClient();

        // Start building the query dynamically for fields that are provided
        const updates = [];
        const values = [id]; // First value is the user ID for WHERE clause
        let paramIndex = 2; // Start parameter index from 2

        if (name !== undefined) { updates.push(`name = $${paramIndex++}`); values.push(name); }
        if (email !== undefined) { updates.push(`email = $${paramIndex++}`); values.push(email); }
        if (phone !== undefined) { updates.push(`phone = $${paramIndex++}`); values.push(phone); }
        if (bio !== undefined) { updates.push(`bio = $${paramIndex++}`); values.push(bio); }
        if (address !== undefined) { updates.push(`address = $${paramIndex++}`); values.push(address); }
        if (company_name !== undefined) { updates.push(`company_name = $${paramIndex++}`); values.push(company_name); }
        if (specialties !== undefined) { updates.push(`specialties = $${paramIndex++}`); values.push(specialties); }

        // Role and is_provider_approved should generally only be updated by admin,
        // but included here for completeness based on previous App.js,
        // assuming appropriate permission checks in a real app.
        // For now, allow frontend to send it.
        if (role !== undefined) { updates.push(`role = $${paramIndex++}`); values.push(role); }
        if (is_provider_approved !== undefined) { updates.push(`is_provider_approved = $${paramIndex++}`); values.push(is_provider_approved); }


        if (updates.length === 0) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'No fields to update.' }) };
        }

        const query = `UPDATE user_profiles SET ${updates.join(', ')} WHERE id = $1 RETURNING *`;

        const res = await client.query(query, values);

        if (res.rows.length === 0) {
            return { statusCode: 404, headers, body: JSON.stringify({ error: 'User profile not found.' }) };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(res.rows[0]), // Return the updated profile
        };
    } catch (error) {
        console.error('Error updating user profile:', error.message, error.stack);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to update user profile', details: error.message }),
        };
    } finally {
        if (client) {
            client.release();
        }
    }
};
