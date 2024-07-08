/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/**/*.pug"],
  theme: {
    extend: {
      colors: {
        bg: "#111110",
        accent: "#8a4ccd",
        "accent-faded": "#7d38c7",
        edit: "#4E4A4E",
        "edit-faded": "#7B7F89",
        delete: "#A10000",
        "delete-faded": "#5c0101",
      },
    },
  },
  plugins: [],
};
