import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";

const isVercel = Boolean(process.env.VERCEL);

export default defineConfig({
  adapter: isVercel
    ? vercel()
    : node({
        mode: "standalone",
      }),
  server: {
    host: true,
  },
  vite: {
    plugins: [tailwindcss()],
  },
  i18n: {
    defaultLocale: "pl",
    locales: ["pl", "en"],
    routing: {
      prefixDefaultLocale: true,
    },
  },
});
