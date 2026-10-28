// Static build for GitHub Pages (no server). Run: bunx vite build --config vite.pages.config.ts
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

const here = (p: string) => fileURLToPath(new URL(p, import.meta.url));

// Lovable-hosted asset URLs (/__l5e/...) don't exist on GitHub Pages; point them at bundled copies.
function localAssets(): Plugin {
  return {
    name: "pages-local-assets",
    enforce: "pre",
    transform(code, id) {
      if (!code.includes("/__l5e/")) return;
      return code.replace(
        /\/__l5e\/assets-v1\/[^/"')]+\/([^"')]+)/g,
        (_m, file) => here(`./pages/static/${file}`),
      );
    },
  };
}

export default defineConfig({
  root: "pages",
  base: "./",
  publicDir: here("./public"),
  plugins: [localAssets(), react()],
  resolve: { alias: { "@": here("./src") } },
  define: { "import.meta.env.VITE_ORIGINAL_ICONS": JSON.stringify("true") },
  build: { outDir: here("./dist-pages"), emptyOutDir: true },
});
