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
          // node_modules 라이브러리들
          if (id.includes("node_modules")) {
            // React 관련
            if (id.includes("react") || id.includes("react-dom") || id.includes("react-router")) {
              return "vendor-react";
            }

            // Radix UI 컴포넌트들
            if (id.includes("@radix-ui")) {
              return "vendor-ui";
            }

            // 아이콘과 유틸리티
            if (
              id.includes("lucide-react") ||
              id.includes("clsx") ||
              id.includes("tailwind-merge") ||
              id.includes("class-variance-authority")
            ) {
              return "vendor-utils";
            }

            // Form 관련
            if (id.includes("react-hook-form") || id.includes("@hookform/resolvers") || id.includes("zod")) {
              return "vendor-forms";
            }

            // 기타 큰 라이브러리들
            if (
              id.includes("socket.io-client") ||
              id.includes("zustand") ||
              id.includes("immer") ||
              id.includes("papaparse") ||
              id.includes("qrcode.react") ||
              id.includes("sonner")
            ) {
              return "vendor-misc";
            }

            // 나머지 라이브러리들
            return "vendor-others";
          }

          // 우리 소스코드
          if (id.includes("src/pages/admin")) {
            return "admin-pages";
          }

          if (id.includes("src/features/csv-to-competition")) {
            return "csv-feature"; // 큰 파일이므로 별도 청크
          }

          if (id.includes("src/shared")) {
            return "shared-components";
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
