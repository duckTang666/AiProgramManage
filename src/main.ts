import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

// 性能优化：延迟加载非关键资源
const loadCriticalResources = async () => {
  // 预加载关键路由
  const preloadRoutes = ['/login', '/']
  preloadRoutes.forEach(route => {
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = route
    document.head.appendChild(link)
  })
}

const app = createApp(App)

// 配置性能优化
app.config.performance = process.env.NODE_ENV === 'development'
app.config.warnHandler = (msg, instance, trace) => {
  // 生产环境静默警告
  if (process.env.NODE_ENV !== 'development') {
    return
  }
  console.warn(`[Vue warn]: ${msg}
${trace}`)
}

app.use(createPinia())
app.use(router)

// 延迟非关键初始化
setTimeout(() => {
  loadCriticalResources()
}, 100)

app.mount('#app')