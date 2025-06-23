import configJson from "./auth_config.json";

export function getConfig() {
  // Configure the audience here. By default, it will take whatever is in the config
  // (specified by the `audience` key) unless it's the default value of "{yourApiIdentifier}" (which
  // is what you get sometimes by using the Auth0 sample download tool from the quickstart page, if you
  // don't have an API).
  // If this resolves to `null`, the API page changes to show some helpful info about what to do
  // with the audience.
  const audience =
    configJson.audience && configJson.audience !== "{yourApiIdentifier}"
      ? configJson.audience
      : null;

  return {
    domain: configJson.domain,
    clientId: configJson.clientId,
    ...(audience ? { audience } : null),
  };
}
// Use environment variables instead of JSON file
const config = {
  domain: process.env.REACT_APP_AUTH0_DOMAIN || "dev-2yxylzdtf4dqt51i.us.auth0.com",
  clientId: process.env.REACT_APP_AUTH0_CLIENT_ID || "lOnIDcw4GQKk3dEEDec74F7buYO56rH8",
  audience: process.env.REACT_APP_AUTH0_API_AUDIENCE || "https://api.mphakathi-online.com"
};

export default config;
