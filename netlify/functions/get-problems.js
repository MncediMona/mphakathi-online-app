// netlify/functions/get-problems.js
const { getDbClient } = require('./db-config'); // Import our centralized DB config

exports.handler = async function(event, context) {
  let client; // Declare client outside try block for finally access
  try {
    client = await getDbClient(); // Get a client from the pool

    // SQL query to select all approved problems, ordered by creation date
    const result = await client.query(
      'SELECT id, title, description, category, location, estimated_budget, requester_id, status, is_approved, accepted_quote_id, created_at, quotes FROM problems WHERE is_approved = TRUE ORDER BY created_at DESC'
    );

    // Fetch quotes for each problem. This is simplified; a JOIN would be more efficient in production.
    // For now, we'll fetch them separately and attach.
    // In a real app, you'd likely normalize quotes into a JSONB column on problems, or use a complex JOIN.
    // For this demo, let's include the 'quotes' column from the problems table if it exists as TEXT or JSONB
    // For simplicity, problems.quotes could be stored as JSON string or array in Postgres.
    // If 'quotes' is not a direct column on 'problems', you'd fetch them from the 'quotes' table separately.
    // Assuming problems.quotes is a TEXT column storing JSON string of quotes:
    const problemsWithParsedQuotes = result.rows.map(problem => ({
      ...problem,
      quotes: problem.quotes ? JSON.parse(problem.quotes) : [] // Parse quotes JSON string
    }));


    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // Allow CORS for local development
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization" // Include Authorization if using it
      },
      body: JSON.stringify(problemsWithParsedQuotes)
    };
  } catch (error) {
    console.error('Error fetching problems:', error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: 'Failed to fetch problems', details: error.message })
    };
  } finally {
    if (client) {
      client.release(); // Always release the client back to the pool
    }
  }
};