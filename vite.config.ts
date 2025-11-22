// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  optimizeDeps: {
    include: ['lamejs']
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8082',  // 改成 8082，匹配后端端口
        changeOrigin: true,
        secure: false,
      }
    }
  }
})