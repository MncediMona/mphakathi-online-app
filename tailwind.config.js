/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Scan all JS, JSX, TS, TSX files in src folder
    "./public/index.html",         // Also scan index.html for classes
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Set Inter as default font
      },
      colors: {
        // Define your custom brand colors if needed, e.g., for #964b00
        brand: {
          DEFAULT: '#964b00', // Example: your primary brand color
          light: '#b3641a',   // Example: a lighter shade
          dark: '#7a3d00',    // Example: a darker shade
        },
      },
    },
  },
  plugins: [],
}