// netlify/functions/auth/[...authjs].js - TEMPORARY TEST FUNCTION
// This is a simple test to see if Netlify Function deployment works at this path.

exports.handler = async (event, context) => {
  console.log('TEST_FUNCTION_DEBUG: Auth.js placeholder function hit!');
  console.log('TEST_FUNCTION_DEBUG: Event Path:', event.path);
  console.log('TEST_FUNCTION_DEBUG: HTTP Method:', event.httpMethod);

  try {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Crucial for CORS
        'Access-Control-Allow-Credentials': 'true',
      },
      body: JSON.stringify({
        message: 'Auth.js Placeholder Function is Working!',
        path: event.path,
        method: event.httpMethod,
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    console.error('TEST_FUNCTION_ERROR: Error in placeholder function:', error.message, error.stack);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Internal Server Error in test function', details: error.message }),
    };
  }
};
