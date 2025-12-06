import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // PoE item rarity colors
        poe: {
          normal: "#c8c8c8",
          magic: "#8888ff",
          rare: "#ffff77",
          unique: "#af6025",
          currency: "#aa9e82",
          gem: "#1ba29b",
          divination: "#0ebaff",
        },
        // Dark theme matching PoE aesthetic
        background: "#0c0c0e",
        foreground: "#e5e5e5",
        muted: "#1a1a1c",
        border: "#2a2a2c",
      },
    },
  },
  plugins: [],
};

export default config;
