// netlify/functions/submit-quote.js

const { getDbClient } = require('./utils/db');
const { verifyJwt } = require('./utils/auth');

/**
 * Netlify Function handler for submitting a new quote for a problem.
 * This endpoint requires authentication and verifies that the authenticated user
 * is an 'approved provider'.
 * @param {object} event - The event object from Netlify.
 * @param {object} context - The context object (used to get a unique AWS Lambda request ID for quote ID).
 * @returns {object} A Netlify-compatible response with the created quote data.
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
        // 1. Authenticate the request and get the user's ID from the JWT.
        const authResult = await verifyJwt(event.headers.authorization);
        if (!authResult || !authResult.userId) {
            return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
        }
        const providerId = authResult.userId; // The ID of the authenticated user submitting the quote

        client = await getDbClient();

        // 2. Verify if the authenticated user is an 'approved provider'.
        // The 'is_provider_approved' field in the 'users' table indicates this.
        const providerRes = await client.query(
            'SELECT is_provider_approved, name FROM users WHERE id = $1',
            [providerId]
        );
        if (providerRes.rows.length === 0 || !providerRes.rows[0].is_provider_approved) {
            return { statusCode: 403, headers, body: JSON.stringify({ error: 'Forbidden: Only approved providers can submit quotes.' }) };
        }
        const providerName = providerRes.rows[0].name; // Get provider's name for convenience

        // 3. Parse the request body for quote details.
        const data = JSON.parse(event.body);
        const { problemId, amount, details, proposedStartDate, proposedEndDate } = data;

        // 4. Basic validation for required quote fields.
        if (!problemId || !amount || !details || !proposedStartDate || !proposedEndDate) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing required quote fields (problemId, amount, details, proposedStartDate, proposedEndDate).' }) };
        }

        // 5. Generate a unique ID for the new quote.
        const quoteId = context.awsRequestId;

        // 6. Insert the new quote into the 'quotes' table.
        // The default status is 'pending'.
        const res = await client.query(
            `INSERT INTO quotes (id, problem_id, provider_id, amount, details, proposed_start_date, proposed_end_date, status, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *`,
            [quoteId, problemId, providerId, amount, details, proposedStartDate, proposedEndDate]
        );

        // 7. Enhance the returned quote object with the provider's name for frontend display.
        const newQuote = { ...res.rows[0], providerName: providerName };

        // Return the newly created quote data.
        return { statusCode: 201, headers, body: JSON.stringify(newQuote) };

    } catch (error) {
        console.error('Error submitting quote:', error.message, error.stack);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to submit quote', details: error.message }),
        };
    }
};
