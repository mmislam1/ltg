import type { Config } from "tailwindcss";

export default {
  theme: {
    extend: {
      fontFamily: {
        sans: "var(--theme-font-family)",
      },
    },
  },
} satisfies Config;
