// Static build for GitHub Pages (no server). Run: bunx vite build --config vite.pages.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  root: "pages",
  base: "./",
  publicDir: fileURLToPath(new URL("./public", import.meta.url)),
  plugins: [react()],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  define: { "import.meta.env.VITE_ORIGINAL_ICONS": JSON.stringify("true") },
  build: { outDir: fileURLToPath(new URL("./dist-pages", import.meta.url)), emptyOutDir: true },
});
