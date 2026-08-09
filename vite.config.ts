import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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