import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Vite config — React + Tailwind v4 + proxy to backend, using VITE_API_URL from .env
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the root directory
  const env = loadEnv(mode, process.cwd(), '')
  const API_URL = env.VITE_API_URL

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        // Backend pe /customers aur /api routes forward kar do
        '/customers': API_URL,
        '/api': API_URL,
      },
    },
  }
})