// netlify/functions/post-problem.js

const { getDbClient } = require('./utils/db');
const { verifyJwt } = require('./utils/auth'); // For authentication

/**
 * Netlify Function handler for posting a new problem.
 * This endpoint requires authentication. The problem is initially set as unapproved.
 * @param {object} event - The event object from Netlify.
 * @param {object} context - The context object (used to get a unique AWS Lambda request ID for problem ID).
 * @returns {object} A Netlify-compatible response with the created problem data.
 */
exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') { return { statusCode: 204, headers }; }
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    let client;
    try {
        // Authenticate the request and get the user's ID from the JWT.
        const authResult = await verifyJwt(event.headers.authorization);
        if (!authResult || !authResult.userId) {
            return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
        }
        const requesterId = authResult.userId; // The ID of the authenticated user who is posting the problem

        // Parse the request body, which contains the problem details.
        const data = JSON.parse(event.body);
        const { title, description, category, location, estimatedBudget } = data;

        // Basic validation for required fields.
        if (!title || !description) { // requesterId comes from JWT, so not directly checked here
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing required fields: title and description are mandatory.' }),
            };
        }

        // Generate a unique ID for the new problem.
        // Using context.awsRequestId provides a unique identifier for each Lambda invocation.
        const problemId = context.awsRequestId;

        client = await getDbClient();

        // Insert the new problem into the 'problems' table.
        // `is_approved` is set to FALSE by default, requiring admin approval.
        const res = await client.query(
            `INSERT INTO problems (id, title, description, category, location, estimated_budget, requester_id, is_approved, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *`,
            [problemId, title, description, category, location, estimatedBudget, requesterId, false]
        );

        // Return the newly created problem data.
        return {
            statusCode: 201, // 201 Created
            headers,
            body: JSON.stringify(res.rows[0]),
        };

    } catch (error) {
        console.error('Error posting problem:', error.message, error.stack);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to post problem', details: error.message }),
        };
    }
};
