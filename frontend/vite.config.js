import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Vite config — React + Tailwind v4 + proxy to backend
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Backend pe /customers aur /api routes forward kar do
      '/customers': 'http://localhost:3000',
      '/api': 'http://localhost:3000',
    },
  },
})