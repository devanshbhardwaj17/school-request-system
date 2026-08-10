/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F6F3EC",
        ink: "#20241F",
        chalk: {
          50: "#EAF2ED",
          100: "#CFE3D6",
          400: "#3F7C5A",
          600: "#1B4332",
          700: "#123024",
          900: "#0B1F17",
        },
        amber: {
          50: "#FBF1E3",
          400: "#C9820F",
          600: "#9A5F09",
        },
        rose: {
          50: "#F7E9E7",
          400: "#B4402E",
          600: "#8C2E20",
        },
        sky: {
          50: "#E9EEF6",
          400: "#2C5D8F",
          600: "#1F4468",
        },
        line: "#DAD4C4",
      },
      fontFamily: {
        display: ["'Source Serif 4'", "Georgia", "serif"],
        body: ["'Inter'", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(32,36,31,0.06), 0 1px 0 rgba(32,36,31,0.04)",
        stamp: "0 0 0 1px currentColor inset",
      },
    },
  },
  plugins: [],
};
