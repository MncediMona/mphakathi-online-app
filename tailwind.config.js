// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}', // All files in app directory
    './pages/**/*.{js,ts,jsx,tsx,mdx}', // For compatibility if you have a pages directory
    './components/**/*.{js,ts,jsx,tsx,mdx}', // All files in components directory
    './lib/**/*.{js,ts,jsx,tsx,mdx}', // For utility files, if they contain Tailwind classes
    './src/**/*.{js,ts,jsx,tsx,mdx}', // Your existing src for index.css if it contains classes
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
