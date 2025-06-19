// netlify/functions/get-pricing-plans.js
const { getDbClient } = require('./db-config');

exports.handler = async function(event, context) {
  let client;
  try {
    client = await getDbClient();

    const result = await client.query('SELECT id, name, price, raw_price, interval, plan_code, features FROM pricing_plans ORDER BY raw_price ASC');
    client.release();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      },
      body: JSON.stringify(result.rows)
    };
  } catch (error) {
    console.error('Error fetching pricing plans:', error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: 'Failed to fetch pricing plans', details: error.message })
    };
  } finally {
    if (client) {
      client.release();
    }
  }
};