import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  server: {
    proxy: {
      "/socket.io": {
        target: process.env.VITE_SERVER_URL || "http://localhost:3000",
        changeOrigin: true,
        ws: true, // WebSocket 지원
      },
      "/socket": {
        target: process.env.VITE_SERVER_URL || "http://localhost:3000",
        changeOrigin: true,
        ws: true, // WebSocket 지원
      },
      "/api": {
        target: process.env.VITE_SERVER_URL || "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
