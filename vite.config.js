import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined
      },
      input: {
        main: path.resolve('.', 'index.html'),
      }
    }
  },
  server: {
    historyApiFallback: true,
    host: true,
    port: 3000
  },
})
