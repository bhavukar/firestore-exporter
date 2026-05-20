/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../apps/desktop/src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Geist", "Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"]
      },
      colors: {
        brutal: {
          bg: "#080808",
          card: "#0f0f0f",
          border: "#202020",
          text: "#ffffff",
          muted: "#888888",
          primary: "#ffffff",
          secondary: "#181818"
        }
      },
      boxShadow: {
        stark: "4px 4px 0px 0px rgba(255, 255, 255, 1)",
        starkDark: "4px 4px 0px 0px rgba(0, 0, 0, 1)",
        starkMuted: "3px 3px 0px 0px rgba(136, 136, 136, 0.4)",
        glow: "0 0 15px rgba(255, 255, 255, 0.15)"
      }
    }
  },
  plugins: []
}
