
const { getDbClient } = require('./utils/db');

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 204,
            headers: headers,
            body: ''
        };
    }

    let client;
    try {
        client = await getDbClient();
        
        // Test basic query
        const result = await client.query('SELECT NOW() as current_time, version() as db_version');
        
        return {
            statusCode: 200,
            headers: headers,
            body: JSON.stringify({
                success: true,
                message: 'Database connection successful',
                data: result.rows[0],
                timestamp: new Date().toISOString()
            })
        };
    } catch (error) {
        console.error('Database test error:', error);
        return {
            statusCode: 500,
            headers: headers,
            body: JSON.stringify({
                success: false,
                error: 'Database connection failed',
                details: error.message
            })
        };
    }
};
