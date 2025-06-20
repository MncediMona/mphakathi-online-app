// netlify/functions/delete-problem.js
const { getDbClient } = require('./db-config');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'DELETE') {
    return {
      statusCode: 405,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: "Method Not Allowed" })
    };
  }

  let client;
  try {
    const { id } = JSON.parse(event.body); // Expecting ID in body for DELETE

    if (!id) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "Problem ID is required." })
      };
    }

    client = await getDbClient();

    // Delete the problem. Note: Deleting a problem with associated quotes might
    // require configuring ON DELETE CASCADE in your foreign key constraint in Postgres,
    // or manually deleting quotes first if you want to avoid CASCADE.
    // For this demo, if quotes are embedded JSON in problems table, they are gone with the problem.
    // If quotes are in a separate table, you'd need to delete them first or use CASCADE.
    const result = await client.query('DELETE FROM problems WHERE id = $1 RETURNING id', [id]);

    if (result.rowCount === 0) {
      return {
        statusCode: 404,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "Problem not found." })
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      },
      body: JSON.stringify({ message: `Problem with ID ${id} deleted successfully.` })
    };
  } catch (error) {
    console.error('Error deleting problem:', error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: 'Failed to delete problem', details: error.message })
    };
  } finally {
    if (client) {
      client.release();
    }
  }
};