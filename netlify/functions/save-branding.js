// netlify/functions/save-branding.js
const { getDbClient } = require('./db-config');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: "Method Not Allowed" })
    };
  }

  let client;
  try {
    const { appName, appLogo } = JSON.parse(event.body);

    if (!appName) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "App name is required." })
      };
    }

    client = await getDbClient();

    // UPSERT the branding config (always operates on ID 1)
    const result = await client.query(
      `INSERT INTO branding_config (id, app_name, app_logo_url)
       VALUES (1, $1, $2)
       ON CONFLICT (id) DO UPDATE SET
         app_name = EXCLUDED.app_name,
         app_logo_url = EXCLUDED.app_logo_url,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [appName, appLogo]
    );

    return {
      statusCode: 200, // 200 OK for upsert
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      },
      body: JSON.stringify(result.rows[0])
    };
  } catch (error) {
    console.error('Error saving branding config:', error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: 'Failed to save branding config', details: error.message })
    };
  } finally {
    if (client) {
      client.release();
    }
  }
};