// netlify/functions/delete-user.js

const { getDbClient } = require('./db-config');

/**
 * Netlify Function to delete a user profile.
 * This function should be strictly protected for admin access only.
 * @param {object} event - The event object from Netlify.
 * @returns {object} A Netlify-compatible response.
 */
exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'DELETE, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') { return { statusCode: 204, headers }; }
    if (event.httpMethod !== 'DELETE') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    // In a real application, you'd verify the user making this request is an admin
    // and prevent them from deleting their own account.
    const { userIdToDelete } = JSON.parse(event.body);

    if (!userIdToDelete) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'User ID to delete is required.' }),
        };
    }

    let client;
    try {
        client = await getDbClient();

        // Delete the user profile. This might need to also handle cascading deletes
        // for related data (problems, quotes, sessions) or set them to NULL.
        // For simplicity, we'll just delete the user_profile.
        // WARNING: Ensure CASCADE DELETE constraints are set up in your DB schema
        // on foreign keys related to user_profiles (e.g., problems, quotes, sessions)
        // or handle deletion of related records explicitly here.
        const res = await client.query('DELETE FROM user_profiles WHERE id = $1 RETURNING id', [userIdToDelete]);

        if (res.rows.length === 0) {
            return { statusCode: 404, headers, body: JSON.stringify({ error: 'User not found.' }) };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: `User ${userIdToDelete} deleted successfully.` }),
        };
    } catch (error) {
        console.error('Error deleting user:', error.message, error.stack);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to delete user', details: error.message }),
        };
    } finally {
        if (client) {
            client.release();
        }
    }
};
