import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  base: './', // Important for relative paths in extensions
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  optimizeDeps: {
    include: ['@iconify-json/mdi', '@iconify-json/material-symbols', '@iconify-json/fluent']
  }
})
