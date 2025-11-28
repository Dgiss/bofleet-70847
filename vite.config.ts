import react from "@vitejs/plugin-react-swc";
import { componentTagger } from "lovable-tagger";
import path from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api/thingsmobile': {
        target: 'https://api.thingsmobile.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/thingsmobile/, ''),
        secure: false,
      },
      '/api/phenix': {
        target: 'https://api.phenix-partner.fr',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/phenix/, ''),
        secure: false,
      },
      '/api/truphone': {
        target: 'https://iot.truphone.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/truphone/, ''),
        secure: false,
      }
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
