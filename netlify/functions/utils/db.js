// netlify/functions/utils/db.js

// Import the PostgreSQL client library
const { Client } = require('pg');

// Cache the database client connection to reuse it across function invocations.
let cachedClient = null;

/**
 * Establishes and returns a connected PostgreSQL database client.
 * Caches the client for reuse in subsequent invocations to optimize performance.
 * @returns {Promise<Client>} A connected PostgreSQL client instance.
 * @throws {Error} If the NEON_DB_URL environment variable is not set or if connection fails.
 */
async function getDbClient() {
    // Log intent to reuse client
    if (cachedClient && cachedClient.active) { // Use .active for a better check of a live connection
        console.log('DB_CLIENT_LOG: Reusing cached DB client.');
        return cachedClient;
    } else if (cachedClient && !cachedClient.active) {
        console.log('DB_CLIENT_LOG: Cached client found but not active. Attempting new connection.');
        cachedClient = null; // Clear invalid cached client
    } else {
        console.log('DB_CLIENT_LOG: No cached client found. Attempting new connection.');
    }


    // Ensure the database connection URL is available from environment variables.
    const neonDbUrl = process.env.NEON_DB_URL;
    if (!neonDbUrl) {
        console.error('DB_CLIENT_LOG: CRITICAL - NEON_DB_URL environment variable is NOT set. Please configure it.');
        throw new Error('Database connection string (NEON_DB_URL) is missing from environment variables.');
    }

    // Log a masked version of the connection string for debugging (AVOID LOGGING FULL CREDENTIALS IN PROD!)
    console.log('DB_CLIENT_LOG: Using NEON_DB_URL (masked):', neonDbUrl.substring(0, 20) + '...' + neonDbUrl.substring(neonDbUrl.length - 20));

    try {
        // Create a new PostgreSQL client instance using the connection string.
        const client = new Client({
            connectionString: neonDbUrl,
            ssl: {
                rejectUnauthorized: false, // Required for Neon in many environments
            },
        });

        // Attempt to connect to the database.
        console.log('DB_CLIENT_LOG: Attempting to connect...');
        await client.connect();
        console.log('DB_CLIENT_LOG: New DB client connected successfully!');
        
        // Add an error listener to the client for ongoing issues
        client.on('error', (err) => {
            console.error('DB_CLIENT_LOG: Client experienced an error after connection:', err.message, err.stack);
            cachedClient = null; // Invalidate cache on error
            client.end(); // Attempt to gracefully close this problematic client
        });

        cachedClient = client;
        return client;
    } catch (error) {
        console.error('DB_CLIENT_LOG: FAILED to connect to database:', error.message, error.stack);
        cachedClient = null; // Ensure cache is cleared on failure
        throw error; // Re-throw any connection errors to be handled by the calling function.
    }
}

// Export the function to be used by other Netlify Functions.
module.exports = { getDbClient };
