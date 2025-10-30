<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- 全局加载状态 -->
    <div v-if="isLoading" class="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-600">正在初始化应用...</p>
        <p v-if="loadingMessage" class="text-sm text-gray-500 mt-2">{{ loadingMessage }}</p>
      </div>
    </div>

    <!-- 全局错误提示 -->
    <div v-if="globalError" class="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
      <div class="flex items-center">
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <span>{{ globalError }}</span>
        <button @click="globalError = null" class="ml-4 text-red-700 hover:text-red-900">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 数据库连接状态 -->
    <div v-if="showDatabaseStatus" class="fixed bottom-4 right-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-2 rounded text-sm z-40">
      <div class="flex items-center">
        <div :class="['w-2 h-2 rounded-full mr-2', databaseConnected ? 'bg-green-500' : 'bg-red-500']"></div>
        <span>{{ databaseConnected ? '数据库已连接' : '数据库连接失败' }}</span>
      </div>
    </div>

    <RouterView />
    <!-- AI聊天助手组件 -->
    <AIChatAssistant v-if="isAuthenticated" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useOrganizationStore } from '@/stores/organization'
import { useProjectStore } from '@/stores/project'
import { UserService, OrganizationService, ProjectService } from '@/lib/database'
import { supabase } from '@/lib/supabase'
import AIChatAssistant from '@/components/AIChatAssistant.vue'

const authStore = useAuthStore()
const organizationStore = useOrganizationStore()
const projectStore = useProjectStore()

const isAuthenticated = ref(false)
const isLoading = ref(true)
const loadingMessage = ref('')
const globalError = ref<string | null>(null)
const databaseConnected = ref(false)
const showDatabaseStatus = ref(false)

// 监听认证状态变化
watch(() => authStore.isAuthenticated, (newValue) => {
  isAuthenticated.value = newValue
  if (newValue) {
    initializeUserData()
  }
})

// 测试数据库连接
async function testDatabaseConnection() {
  try {
    loadingMessage.value = '正在测试数据库连接...'
    
    // 尝试获取当前用户信息来测试连接
    const { data: authData } = await supabase.auth.getUser()
    if (authData.user) {
      const user = await UserService.getUserByAuthId(authData.user.id)
      if (user) {
        databaseConnected.value = true
        console.log('✅ 数据库连接成功')
        return true
      }
    }
  } catch (error: any) {
    console.error('❌ 数据库连接失败:', error)
    
    // 根据错误类型显示不同的提示
    if (error?.message?.includes('JWT')) {
      globalError.value = '认证令牌失效，请重新登录'
    } else if (error?.message?.includes('fetch') || error?.message?.includes('network')) {
      globalError.value = '网络连接失败，请检查网络设置'
    } else if (error?.message?.includes('PGRST')) {
      globalError.value = '数据库表不存在，请执行数据库初始化脚本'
    } else {
      globalError.value = `数据库连接错误: ${error.message}`
    }
    
    databaseConnected.value = false
    return false
  } finally {
    // 显示数据库状态3秒钟
    showDatabaseStatus.value = true
    setTimeout(() => {
      showDatabaseStatus.value = false
    }, 3000)
  }
}

// 初始化用户数据 - 按需加载优化版本
async function initializeUserData() {
  try {
    const user = authStore.user
    if (!user?.id) {
      console.warn('用户ID为空，跳过数据初始化')
      return
    }

    // 并行加载用户档案和组织数据
    const [userProfileResult, organizationsResult] = await Promise.allSettled([
      UserService.getUserByAuthId(user.id),
      organizationStore.fetchOrganizations(parseInt(user.id))
    ])

    // 处理用户档案结果
    if (userProfileResult.status === 'fulfilled') {
      console.log('✅ 用户档案加载成功')
    } else {
      console.warn('用户档案加载失败:', userProfileResult.reason)
    }

    // 处理组织数据结果
    if (organizationsResult.status === 'fulfilled') {
      console.log('✅ 组织数据加载成功，数量:', organizationStore.organizations.length)
      
      // 如果有组织，异步加载项目数据（不阻塞界面）
      if (organizationStore.organizations.length > 0) {
        setTimeout(() => {
          loadProjectsData().catch(error => {
            console.warn('项目数据异步加载失败:', error)
          })
        }, 500) // 延迟500ms，让用户先看到界面
      }
    } else {
      console.warn('组织数据加载失败:', organizationsResult.reason)
    }

    console.log('🎉 用户数据初始化完成')
    
  } catch (error) {
    console.error('❌ 用户数据初始化失败:', error)
    // 不显示全局错误，因为这是后台异步加载
  }
}

// 异步加载项目数据
async function loadProjectsData() {
  if (!organizationStore.organizations.length) return
  
  try {
    console.log('🔄 开始异步加载项目数据...')
    
    // 并行加载所有组织的项目数据
    const projectPromises = organizationStore.organizations.map(async (org) => {
      try {
        await projectStore.fetchProjects(org.id)
        console.log(`✅ 组织 ${org.name} 的项目数据加载成功`)
      } catch (error) {
        console.warn(`组织 ${org.name} 的项目数据加载失败:`, error)
      }
    })
    
    await Promise.allSettled(projectPromises)
    console.log('🎉 所有项目数据异步加载完成')
    
  } catch (error) {
    console.warn('项目数据异步加载异常:', error)
  }
}

// 初始化应用 - 并行优化版本
async function initializeApp() {
  try {
    console.log('🚀 开始初始化AI项目管理平台...')
    
    // 并行执行认证初始化和数据库连接测试
    loadingMessage.value = '正在并行初始化...'
    
    const [authResult, dbResult] = await Promise.allSettled([
      authStore.init(),
      testDatabaseConnection()
    ])
    
    // 处理认证结果
    if (authResult.status === 'fulfilled') {
      isAuthenticated.value = authStore.isAuthenticated
      console.log('✅ 认证初始化完成，状态:', isAuthenticated.value)
    } else {
      console.error('❌ 认证初始化失败:', authResult.reason)
      globalError.value = '认证服务暂时不可用，部分功能受限'
    }
    
    // 处理数据库连接结果
    if (dbResult.status === 'fulfilled') {
      databaseConnected.value = dbResult.value
      console.log('✅ 数据库连接测试完成，状态:', databaseConnected.value)
    } else {
      console.error('❌ 数据库连接测试失败:', dbResult.reason)
      databaseConnected.value = false
    }
    
    // 如果认证成功且数据库连接正常，异步加载用户数据（不阻塞界面显示）
    if (isAuthenticated.value && databaseConnected.value) {
      setTimeout(() => {
        initializeUserData().catch(error => {
          console.warn('用户数据异步加载失败:', error)
        })
      }, 100) // 延迟100ms，让界面先显示
    }

    console.log('🎉 AI项目管理平台初始化完成')
    
  } catch (error) {
    console.error('❌ 应用初始化失败:', error)
    globalError.value = '应用初始化失败，请刷新页面重试'
  } finally {
    isLoading.value = false
    loadingMessage.value = ''
  }
}

// 监听路由变化，处理页面特定的数据加载
watch(() => authStore.user?.id, (newUserId) => {
  if (newUserId) {
    console.log('检测到用户ID变化，重新加载数据:', newUserId)
    initializeUserData()
  }
})

// 监听全局错误事件
window.addEventListener('global-error', (event: any) => {
  if (event.detail?.message) {
    globalError.value = event.detail.message
  }
})

// 提供全局错误处理函数
function handleGlobalError(message: string) {
  globalError.value = message
  // 5秒后自动清除错误
  setTimeout(() => {
    globalError.value = null
  }, 5000)
}

// 暴露全局方法给其他组件使用
window.handleGlobalError = handleGlobalError

declare global {
  interface Window {
    handleGlobalError: (message: string) => void
  }
}

onMounted(async () => {
  await initializeApp()
})
</script>

<style scoped>
/* 自定义动画 */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>