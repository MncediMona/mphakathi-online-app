// netlify/functions/post-problem.js

const { getDbClient } = require('./db-config');

/**
 * Netlify Function to post a new problem.
 * Requires user authentication. The user ID from Auth.js session will be passed from frontend.
 * @param {object} event - The event object from Netlify.
 * @returns {object} A Netlify-compatible response with the newly created problem.
 */
exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') { return { statusCode: 204, headers }; }
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    const { title, description, category, location, estimated_budget, userId } = JSON.parse(event.body);

    if (!title || !description || !category || !location || estimated_budget === undefined || !userId) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Missing required problem fields or user ID.' }),
        };
    }

    let client;
    try {
        client = await getDbClient();

        // Insert new problem. is_approved defaults to false, requiring admin approval.
        const res = await client.query(
            `INSERT INTO problems (title, description, category, location, estimated_budget, user_id, status, is_approved)
             VALUES ($1, $2, $3, $4, $5, $6, 'open', FALSE) RETURNING *`,
            [title, description, category, location, estimated_budget, userId]
        );

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(res.rows[0]), // Return the newly created problem
        };
    } catch (error) {
        console.error('Error posting problem:', error.message, error.stack);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to post problem', details: error.message }),
        };
    } finally {
        if (client) {
            client.release();
        }
    }
};
