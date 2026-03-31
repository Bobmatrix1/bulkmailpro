import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: 1576,
    strictPort: true,
    host: '127.0.0.1',
    proxy: {
      '/api/resend': {
        target: 'https://api.resend.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/resend/, ''),
      },
    },
    hmr: {
      protocol: 'ws',
      host: '127.0.0.1',
      port: 1576,
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
