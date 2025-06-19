// netlify/functions/get-user-profiles.js
const { getDbClient } = require('./db-config');

exports.handler = async function(event, context) {
  let client;
  try {
    client = await getDbClient();

    // Select all user profiles. We'll send them as an object keyed by UID.
    const result = await client.query('SELECT uid, name, email, phone, bio, address, role, is_provider_approved, is_paid_member, company_name, specialties, deleted, created_at FROM users WHERE deleted = FALSE');
    client.release();

    const userProfilesMap = {};
    result.rows.forEach(user => {
      userProfilesMap[user.uid] = user;
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      },
      body: JSON.stringify(userProfilesMap)
    };
  } catch (error) {
    console.error('Error fetching user profiles:', error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: 'Failed to fetch user profiles', details: error.message })
    };
  } finally {
    if (client) {
      client.release();
    }
  }
};