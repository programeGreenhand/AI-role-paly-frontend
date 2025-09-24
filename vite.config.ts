// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
//@ts-ignore
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      //@ts-ignore
      '@': path.resolve(__dirname, 'src')
    }
  },
  optimizeDeps: {
  include: ['lamejs']
},
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        // 不重写路径，保持 /api 前缀
        // rewrite: (path) => path.replace(/^\/api/, '')  // 注释掉这行
      }
    }
  }
})