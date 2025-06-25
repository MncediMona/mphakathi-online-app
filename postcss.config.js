// postcss.config.js (explicitly using @tailwindcss/postcss)
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {}, // Explicitly reference the plugin
    autoprefixer: {},
  },
};
