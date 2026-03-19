import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  },
  build: {
    // 代码分割优化
    rollupOptions: {
      output: {
        manualChunks: {
          // Vue 核心库
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          // UI 工具库
          'ui-vendor': ['@vueuse/core', 'vue-virtual-scroller'],
          // 工具库
          'utils': ['axios']
        }
      }
    },
    // 压缩优化
    minify: 'terser',
    terserOptions: {
      compress: {
        // 生产环境移除 console
        drop_console: true,
        drop_debugger: true,
        // 移除未使用的代码
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      }
    },
    // chunk 大小警告阈值
    chunkSizeWarningLimit: 1000,
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // 生成 sourcemap（可选，生产环境可关闭）
    sourcemap: false
  },
  // 优化依赖预构建
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      '@vueuse/core',
      'axios',
      'vue-virtual-scroller'
    ]
  }
})
