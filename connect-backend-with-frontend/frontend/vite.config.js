import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // base: '/frontend/',
  server: {
    proxy: {
      '/api': "http://localhost:3000",
    }
  },

  plugins: [react()],
})
