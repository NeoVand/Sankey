import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  base: '/Sankey/', // GitHub Pages repository name
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom']
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
    force: true,
  },
  server: {
    proxy: {
      '/api/sec': {
        target: 'https://www.sec.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/sec/, ''),
        secure: false
      },
      '/api/data-sec': {
        target: 'https://data.sec.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/data-sec/, ''),
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          'mui': ['@mui/material', '@mui/icons-material'],
          'react-vendor': ['react', 'react-dom'],
          'nivo': ['@nivo/sankey']
        },
        assetFileNames: (assetInfo) => {
          return `assets/${assetInfo.name}`;
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js'
      }
    },
    copyPublicDir: true
  }
})
