/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/*.pug"],
  theme: {
    extend: {
      colors: {
        accent: "#fc6a0e",
        "light-purple": "#a474d8",
        cornflower: "#6495ED",
        "light-cornflower": "#d1dffa",
        "dark-gray": "#111922",
        pone: "#211322",
        ptwo: "#751c4d",
        faded: "#9e6082",
        pthree: "#8e677b",
        orange: "#fc6a0e",
        "orange-faded": "#FDA56E",
      },
    },
  },
  plugins: [],
};
