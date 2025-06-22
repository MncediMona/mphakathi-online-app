// netlify/functions/get-problems.js

const { getDbClient } = require('./utils/db');

/**
 * Netlify Function handler for fetching all approved problems.
 * This endpoint is public and does not require authentication.
 * @param {object} event - The event object from Netlify.
 * @param {object} context - The context object.
 * @returns {object} A Netlify-compatible response containing a list of approved problems.
 */
exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*', // Allows requests from any origin (e.g., your frontend)
        'Access-Control-Allow-Headers': 'Content-Type, Authorization', // Specifies which headers are allowed
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS' // Specifies allowed HTTP methods
    };

    // Handle OPTIONS preflight request (crucial for CORS)
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 204, // No Content: browser just wants header info
            headers: headers,
            body: ''
        };
    }

    let client; // Declare client variable for database connection
    try {
        // Get a database client instance (reusing cached client if available)
        client = await getDbClient();

        // Fetch only problems that have been marked as 'is_approved = TRUE'.
        // This ensures only vetted problems are displayed publicly.
        // Order by creation date, latest first.
        const res = await client.query('SELECT * FROM problems WHERE is_approved = TRUE ORDER BY created_at DESC');

        // Return the fetched problems with a 200 OK status.
        return {
            statusCode: 200,
            headers: headers,
            body: JSON.stringify(res.rows), // Convert the array of problem objects to a JSON string
        };
    } catch (error) {
        // Log the error and return a 500 Internal Server Error for any database or unexpected issues.
        console.error('Error fetching problems:', error.message, error.stack);
        return {
            statusCode: 500,
            headers: headers,
            body: JSON.stringify({ error: 'Failed to fetch problems', details: error.message }),
        };
    } finally {
        // In serverless environments, avoid explicitly closing the client connection here
        // if using connection pooling or a cached client. Let the platform manage it.
    }
};
