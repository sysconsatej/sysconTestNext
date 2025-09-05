/** @type {import('tailwindcss').Config}  */
const withMT = require("@material-tailwind/react/utils/withMT");

module.exports = withMT({
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      boxShadow: {
        custom: 'inset 0px 1px 2px #00000029, 0px 3px 6px #00000029',
      },
      colors: {
        loginBg: "#f6f7fa",   // Login background color
        txtColor: {           // custom color for text field
          500: '#0054EB',
        },
        sideBarColor: {       // custom color for sidebar
          500: '#0766AD',
        },
        blueColor: "#0766AD",
        bgColor: "#F9F9F9"
      },
      fontFamily: {
        sans: ["Roboto", "Helvetica", "Arial", "sans-serif"],
      },

      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      filter: {
        'custom-blue': 'invert(45%) sepia(82%) saturate(2305%) hue-rotate(163deg) brightness(96%) contrast(101%)',
      },
    },
  },
  darkMode: 'class',
  variants: {
    extend: {
      filter: ['responsive', 'hover'], // Enable hover variant for filter
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        '.filter-custom-blue': {
          filter: 'invert(45%) sepia(82%) saturate(2305%) hue-rotate(163deg) brightness(96%) contrast(101%)',
        },
        '.hover\\:text-custom-blue': {
          color: '#0766AD',
        },
      };
      addUtilities(newUtilities, ['responsive', 'hover']);
    },
  ],
});
