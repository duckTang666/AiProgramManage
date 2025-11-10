import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

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

app.mount('#app')