// src/config.js

// Define API Base URL dynamically based on environment
const API_BASE_URL = process.env.NODE_ENV === 'development'
    ? 'http://localhost:8888' // For `netlify dev` in Replit or local machine
    : ''; // For Netlify deployment, use relative path

const config = {
    apiBaseUrl: API_BASE_URL,
};

export default config;