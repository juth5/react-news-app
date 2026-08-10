import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // ↓↓↓ ここから追加 ↓↓↓
  server: {
    proxy: {
      '/api/news': {
        target: 'https://news.google.com',
        changeOrigin: true,
        // /api/news → /rss/search に変換して転送
        rewrite: (path) => path.replace(/^\/api\/news/, '/rss/search'),
      },
    },
  },
  })