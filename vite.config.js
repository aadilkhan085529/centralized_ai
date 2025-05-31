import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/centralized_ai/', // Ensure correct asset paths for GitHub Pages
  server: {
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
})
