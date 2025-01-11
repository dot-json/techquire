/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      container: {
        center: true,
        padding: "1rem",
        screens: {
          sm: "100%",
          md: "100%",
          lg: "1024px",
          xl: "1280px",
        },
      },
      colors: {
        text: {
          50: "#f4f0f1",
          100: "#e9e2e3",
          200: "#d4c4c7",
          300: "#bea7ab",
          400: "#a88a8f",
          500: "#936c73",
          600: "#75575c",
          700: "#584145",
          800: "#3b2b2e",
          900: "#1d1617",
          950: "#0f0b0b",
        },
        background: {
          50: "#f2f2f3",
          100: "#e4e4e7",
          200: "#cacace",
          300: "#afafb6",
          400: "#95959d",
          500: "#7a7a85",
          600: "#62626a",
          700: "#494950",
          800: "#313135",
          900: "#18181b",
          950: "#0c0c0d",
        },
        primary: {
          50: "#fde8ed",
          100: "#fbd0da",
          200: "#f6a2b5",
          300: "#f27391",
          400: "#ee446c",
          500: "#e91647",
          600: "#bb1139",
          700: "#8c0d2b",
          800: "#5d091c",
          900: "#2f040e",
          950: "#170207",
        },
        success: "#12c97a",
        error: "#f71638",
        info: "#169df7",
        warning: "#f7d216",
      },

      fontFamily: {
        sans: ["Figtree", "sans-serif"],
        logo: ["Outfit", "sans-serif"],
      },
    },
  },
  plugins: [],
};
