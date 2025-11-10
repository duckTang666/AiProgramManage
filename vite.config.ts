import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue({
    template: {
      compilerOptions: {
        // 优化模板编译
        whitespace: 'condense'
      }
    }
  })],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 3000,
    host: true,
    // 强制使用指定端口，不自动切换
    strictPort: true,
    // 优化开发服务器性能
    hmr: {
      overlay: false
    },
    // 添加静态资源处理，避免依赖扫描错误
    fs: {
      allow: ['..', __dirname]
    }
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    // 优化构建性能
    rollupOptions: {
      output: {
        manualChunks: {
          // 代码分割优化
          vue: ['vue', 'vue-router', 'pinia'],
          supabase: ['@supabase/supabase-js'],
          utils: ['axios', '@vueuse/core']
        }
      }
    },
    // 优化构建输出
    chunkSizeWarningLimit: 1000,
    assetsInlineLimit: 4096
  },
  // 优化预构建，修复依赖扫描错误
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', '@supabase/supabase-js'],
    exclude: [],
    // 强制预构建依赖
    force: true
  },
  // 解决依赖扫描错误
  esbuild: {
    target: 'esnext'
  }
})