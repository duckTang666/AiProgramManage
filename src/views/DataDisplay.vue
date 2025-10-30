<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 导航栏 -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center space-x-8">
            <h1 class="text-xl font-semibold text-gray-900">AI项目管理平台 - 数据展示</h1>
            <div class="hidden md:flex items-center space-x-4">
              <RouterLink to="/" class="text-gray-700 hover:text-blue-600 font-medium">
                仪表盘
              </RouterLink>
              <RouterLink to="/data-display" class="text-blue-600 font-medium border-b-2 border-blue-600">
                数据展示
              </RouterLink>
              <RouterLink to="/project-management" class="text-gray-700 hover:text-blue-600 font-medium">
                项目管理
              </RouterLink>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <button @click="refreshData" class="btn btn-outline text-sm" :disabled="isLoading">
              <svg class="w-4 h-4 mr-1" :class="{ 'animate-spin': isLoading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              刷新数据
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主内容 -->
    <main class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <!-- 统计概览 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="card p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-600">用户总数</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.users }}</p>
            </div>
          </div>
        </div>

        <div class="card p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-600">组织总数</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.organizations }}</p>
            </div>
          </div>
        </div>

        <div class="card p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-600">项目总数</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.projects }}</p>
            </div>
          </div>
        </div>

        <div class="card p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-orange-100 text-orange-600 mr-4">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-600">任务总数</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.tasks }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 数据表格区域 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- 用户列表 -->
        <div class="card p-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-semibold text-gray-900">用户列表</h3>
            <span class="text-sm text-gray-500">{{ users.length }} 个用户</span>
          </div>
          <div class="space-y-3">
            <div v-for="user in users.slice(0, 5)" :key="user.id" class="flex items-center p-3 border border-gray-200 rounded-lg">
              <img :src="user.avatar_url || '/default-avatar.png'" class="w-10 h-10 rounded-full mr-3" alt="用户头像">
              <div class="flex-1">
                <p class="font-medium text-gray-900">{{ user.display_name }}</p>
                <p class="text-sm text-gray-600">{{ user.email }}</p>
              </div>
              <span :class="[
                'px-2 py-1 rounded-full text-xs font-medium',
                user.role === 'admin' ? 'bg-red-100 text-red-800' :
                user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              ]">
                {{ user.role === 'admin' ? '管理员' : user.role === 'manager' ? '经理' : '成员' }}
              </span>
            </div>
            <div v-if="users.length === 0" class="text-center py-4 text-gray-500">
              暂无用户数据
            </div>
          </div>
        </div>

        <!-- 项目列表 -->
        <div class="card p-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-semibold text-gray-900">项目列表</h3>
            <span class="text-sm text-gray-500">{{ projects.length }} 个项目</span>
          </div>
          <div class="space-y-3">
            <div v-for="project in projects.slice(0, 5)" :key="project.id" class="p-3 border border-gray-200 rounded-lg">
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
              <p class="text-sm text-gray-600 mb-2">{{ project.description }}</p>
              <div class="flex justify-between items-center text-xs text-gray-500">
                <span>进度: {{ project.progress_percentage || 0 }}%</span>
                <span>优先级: {{ project.priority === 'high' ? '高' : project.priority === 'urgent' ? '紧急' : '中' }}</span>
              </div>
            </div>
            <div v-if="projects.length === 0" class="text-center py-4 text-gray-500">
              暂无项目数据
            </div>
          </div>
        </div>

        <!-- 任务列表 -->
        <div class="card p-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-semibold text-gray-900">任务列表</h3>
            <span class="text-sm text-gray-500">{{ tasks.length }} 个任务</span>
          </div>
          <div class="space-y-3">
            <div v-for="task in tasks.slice(0, 5)" :key="task.id" class="p-3 border border-gray-200 rounded-lg">
              <div class="flex justify-between items-start mb-2">
                <h4 class="font-medium text-gray-900">{{ task.title }}</h4>
                <span :class="[
                  'px-2 py-1 rounded-full text-xs font-medium',
                  task.status === 'done' ? 'bg-green-100 text-green-800' :
                  task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                ]">
                  {{ task.status === 'done' ? '已完成' : task.status === 'in_progress' ? '进行中' : '待办' }}
                </span>
              </div>
              <p class="text-sm text-gray-600 mb-2">{{ task.description }}</p>
              <div class="flex justify-between items-center text-xs text-gray-500">
                <span>截止: {{ formatDate(task.due_date) }}</span>
                <span>预估: {{ task.estimated_hours || 0 }}小时</span>
              </div>
            </div>
            <div v-if="tasks.length === 0" class="text-center py-4 text-gray-500">
              暂无任务数据
            </div>
          </div>
        </div>

        <!-- AI对话记录 -->
        <div class="card p-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-semibold text-gray-900">AI对话记录</h3>
            <span class="text-sm text-gray-500">{{ chatHistory.length }} 条记录</span>
          </div>
          <div class="space-y-3">
            <div v-for="chat in chatHistory.slice(0, 5)" :key="chat.id" class="p-3 border border-gray-200 rounded-lg">
              <div class="flex justify-between items-center mb-2">
                <span class="text-sm font-medium text-gray-700">{{ chat.message_type === 'question' ? '问题' : chat.message_type === 'suggestion' ? '建议' : '分析' }}</span>
                <span class="text-xs text-gray-500">{{ formatDate(chat.created_at) }}</span>
              </div>
              <p class="text-sm text-gray-600 mb-1"><strong>用户:</strong> {{ chat.user_message }}</p>
              <p class="text-sm text-gray-700"><strong>AI:</strong> {{ chat.ai_response }}</p>
            </div>
            <div v-if="chatHistory.length === 0" class="text-center py-4 text-gray-500">
              暂无对话记录
            </div>
          </div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="isLoading" class="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p class="text-gray-600">正在加载数据...</p>
        </div>
      </div>

      <!-- 错误提示 -->
      <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
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
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { UserService, OrganizationService, ProjectService, TaskService, ChatService } from '@/lib/database'

// 类型定义
interface User {
  id: number
  email: string
  display_name: string
  role: string
  avatar_url?: string
}

interface Project {
  id: number
  name: string
  description?: string
  status: string
  priority: string
  progress_percentage?: number
}

interface Task {
  id: number
  title: string
  description?: string
  status: string
  due_date?: string
  estimated_hours?: number
}

interface ChatHistory {
  id: number
  message_type: string
  user_message: string
  ai_response: string
  created_at: string
}

// 响应式数据
const users = ref<User[]>([])
const projects = ref<Project[]>([])
const tasks = ref<Task[]>([])
const chatHistory = ref<ChatHistory[]>([])

const stats = ref({
  users: 0,
  organizations: 0,
  projects: 0,
  tasks: 0
})

const isLoading = ref(true)
const errorMessage = ref('')

// 格式化日期
const formatDate = (dateString?: string) => {
  if (!dateString) return '未设置'
  return new Date(dateString).toLocaleDateString('zh-CN')
}

// 刷新数据
async function refreshData() {
  await loadAllData()
}

// 重试加载数据
async function retryLoadData() {
  errorMessage.value = ''
  await loadAllData()
}

// 加载用户数据
async function loadUsers() {
  try {
    const data = await UserService.getUsers()
    users.value = data || []
    stats.value.users = users.value.length
  } catch (error) {
    console.error('加载用户数据失败:', error)
    users.value = []
  }
}

// 加载项目数据
async function loadProjects() {
  try {
    // 这里使用一个默认用户ID，实际应用中应该使用当前登录用户的ID
    const data = await ProjectService.getProjects(1)
    projects.value = data || []
    stats.value.projects = projects.value.length
  } catch (error) {
    console.error('加载项目数据失败:', error)
    projects.value = []
  }
}

// 加载任务数据
async function loadTasks() {
  try {
    // 这里使用一个默认用户ID
    const data = await TaskService.getTasks(1)
    tasks.value = data || []
    stats.value.tasks = tasks.value.length
  } catch (error) {
    console.error('加载任务数据失败:', error)
    tasks.value = []
  }
}

// 加载AI对话记录
async function loadChatHistory() {
  try {
    // 这里使用一个默认用户ID
    const data = await ChatService.getChatHistory(1)
    chatHistory.value = data || []
  } catch (error) {
    console.error('加载AI对话记录失败:', error)
    chatHistory.value = []
  }
}

// 加载组织数据（用于统计）
async function loadOrganizations() {
  try {
    // 这里使用一个默认用户ID
    const data = await OrganizationService.getOrganizations(1)
    stats.value.organizations = data?.length || 0
  } catch (error) {
    console.error('加载组织数据失败:', error)
  }
}

// 加载所有数据
async function loadAllData() {
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    // 并行加载所有数据
    await Promise.all([
      loadUsers(),
      loadProjects(),
      loadTasks(),
      loadChatHistory(),
      loadOrganizations()
    ])
    
    console.log('🎉 数据加载完成:', {
      用户数量: users.value.length,
      项目数量: projects.value.length,
      任务数量: tasks.value.length,
      对话记录: chatHistory.value.length
    })
    
  } catch (error: any) {
    console.error('❌ 加载数据失败:', error)
    
    if (error?.code === 'PGRST116' || error?.message?.includes('does not exist')) {
      errorMessage.value = '数据库表不存在，请先执行数据库初始化脚本'
    } else if (error?.message?.includes('JWT')) {
      errorMessage.value = '认证令牌失效，请重新登录'
    } else if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
      errorMessage.value = '网络连接失败，请检查网络设置'
    } else {
      errorMessage.value = `数据加载失败: ${error.message}`
    }
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await loadAllData()
})
</script>

<style scoped>
.card {
  @apply bg-white rounded-lg shadow-sm border border-gray-200;
}

.btn {
  @apply px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center;
}

.btn-outline {
  @apply border border-gray-300 text-gray-700 hover:bg-gray-50;
}
</style>