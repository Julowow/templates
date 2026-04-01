import { defineConfig } from "vite";
import { resolve } from "path";

const root = resolve(__dirname, "..");

export default defineConfig({
  root,
  publicDir: false,
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "MyLib",                    // <- window.MyLib
      formats: ["iife"],
      fileName: () => "my-lib.js",      // <- output filename
    },
    outDir: resolve(root, "public"),
    emptyOutDir: false,
    minify: "esbuild",
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
