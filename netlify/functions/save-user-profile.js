// netlify/functions/save-user-profile.js
const { getDbClient } = require('./db-config');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') { // Or PUT, depending on exact use case
    return {
      statusCode: 405,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: "Method Not Allowed" })
    };
  }

  let client;
  try {
    const data = JSON.parse(event.body);
    const { uid, name, email, phone, bio, address, role, isProviderApproved, isPaidMember, companyName, specialties } = data;

    if (!uid || !name) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "UID and Name are required" })
      };
    }

    client = await getDbClient();

    // UPSERT (UPDATE or INSERT) logic
    const result = await client.query(
      `INSERT INTO users (uid, name, email, phone, bio, address, role, is_provider_approved, is_paid_member, company_name, specialties)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (uid) DO UPDATE SET
         name = EXCLUDED.name,
         email = EXCLUDED.email,
         phone = EXCLUDED.phone,
         bio = EXCLUDED.bio,
         address = EXCLUDED.address,
         role = EXCLUDED.role,
         is_provider_approved = EXCLUDED.is_provider_approved,
         is_paid_member = EXCLUDED.is_paid_member,
         company_name = EXCLUDED.company_name,
         specialties = EXCLUDED.specialties,
         updated_at = CURRENT_TIMESTAMP -- Add an updated_at column to your schema for this
       RETURNING *`,
      [uid, name, email, phone, bio, address, role, isProviderApproved, isPaidMember, companyName, specialties]
    );

    return {
      statusCode: 200, // 200 OK for upsert
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      },
      body: JSON.stringify(result.rows[0])
    };
  } catch (error) {
    console.error('Error saving user profile:', error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: 'Failed to save user profile', details: error.message })
    };
  } finally {
    if (client) {
      client.release();
    }
  }
};