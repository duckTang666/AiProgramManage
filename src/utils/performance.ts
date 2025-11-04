/**
 * 性能优化工具函数
 */

// 防抖函数
let debounceTimer: NodeJS.Timeout
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  return (...args: Parameters<T>) => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => func.apply(null, args), delay)
  }
}

// 节流函数
let throttleFlag = false
export function throttle<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  return (...args: Parameters<T>) => {
    if (!throttleFlag) {
      throttleFlag = true
      func.apply(null, args)
      setTimeout(() => {
        throttleFlag = false
      }, delay)
    }
  }
}

// 图片懒加载
class LazyLoader {
  private observer: IntersectionObserver | null = null
  
  init() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement
            const src = img.getAttribute('data-src')
            if (src) {
              img.src = src
              img.removeAttribute('data-src')
            }
            this.observer?.unobserve(img)
          }
        })
      }, {
        rootMargin: '50px 0px',
        threshold: 0.1
      })
    }
  }
  
  observe(img: HTMLImageElement) {
    if (this.observer) {
      this.observer.observe(img)
    } else {
      // 降级处理：直接加载图片
      const src = img.getAttribute('data-src')
      if (src) {
        img.src = src
        img.removeAttribute('data-src')
      }
    }
  }
  
  disconnect() {
    this.observer?.disconnect()
  }
}

export const lazyLoader = new LazyLoader()

// 资源预加载
export function preloadResources(urls: string[]) {
  urls.forEach(url => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = url
    link.as = url.endsWith('.js') ? 'script' : url.endsWith('.css') ? 'style' : 'fetch'
    document.head.appendChild(link)
  })
}

// 缓存管理
export class CacheManager {
  private cache = new Map<string, { data: any; timestamp: number }>()
  private readonly TTL = 5 * 60 * 1000 // 5分钟
  
  set(key: string, data: any) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }
  
  get(key: string): any | null {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.TTL) {
      return cached.data
    }
    this.cache.delete(key)
    return null
  }
  
  clear() {
    this.cache.clear()
  }
  
  // 清理过期缓存
  cleanup() {
    const now = Date.now()
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp >= this.TTL) {
        this.cache.delete(key)
      }
    }
  }
}

export const cacheManager = new CacheManager()

// 性能监控
export class PerformanceMonitor {
  private metrics = new Map<string, number>()
  
  mark(name: string) {
    this.metrics.set(name, performance.now())
  }
  
  measure(name: string, startMark: string, endMark: string) {
    const start = this.metrics.get(startMark)
    const end = this.metrics.get(endMark)
    
    if (start && end) {
      const duration = end - start
      console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`)
      
      // 记录到性能API
      if (performance.measure) {
        performance.measure(name, startMark, endMark)
      }
      
      return duration
    }
    return null
  }
  
  // 页面加载时间监控
  monitorPageLoad() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.mark('domContentLoaded')
      })
    }
    
    window.addEventListener('load', () => {
      this.mark('windowLoaded')
      this.measure('DOMContentLoaded to Load', 'domContentLoaded', 'windowLoaded')
    })
  }
}

export const performanceMonitor = new PerformanceMonitor()

// 初始化性能监控
export function initPerformanceMonitoring() {
  if (process.env.NODE_ENV === 'development') {
    performanceMonitor.monitorPageLoad()
    
    // 定期清理缓存
    setInterval(() => {
      cacheManager.cleanup()
    }, 60000) // 每分钟清理一次
  }
}