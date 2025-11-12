import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1d4ed8",
          foreground: "#ffffff"
        },
        secondary: {
          DEFAULT: "#0f172a",
          foreground: "#e2e8f0"
        }
      }
    }
  },
  darkMode: ["class"],
  plugins: []
};

export default config;
