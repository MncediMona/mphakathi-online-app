import configJson from "./auth_config.json";

export function getConfig() {
  const isDevelopment = window.location.hostname === 'localhost' || 
                       window.location.hostname.includes('repl.co');

  return {
    domain: configJson.domain,
    clientId: configJson.clientId,
    ...(configJson.audience ? { audience: configJson.audience } : null),
    apiOrigin: isDevelopment 
      ? `${window.location.origin}/.netlify/functions`
      : 'https://dashboard.mphakathi.online/.netlify/functions'
  };
}
// Use environment variables instead of JSON file
const config = {
  domain: process.env.REACT_APP_AUTH0_DOMAIN || "dev-2yxylzdtf4dqt51i.us.auth0.com",
  clientId: process.env.REACT_APP_AUTH0_CLIENT_ID || "lOnIDcw4GQKk3dEEDec74F7buYO56rH8",
  audience: process.env.REACT_APP_AUTH0_API_AUDIENCE || "https://api.mphakathi-online.com"
};

export default config;