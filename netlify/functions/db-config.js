// netlify/functions/db-config.js
const { Pool } = require('pg');

let cachedPool = null;

async function getDbClient() {
    // Log the environment variable value (masked for security)
    console.log('DB_CONFIG_LOG: NEON_DB_URL is set:', !!process.env.NEON_DB_URL);
    if (process.env.NEON_DB_URL) {
        console.log('DB_CONFIG_LOG: Using NEON_DB_URL (masked):', process.env.NEON_DB_URL.substring(0, 20) + '...masked...sslmode=require');
    } else {
        console.error('DB_CONFIG_LOG: CRITICAL ERROR: NEON_DB_URL environment variable is NOT SET!');
        throw new Error('Database connection string (NEON_DB_URL) is not set.');
    }

    if (cachedPool) {
        try {
            // Try to get a client from the pool to check if it's still alive
            const client = await cachedPool.connect();
            client.release(); // Release the test client immediately
            console.log('DB_CONFIG_LOG: Reusing cached DB pool.');
            return cachedPool.connect(); // Return a new client from the existing pool
        } catch (e) {
            console.error('DB_CONFIG_LOG: Cached DB pool connection failed, re-initializing:', e.message);
            cachedPool = null; // Invalidate cache if connection fails
        }
    }

    console.log('DB_CONFIG_LOG: Initializing new DB pool...');
    try {
        const pool = new Pool({
            connectionString: process.env.NEON_DB_URL,
            ssl: {
                rejectUnauthorized: false // Required for Neon free tier or self-signed certs
            },
            max: 1 // Keep pool small for serverless, adjust as needed
        });

        // Test connection immediately
        const client = await pool.connect();
        client.release(); // Release the test client
        console.log('DB_CONFIG_LOG: New DB pool connected successfully!');

        cachedPool = pool; // Cache the new pool
        return cachedPool.connect(); // Return a client from the new pool
    } catch (error) {
        console.error('DB_CONFIG_LOG: Failed to connect to database pool:', error.message, error.stack);
        throw new Error('Database connection failed: ' + error.message);
    }
}

module.exports = { getDbClient };
