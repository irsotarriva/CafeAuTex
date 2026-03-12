import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // Tauri: dev server port
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      // Tauri expects the app to be stable on this port
      ignored: ["**/src-tauri/**"],
    },
  },

  // Tauri: disable browser opening
  clearScreen: false,

  // Tauri: mobile target not used
  // https://tauri.app/start/frontend/vite/
  envPrefix: ["VITE_", "TAURI_"],

  build: {
    // Tauri supports ES2021
    target: ["es2021", "chrome105", "safari14"],
    // Don't minify for debug builds
    minify: !process.env.TAURI_DEBUG ? "esbuild" : false,
    // Produce sourcemaps for debug builds
    sourcemap: !!process.env.TAURI_DEBUG,
  },

  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});
