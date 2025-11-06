import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the root directory
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api": {
          target: env.VITE_API_URL || "http://localhost:5000",
          changeOrigin: true,
          secure: false,
          ws: true,
          // Do not strip the /api prefix — forward requests like /api/health -> /api/health on the backend
          // previously the rewrite removed /api which caused proxied requests to hit /health and return 404
          rewrite: (path) => path,
        },
      },
      hmr: {
        protocol: "ws",
        host: "localhost",
      },
    },
    build: {
      rollupOptions: {
        output: {
          assetFileNames: "assets/[name]-[hash][extname]",
          chunkFileNames: "assets/[name]-[hash].js",
          entryFileNames: "assets/[name]-[hash].js",
        },
      },
    },
    optimizeDeps: {
      include: ["react", "react-dom"],
      exclude: ["js-big-decimal"],
    },
  };
});
