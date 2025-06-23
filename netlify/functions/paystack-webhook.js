// netlify/functions/paystack-webhook.js

const { getDbClient } = require('./utils/db');
const crypto = require('crypto'); // Node.js built-in module for cryptographic functions
require('dotenv').config(); // For local development: loads environment variables from .env file

/**
 * Netlify Function handler for receiving and processing Paystack webhook events.
 * This function is critical for automatically updating user membership status
 * based on payment success notifications from Paystack.
 * It verifies the authenticity of the webhook before processing.
 * @param {object} event - The event object from Netlify, containing the webhook payload.
 * @param {object} context - The context object.
 * @returns {object} A Netlify-compatible response, typically 200 OK to acknowledge receipt.
 */
exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*', // Adjust in production to restrict access
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    // Handle OPTIONS preflight requests: browsers send these before complex cross-origin requests.
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers }; // Return 204 No Content with CORS headers
    }

    // Only allow POST requests, as webhooks are typically POST.
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405, // Method Not Allowed
            headers,
            body: JSON.stringify({ error: 'Method Not Allowed' }),
        };
    }

    // Retrieve the Paystack Webhook Secret from environment variables.
    // This secret is used to verify the authenticity of the incoming webhook.
    const secret = process.env.PAYSTACK_WEBHOOK_SECRET;
    if (!secret) {
        console.error('PAYSTACK_WEBHOOK_SECRET environment variable is not set. Webhook verification skipped.');
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server configuration error: Webhook secret missing.' }) };
    }

    // 1. Verify the webhook signature.
    // Paystack sends an 'x-paystack-signature' header. We must compute our own hash
    // using the raw request body and our secret, then compare it.
    const hash = crypto.createHmac('sha512', secret)
                       .update(event.body) // Use the raw, unparsed request body
                       .digest('hex');

    if (hash !== event.headers['x-paystack-signature']) {
        console.warn('Webhook signature mismatch. Possible tampering attempt or misconfiguration.');
        return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized: Invalid webhook signature.' }) };
    }

    let payload;
    try {
        // 2. Parse the webhook payload once the signature is verified.
        payload = JSON.parse(event.body);
    } catch (e) {
        console.error('Error parsing Paystack webhook payload:', e.message, e.stack);
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Bad Request: Invalid JSON payload.' }) };
    }

    let client; // Declare database client variable
    try {
        client = await getDbClient(); // Get a database client instance

        // 3. Process different Paystack event types.
        // The 'charge.success' event is sent when a payment is successfully completed.
        if (payload.event === 'charge.success') {
            const customerEmail = payload.data.customer.email; // Customer's email from Paystack
            const status = payload.data.status; // Payment status (e.g., 'success')
            const amount = payload.data.amount / 100; // Amount in kobo/cent, convert to main currency (e.g., ZAR)
            const reference = payload.data.reference; // Unique transaction reference

            console.log(`Paystack Charge Success Webhook Received: Email: ${customerEmail}, Amount: ${amount}, Ref: ${reference}, Status: ${status}`);

            // Update the user's `is_paid_member` status in your 'users' table.
            // This is crucial for granting access to paid features.
            const userUpdateRes = await client.query(
                `UPDATE users SET is_paid_member = TRUE, updated_at = CURRENT_TIMESTAMP
                 WHERE email = $1 RETURNING id, email`, // Return ID and email to confirm update
                [customerEmail]
            );

            if (userUpdateRes.rows.length > 0) {
                console.log(`User ${userUpdateRes.rows[0].id} (email: ${userUpdateRes.rows[0].email}) successfully marked as paid member.`);
            } else {
                console.warn(`No user found with email ${customerEmail} to update after successful charge. Consider logging or manual intervention.`);
                // You might want to implement logic here to create a user if they somehow paid
                // but weren't in your DB, or trigger an alert for manual review.
            }

            // Acknowledge the webhook with a 200 OK status.
            // Paystack expects a 200 OK response within 20 seconds to consider the webhook delivered.
            return {
                statusCode: 200,
                headers: headers,
                body: JSON.stringify({ message: 'Paystack webhook processed successfully: Charge success.' }),
            };
        } else if (payload.event === 'subscription.create') {
            // Handle new subscription creation events.
            // You might want to link the subscription ID to the user in your database.
            console.log('Paystack Subscription Created Webhook Received:', payload.data);
            // Example: Update `users` table with a `paystack_subscription_id` column
            // await client.query(
            //     `UPDATE users SET paystack_subscription_id = $1, updated_at = CURRENT_TIMESTAMP WHERE email = $2`,
            //     [payload.data.subscription_code, payload.data.customer.email]
            // );
            return {
                statusCode: 200,
                headers: headers,
                body: JSON.stringify({ message: 'Paystack webhook processed successfully: Subscription created.' }),
            };
        } else if (payload.event === 'subscription.disable') {
            // Handle subscription cancellation/disablement.
            // You should revoke paid access for the user here.
            console.log('Paystack Subscription Disabled Webhook Received:', payload.data);
            // Example: Update `users` table to set `is_paid_member = FALSE`
            // await client.query(
            //     `UPDATE users SET is_paid_member = FALSE, updated_at = CURRENT_TIMESTAMP WHERE email = $1`,
            //     [payload.data.customer.email]
            // );
            return {
                statusCode: 200,
                headers: headers,
                body: JSON.stringify({ message: 'Paystack webhook processed successfully: Subscription disabled.' }),
            };
        }
        // For any other unhandled Paystack events, still return 200 OK
        // to prevent Paystack from retrying the webhook unnecessarily.
        console.log(`Unhandled Paystack event received: ${payload.event}`);
        return {
            statusCode: 200,
            headers: headers,
            body: JSON.stringify({ message: `Webhook received, event '${payload.event}' not explicitly handled.` }),
        };

    } catch (error) {
        console.error('Error processing Paystack webhook:', error.message, error.stack);
        // Return a 500 status code if an unhandled error occurs during processing.
        // Paystack might retry if it doesn't get a 200 OK.
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to process Paystack webhook', details: error.message }),
        };
    }
};
