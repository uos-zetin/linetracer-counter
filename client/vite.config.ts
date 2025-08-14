import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // node_modules 라이브러리들만 분리 (React는 함께 유지)
          if (id.includes("node_modules")) {
            // Radix UI 컴포넌트들
            if (id.includes("@radix-ui")) {
              return "vendor-ui";
            }

            // 아이콘과 유틸리티
            if (id.includes("lucide-react") || id.includes("clsx") || id.includes("tailwind-merge")) {
              return "vendor-utils";
            }

            // Form 관련 (React와 분리해도 안전)
            if (id.includes("zod") || id.includes("@hookform/resolvers")) {
              return "vendor-forms";
            }

            // 기타 독립적인 라이브러리들
            if (
              id.includes("socket.io-client") ||
              id.includes("papaparse") ||
              id.includes("qrcode.react") ||
              id.includes("sonner")
            ) {
              return "vendor-misc";
            }
          }
        },
      },
    },
  },
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
  preview: {
    proxy: {
      "/socket.io": {
        target: process.env.VITE_SERVER_URL || "http://localhost:3000",
        changeOrigin: true,
        ws: true,
      },
      "/socket": {
        target: process.env.VITE_SERVER_URL || "http://localhost:3000",
        changeOrigin: true,
        ws: true,
      },
      "/api": {
        target: process.env.VITE_SERVER_URL || "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
