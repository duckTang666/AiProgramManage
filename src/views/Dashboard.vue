<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 全局加载状态 -->
    <div v-if="isLoading" class="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-600">正在加载仪表盘数据...</p>
        <p v-if="loadingMessage" class="text-sm text-gray-500 mt-2">{{ loadingMessage }}</p>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-lg p-4 mx-4 mt-4">
      <div class="flex items-center">
        <svg class="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <span class="text-red-700">{{ errorMessage }}</span>
        <button @click="retryLoadData" class="ml-4 text-sm bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded">
          重试
        </button>
      </div>
    </div>

    <!-- 导航栏 -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center space-x-8">
            <h1 class="text-xl font-semibold text-gray-900">AI项目管理平台</h1>
            <div class="hidden md:flex items-center space-x-4">
              <RouterLink to="/" class="text-blue-600 font-medium border-b-2 border-blue-600">
                仪表盘
              </RouterLink>
              <RouterLink to="/project-management" class="text-gray-700 hover:text-blue-600 font-medium">
                项目管理
              </RouterLink>
              <RouterLink to="/organizations" class="text-gray-700 hover:text-blue-600 font-medium">
                组织管理
              </RouterLink>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2">
              <img :src="userAvatar" class="w-8 h-8 rounded-full" alt="用户头像">
              <span class="text-sm font-medium text-gray-700">{{ userDisplayName }}</span>
              <span v-if="userRole" class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{{ userRole }}</span>
            </div>
            <button @click="logout" class="btn btn-outline text-sm">
              退出登录
            </button>
            <button @click="refreshData" class="btn btn-outline text-sm" :disabled="isLoading">
              <svg class="w-4 h-4 mr-1" :class="{ 'animate-spin': isLoading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              刷新
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主内容 -->
    <main class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <!-- 欢迎区域 -->
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-900 mb-2">欢迎回来，{{ userDisplayName }}！</h2>
        <p class="text-gray-600">AI助手已准备就绪，随时为您提供项目管理支持</p>
      </div>

      <!-- 统计卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="card p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-600">活跃项目</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.activeProjects }}</p>
              <p v-if="stats.activeProjects === 0" class="text-xs text-gray-500 mt-1">暂无活跃项目</p>
            </div>
          </div>
        </div>

        <div class="card p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-orange-100 text-orange-600 mr-4">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-600">待办任务</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.pendingTasks }}</p>
              <p v-if="stats.pendingTasks === 0" class="text-xs text-gray-500 mt-1">暂无待办任务</p>
            </div>
          </div>
        </div>

        <div class="card p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-600">组织数量</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.organizations }}</p>
              <p v-if="stats.organizations === 0" class="text-xs text-gray-500 mt-1">点击"创建新组织"开始</p>
            </div>
          </div>
        </div>

        <div class="card p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-600">AI对话</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.aiChats }}</p>
              <p v-if="stats.aiChats === 0" class="text-xs text-gray-500 mt-1">点击"咨询AI助手"开始</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 数据库连接状态 -->
      <div v-if="!isLoading && !errorMessage" class="mb-6">
        <div class="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-4">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span class="text-green-700">数据库连接正常，数据已加载完成</span>
          </div>
          <button @click="refreshData" class="text-green-600 hover:text-green-800 text-sm">
            刷新数据
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- 最近项目 -->
        <div class="lg:col-span-2">
          <div class="card p-6">
            <div class="flex justify-between items-center mb-6">
              <h3 class="text-lg font-semibold text-gray-900">最近项目</h3>
              <RouterLink to="/project-management" class="text-blue-600 hover:text-blue-700 text-sm font-medium">
                查看全部
              </RouterLink>
            </div>
            <div class="space-y-4">
              <div v-for="project in recentProjects" :key="project.id" class="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                <div class="flex justify-between items-start mb-2">
                  <h4 class="font-medium text-gray-900">{{ project.name }}</h4>
                  <span :class="[
                    'px-2 py-1 rounded-full text-xs font-medium',
                    project.status === 'active' ? 'bg-green-100 text-green-800' :
                    project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  ]">
                    {{ project.status === 'active' ? '进行中' : project.status === 'completed' ? '已完成' : '规划中' }}
                  </span>
                </div>
                <p class="text-sm text-gray-600 mb-3">{{ project.description }}</p>
                <div class="flex justify-between items-center text-xs text-gray-500">
                  <span>进度: {{ project.progress_percentage }}%</span>
                  <span>创建: {{ formatDate(project.created_at) }}</span>
                </div>
              </div>
              <div v-if="recentProjects.length === 0" class="text-center py-8 text-gray-500">
                <p>暂无项目数据</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧边栏 -->
        <div class="space-y-6">
          <!-- 快速操作 -->
          <div class="card p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">快速操作</h3>
            <div class="space-y-3">
              <button @click="createNewOrganization" class="btn btn-primary w-full justify-center">
                创建新组织
              </button>
              <button @click="createNewProject" class="btn btn-secondary w-full justify-center">
                创建新项目
              </button>
              <button @click="showAIChat" class="btn btn-outline w-full justify-center">
                咨询AI助手
              </button>
            </div>
          </div>

          <!-- AI建议 -->
          <div class="card p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">AI智能建议</h3>
            <div class="space-y-3">
              <div v-for="suggestion in aiSuggestions" :key="suggestion.id" class="p-3 bg-blue-50 rounded-lg">
                <p class="text-sm text-blue-700">{{ suggestion.message }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useOrganizationStore } from '@/stores/organization'
import { useProjectStore } from '@/stores/project'
import { UserService, TaskService, ChatService, DashboardService } from '@/lib/database'

// 类型定义
interface Project {
  id: number
  name: string
  description?: string | null
  status: string
  priority: string
  progress_percentage?: number | null
  start_date?: string | null
  end_date?: string | null
  owner_id: number
  organization_id: number
  created_at: string
  updated_at: string
}

// Task interface is defined but not currently used in this component

interface Message {
  id: number
  message: string
}

interface UserProfile {
  id?: number
  display_name?: string
  role?: string
  is_active?: boolean
  avatar_url?: string
}

const router = useRouter()
const authStore = useAuthStore()
const organizationStore = useOrganizationStore()
const projectStore = useProjectStore()

// 用户信息
const userDisplayName = computed(() => {
  if (userProfile.value?.display_name) {
    return userProfile.value.display_name
  }
  return authStore.user?.user_metadata?.name || authStore.user?.email?.split('@')[0] || '用户'
})

const userAvatar = computed(() => {
  return userProfile.value?.avatar_url || authStore.user?.user_metadata?.avatar_url || '/default-avatar.png'
})

const userRole = computed(() => {
  return userProfile.value?.role || 'member'
})

// 用户档案
const userProfile = ref<UserProfile | null>(null)

// 统计数据
const stats = ref({
  activeProjects: 0,
  pendingTasks: 0,
  organizations: 0,
  aiChats: 0
})

// 最近项目
const recentProjects = ref<Project[]>([])

// AI建议
const aiSuggestions = ref<Message[]>([])

// 加载状态
const isLoading = ref(true)
const loadingMessage = ref('')
const errorMessage = ref('')

// 格式化日期
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

// 退出登录
async function logout() {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
  }
}

// 刷新数据
async function refreshData() {
  await loadDashboardData()
}

// 重试加载数据
async function retryLoadData() {
  errorMessage.value = ''
  await loadDashboardData()
}

// 显示AI聊天
function showAIChat() {
  // 触发AI聊天助手
  const event = new CustomEvent('show-ai-chat')
  window.dispatchEvent(event)
}

// 创建新组织
async function createNewOrganization() {
  try {
    // 跳转到组织管理页面，并显示创建表单
    router.push('/organizations?action=create')
  } catch (error) {
    console.error('创建组织失败:', error)
    errorMessage.value = '创建组织失败，请检查数据库连接'
  }
}

// 创建新项目
async function createNewProject() {
  try {
    // 检查用户是否有组织
    if (organizationStore.organizations.length === 0) {
      // 如果没有组织，先创建组织
      if (window.confirm('您还没有加入任何组织，是否现在创建新组织？')) {
        router.push('/organizations?action=create')
      }
      return
    }
    
    // 跳转到项目管理页面，并显示创建表单
    router.push('/project-management?action=create')
  } catch (error) {
    console.error('创建项目失败:', error)
    errorMessage.value = '创建项目失败，请检查数据库连接'
  }
}

// 加载用户档案
async function loadUserProfile() {
  try {
    const userId = authStore.user?.id
    if (!userId) {
      console.log('用户ID为空，跳过用户档案加载')
      return
    }

    loadingMessage.value = '正在加载用户信息...'
    userProfile.value = await UserService.getUserByAuthId(userId)
    console.log('✅ 用户档案加载成功:', userProfile.value)
  } catch (error: any) {
    console.error('加载用户档案失败:', error)
    
    // 如果是表不存在错误，提示用户执行数据库初始化
    if (error?.code === 'PGRST116' || error?.message?.includes('does not exist')) {
      errorMessage.value = '用户档案表不存在，请先执行数据库初始化脚本'
    } else {
      // 创建默认用户档案对象
      userProfile.value = {
        display_name: authStore.user?.email?.split('@')[0] || '用户',
        role: 'member',
        is_active: true
      }
    }
  }
}

// 加载统计数据
async function loadStats() {
  try {
    const userId = authStore.user?.id
    if (!userId) {
      console.log('用户ID为空，跳过数据加载')
      return
    }

    loadingMessage.value = '正在加载统计数据...'
    
    // 首先获取数据库用户ID
    const userProfile = await UserService.getUserByAuthId(userId)
    if (!userProfile?.id) {
      console.log('未找到数据库用户ID，跳过统计数据加载')
      return
    }
    
    const dbUserId = userProfile.id
    
    // 使用Dashboard服务获取统计数据
    const dashboardStats = await DashboardService.getDashboardStats(dbUserId)
    
    // 加载组织数据用于显示组织数量
    await organizationStore.fetchOrganizations(dbUserId)
    
    stats.value = {
      activeProjects: dashboardStats.activeProjects,
      pendingTasks: dashboardStats.pendingTasks,
      organizations: organizationStore.organizations.length,
      aiChats: dashboardStats.aiChats
    }
    
    console.log('✅ 统计数据加载完成:', stats.value)
    
  } catch (error: any) {
    console.error('加载统计数据失败:', error)
    
    // 根据错误类型设置错误消息
    if (error?.code === 'PGRST116' || error?.message?.includes('does not exist')) {
      errorMessage.value = '数据库表不存在，请先执行数据库初始化脚本'
    } else if (error?.message?.includes('JWT')) {
      errorMessage.value = '认证令牌失效，请重新登录'
    } else if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
      errorMessage.value = '网络连接失败，请检查网络设置'
    } else {
      errorMessage.value = `数据加载失败: ${error.message}`
    }
    
    // 使用默认数据
    stats.value = {
      activeProjects: 0,
      pendingTasks: 0,
      organizations: 0,
      aiChats: 0
    }
  }
}

// 加载最近项目
async function loadRecentProjects() {
  try {
    const userId = authStore.user?.id
    if (!userId) {
      console.log('用户ID为空，跳过最近项目加载')
      return
    }

    // 首先获取数据库用户ID
    const userProfile = await UserService.getUserByAuthId(userId)
    if (!userProfile?.id) {
      console.log('未找到数据库用户ID，跳过最近项目加载')
      return
    }
    
    const dbUserId = userProfile.id

    // 使用Dashboard服务获取最近项目
    const recentProjectsData = await DashboardService.getRecentProjects(dbUserId, 5)
    recentProjects.value = recentProjectsData || []
      
    console.log('✅ 最近项目加载完成，数量:', recentProjects.value.length)
      
  } catch (error) {
    console.error('加载最近项目失败:', error)
    recentProjects.value = []
  }
}

// 生成AI建议
async function generateAISuggestions() {
  try {
    const suggestions = []
    
    // 基于项目状态生成建议
    if (stats.value.pendingTasks > 10) {
      suggestions.push({
        id: 1,
        message: `检测到您有${stats.value.pendingTasks}个待办任务，建议优先处理高优先级任务`
      })
    }
    
    if (stats.value.activeProjects > 0) {
      suggestions.push({
        id: 2,
        message: `您有${stats.value.activeProjects}个活跃项目，建议定期检查项目进度`
      })
    }
    
    if (stats.value.organizations === 0) {
      suggestions.push({
        id: 3,
        message: '您还没有加入任何组织，建议先创建或加入一个组织'
      })
    }
    
    // 默认建议
    if (suggestions.length === 0) {
      suggestions.push({
        id: 4,
        message: '一切运行良好！如有需要，可以随时咨询AI助手'
      })
    }
    
    aiSuggestions.value = suggestions
    
  } catch (error) {
    console.error('生成AI建议失败:', error)
    aiSuggestions.value = [
      { id: 1, message: 'AI建议服务暂时不可用，请稍后重试' }
    ]
  }
}

// 加载数据
async function loadDashboardData() {
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    // 确保用户已认证
    if (!authStore.user?.id) {
      console.log('用户未认证，等待认证状态')
      // 等待一段时间后重试
      setTimeout(() => {
        if (authStore.user?.id) {
          loadDashboardData()
        } else {
          isLoading.value = false
          errorMessage.value = '用户未认证，请先登录'
        }
      }, 2000)
      return
    }
    
    console.log('🚀 开始加载仪表盘数据，用户ID:', authStore.user.id)
    
    // 并行加载用户档案、统计数据、最近项目
    loadingMessage.value = '正在初始化数据加载...'
    
    await Promise.all([
      loadUserProfile(),
      loadStats(),
      loadRecentProjects()
    ])
    
    // 生成AI建议
    loadingMessage.value = '正在生成AI建议...'
    await generateAISuggestions()
    
    console.log('🎉 仪表盘数据加载完成:', {
      用户档案: userProfile.value ? '已加载' : '未加载',
      组织数量: organizationStore.organizations.length,
      活跃项目: stats.value.activeProjects,
      待办任务: stats.value.pendingTasks,
      AI对话: stats.value.aiChats,
      最近项目: recentProjects.value.length
    })
    
  } catch (error: any) {
    console.error('❌ 加载仪表盘数据失败:', error)
    
    // 检查是否是策略递归错误
    if (error?.code === '42P17' && error?.message?.includes('infinite recursion')) {
      console.warn('检测到数据库策略递归错误，请执行修复脚本')
      errorMessage.value = '检测到数据库策略递归错误，请执行数据库修复脚本'
      aiSuggestions.value = [
        { id: 1, message: '检测到数据库策略递归错误，请执行修复脚本' }
      ]
    } else if (error?.message?.includes('JWT')) {
      console.warn('认证令牌失效，请重新登录')
      errorMessage.value = '认证令牌失效，请重新登录'
      aiSuggestions.value = [
        { id: 1, message: '认证令牌失效，请重新登录' }
      ]
    } else if (error?.message?.includes('does not exist')) {
      errorMessage.value = '数据库表不存在，请先执行数据库初始化脚本'
    } else {
      errorMessage.value = `数据加载失败: ${error.message}`
    }
    
    // 如果加载失败，使用默认数据
    stats.value = {
      activeProjects: 0,
      pendingTasks: 0,
      organizations: 0,
      aiChats: 0
    }
    
    recentProjects.value = []
    
    if (aiSuggestions.value.length === 0) {
      aiSuggestions.value = [
        { id: 1, message: '数据加载失败，请检查网络连接或数据库配置' }
      ]
    }
  } finally {
    isLoading.value = false
    loadingMessage.value = ''
  }
}

// 监听用户认证状态变化
watch(() => authStore.user?.id, (newUserId) => {
  if (newUserId) {
    console.log('检测到用户ID变化，重新加载数据:', newUserId)
    loadDashboardData()
  }
})

// 监听路由变化，当返回仪表盘时刷新数据
watch(() => router.currentRoute.value.path, (newPath) => {
  if (newPath === '/' && authStore.user?.id) {
    console.log('检测到路由变化到仪表盘，刷新数据')
    loadDashboardData()
  }
})

onMounted(async () => {
  await loadDashboardData()
})
</script>

<style scoped>
.card {
  @apply bg-white rounded-lg shadow-sm border border-gray-200;
}

.btn {
  @apply px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center;
}

.btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-700;
}

.btn-secondary {
  @apply bg-gray-600 text-white hover:bg-gray-700;
}

.btn-outline {
  @apply border border-gray-300 text-gray-700 hover:bg-gray-50;
}
</style>