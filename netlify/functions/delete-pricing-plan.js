// netlify/functions/delete-pricing-plan.js
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
    const { id } = JSON.parse(event.body);

    if (!id) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "Plan ID is required." })
      };
    }

    client = await getDbClient();

    const result = await client.query('DELETE FROM pricing_plans WHERE id = $1 RETURNING id', [id]);

    if (result.rowCount === 0) {
      return {
        statusCode: 404,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "Pricing plan not found." })
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
      body: JSON.stringify({ message: `Pricing plan with ID ${id} deleted successfully.` })
    };
  } catch (error) {
    console.error('Error deleting pricing plan:', error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: 'Failed to delete pricing plan', details: error.message })
    };
  } finally {
    if (client) {
      client.release();
    }
  }
};