// netlify/functions/update-problem.js
const { getDbClient } = require('./db-config');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'PUT') {
    return {
      statusCode: 405,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: "Method Not Allowed" })
    };
  }

  let client;
  try {
    const { id, updates } = JSON.parse(event.body);

    if (!id || !updates || Object.keys(updates).length === 0) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "Problem ID and updates are required." })
      };
    }

    client = await getDbClient();

    // Dynamically build the SET clause for the UPDATE query
    const setClauses = [];
    const values = [];
    let paramIndex = 1;

    for (const key in updates) {
      if (updates.hasOwnProperty(key)) {
        // Special handling for 'quotes' array: stringify it
        if (key === 'quotes') {
          setClauses.push(`${key} = $${paramIndex++}::jsonb`); // Cast to jsonb
          values.push(JSON.stringify(updates[key]));
        } else if (key === 'createdAt' || key === 'updatedAt') {
            // Skip timestamp updates unless explicitly handled and correctly formatted
            continue;
        } else {
            setClauses.push(`${key} = $${paramIndex++}`);
            values.push(updates[key]);
        }
      }
    }

    if (setClauses.length === 0) {
        return {
            statusCode: 400,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: "No valid fields provided for update." })
        };
    }

    values.push(id); // Add ID for the WHERE clause as the last parameter
    const queryText = `UPDATE problems SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

    const result = await client.query(queryText, values);

    if (result.rowCount === 0) {
      return {
        statusCode: 404,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "Problem not found." })
      };
    }

    // Parse quotes back to object if present in the returned row
    const updatedProblem = result.rows[0];
    if (updatedProblem.quotes && typeof updatedProblem.quotes === 'string') {
        updatedProblem.quotes = JSON.parse(updatedProblem.quotes);
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      },
      body: JSON.stringify(updatedProblem)
    };
  } catch (error) {
    console.error('Error updating problem:', error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: 'Failed to update problem', details: error.message })
    };
  } finally {
    if (client) {
      client.release();
    }
  }
};