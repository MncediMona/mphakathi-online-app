// netlify/functions/get-branding.js
const { getDbClient } = require('./db-config');

exports.handler = async function(event, context) {
  let client;
  try {
    client = await getDbClient();

    // Assuming branding_config always has id = 1 as the single config row
    const result = await client.query('SELECT app_name, app_logo_url FROM branding_config WHERE id = 1');
    client.release();

    if (result.rows.length > 0) {
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        },
        body: JSON.stringify(result.rows[0])
      };
    } else {
      // If branding config doesn't exist, return defaults (and frontend will create it)
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        },
        body: JSON.stringify({ app_name: 'Mphakathi Online', app_logo_url: 'https://placehold.co/100x40/964b00/ffffff?text=Logo' })
      };
    }
  } catch (error) {
    console.error('Error fetching branding config:', error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: 'Failed to fetch branding config', details: error.message })
    };
  } finally {
    if (client) {
      client.release();
    }
  }
};