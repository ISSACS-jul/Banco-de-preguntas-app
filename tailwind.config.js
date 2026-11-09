/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        dark: {
          900: "#0b0f17",
          850: "#101622",
          800: "#161e2e",
          700: "#1f2b3e",
          600: "#2d3d56",
        },
        brand: {
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
        accent: {
          emerald: "#10b981",
          amber: "#f59e0b",
          rose: "#f43f5e",
          indigo: "#6366f1",
        }
      },
    },
  },
  plugins: [],
}
