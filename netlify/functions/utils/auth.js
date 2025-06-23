// netlify/functions/utils/auth.js

// Import necessary libraries for JWT verification
const jwt = require('jsonwebtoken'); // For verifying JWTs
const jwksClient = require('jwks-rsa'); // For fetching JSON Web Key Sets (JWKS) from Auth0
require('dotenv').config(); // For loading environment variables locally (e.g., AUTH0_DOMAIN, AUTH0_API_AUDIENCE)

// Initialize the JWKS client. This client fetches Auth0's public keys
// which are used to verify the signature of JWTs issued by Auth0.
// The jwksUri is constructed using your Auth0 domain.
const client = jwksClient({
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
});

/**
 * Callback function used by jsonwebtoken to get the signing key.
 * @param {object} header - The JWT header, containing the 'kid' (key ID).
 * @param {function} callback - Callback to return the key or an error.
 */
function getKey(header, callback) {
    // Fetch the signing key from Auth0's JWKS endpoint based on the key ID in the JWT header.
    client.getSigningKey(header.kid, function(err, key) {
        if (err) {
            console.error('Error fetching signing key from JWKS:', err.message);
            return callback(err);
        }
        // Extract the public key (either publicKey or rsaPublicKey property).
        const signingKey = key.publicKey || key.rsaPublicKey;
        callback(null, signingKey);
    });
}

/**
 * Verifies an Auth0 JWT token from an Authorization header.
 * This function is designed to be used in Netlify Functions to protect routes.
 * @param {string} authHeader - The full Authorization header string (e.g., "Bearer YOUR_ACCESS_TOKEN").
 * @returns {Promise<{userId: string, email?: string, role?: string}|null>} A promise that resolves to an object
 * containing the decoded user information (at least `userId`), or `null` if the token is invalid or missing.
 */
const verifyJwt = (authHeader) => {
    return new Promise((resolve, reject) => {
        // 1. Check if the Authorization header is provided and correctly formatted.
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.warn('No or invalid Authorization header provided. Token verification skipped.');
            return resolve(null); // Resolve with null indicating no valid token was found.
        }

        // Extract the token part from the "Bearer " prefix.
        const token = authHeader.split(' ')[1];

        // 2. Verify the JWT using the fetched public key and configured options.
        jwt.verify(token, getKey, {
            // `audience` must match the Identifier you configured for your API in Auth0.
            audience: process.env.AUTH0_API_AUDIENCE,
            // `issuer` must match your Auth0 tenant domain.
            issuer: `https://${process.env.AUTH0_DOMAIN}/`,
            // Specify the algorithm used for signing (Auth0 typically uses RS256).
            algorithms: ['RS256']
        }, (err, decoded) => {
            // 3. Handle verification results.
            if (err) {
                console.error('JWT verification failed:', err.message);
                // For a failed verification, resolve with null. The calling function will handle 401 Unauthorized.
                return resolve(null);
            }

            // 4. If verification is successful, extract and return relevant user information.
            // The `decoded` payload contains claims from Auth0.
            // `decoded.sub` is the Auth0 user ID (e.g., 'auth0|1234567890').
            // `decoded.email` contains the user's email.
            // If you configured custom roles/permissions in Auth0, they might be in a custom claim
            // like `decoded['https://your-api-audience/roles']`. You would uncomment and adjust that line.
            resolve({
                userId: decoded.sub,
                email: decoded.email,
                // Example: role: decoded['https://api.mphakathi-online.com/roles'] ? decoded['https://api.mphakathi-online.com/roles'][0] : 'member',
            });
        });
    });
};

// Export the verification utility function.
module.exports = { verifyJwt };
