import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://ruyuang0509.github.io",
  base: "/ruyuang-portfolio-next",
  vite: { plugins: [tailwindcss()] },
});
