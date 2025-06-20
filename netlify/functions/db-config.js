// netlify/functions/db-config.js
const { Pool } = require('pg');

// Netlify DB connection string from environment variables
// IMPORTANT: This 'DATABASE_URL' MUST be set in Netlify UI
// Site settings -> Build & deploy -> Environment variables
const connectionString = process.env.DATABASE_URL;

// Create a new Pool instance. This pool will be shared across function invocations
// for efficiency and connection management.
const pool = new Pool({
  connectionString,
  // The `ssl` option is often needed for external Postgres services like Neon (Netlify DB)
  // to ensure a secure connection. `rejectUnauthorized: false` can be used for development
  // or if you're not using trusted certificates, but in production, you should use
  // proper certificate validation if possible.
  ssl: {
    rejectUnauthorized: false
  }
});

// Event listener for database connection errors to log them
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1); // Exit process or handle more gracefully
});

// Export a function to get a client from the pool
const getDbClient = async () => {
  try {
    const client = await pool.connect();
    return client;
  } catch (err) {
    console.error('Error acquiring client from DB pool:', err);
    throw err; // Re-throw to be caught by the calling function
  }
};

module.exports = { getDbClient };