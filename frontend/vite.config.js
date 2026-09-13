import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const PRODUCTION_API = 'https://skillhub-ljz1.onrender.com'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = env.VITE_API_URL?.trim() || (mode === 'production' ? PRODUCTION_API : 'http://localhost:8080')

  return {
    plugins: [react()],
    define: {
      // SockJS requires Node's `global` — polyfill it for the browser
      global: 'globalThis',
      'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl),
    },
  }
})
