// Static build for GitHub Pages (no server). Run: bunx vite build --config vite.pages.config.ts
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const here = (p: string) => fileURLToPath(new URL(p, import.meta.url));
const l5e = /\/__l5e\/assets-v1\/[^/"')]+\/([^"')\s]+)/g;

// Lovable-hosted asset URLs (/__l5e/...) don't exist on GitHub Pages; ship copies from pages/static.
function localAssets(): Plugin {
  return {
    name: "pages-local-assets",
    generateBundle(_o, bundle) {
      const files = new Set<string>();
      for (const out of Object.values(bundle)) {
        if (out.type === "asset" && out.fileName.endsWith(".css")) {
          out.source = String(out.source).replace(l5e, (_m, f) => (files.add(f), `../${f}`));
        } else if (out.type === "chunk") {
          out.code = out.code.replace(l5e, (_m, f) => (files.add(f), `./${f}`));
        }
      }
      for (const f of files)
        this.emitFile({ type: "asset", fileName: f, source: readFileSync(here(`./pages/static/${f}`)) });
    },
  };
}

export default defineConfig({
  root: "pages",
  base: "./",
  publicDir: here("./public"),
  plugins: [react(), localAssets()],
  resolve: { alias: { "@": here("./src") } },
  define: { "import.meta.env.VITE_ORIGINAL_ICONS": JSON.stringify("true") },
  build: { outDir: here("./dist-pages"), emptyOutDir: true },
});
