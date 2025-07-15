import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: 'index.html'
    },
    assetsDir: 'assets',
    copyPublicDir: true
  },
  server: {
    port: 3000
  },
  optimizeDeps: {
    include: ['three']
  },
  publicDir: 'public'
})