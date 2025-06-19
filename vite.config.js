import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/ai-nutrition-app/',
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api/fatsecret': {
        target: 'https://platform.fatsecret.com/rest/server.api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/fatsecret/, ''),
        secure: false,
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
      }
    }
  }
})
