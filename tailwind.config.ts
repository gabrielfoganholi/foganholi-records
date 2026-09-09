import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-fraunces)", "serif"],
      },
      colors: {
        // Texto principal em tom marfim/creme suave
        parchment: "#F8FAFC",
        // Mapeando a estrutura antiga 'walnut' para tons de grafite premium (Slate/Zinc)
        walnut: {
          700: "#334155", // Bordas de destaque
          800: "#1E293B", // Cards e elementos elevados
          900: "#0F172A", // Fundo de containers
          950: "#090D16", // Fundo geral da página (Dark bem profundo)
        },
      },
    },
  },
  plugins: [],
};

export default config;