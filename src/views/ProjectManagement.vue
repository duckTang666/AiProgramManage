<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 导航栏 -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center space-x-8">
            <RouterLink to="/" class="text-gray-600 hover:text-gray-900">
              ← 返回工作台
            </RouterLink>
            <h1 class="text-xl font-semibold text-gray-900">项目管理</h1>
          </div>
          <div class="flex items-center space-x-4">
            <button @click="showCreateModal = true" class="btn btn-primary">
              创建新项目
            </button>
            <button @click="logout" class="btn btn-outline text-sm">
              退出登录
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主内容 -->
    <main class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <!-- 项目概览 -->
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">项目概览</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="card p-6 text-center">
            <div class="text-3xl font-bold text-blue-600 mb-2">{{ projects.length }}</div>
            <div class="text-sm text-gray-600">总项目数</div>
          </div>
          <div class="card p-6 text-center">
            <div class="text-3xl font-bold text-green-600 mb-2">
              {{ projects.filter(p => p.status === 'active').length }}
            </div>
            <div class="text-sm text-gray-600">进行中</div>
          </div>
          <div class="card p-6 text-center">
            <div class="text-3xl font-bold text-orange-600 mb-2">
              {{ tasks.filter(t => t.status === 'todo' || t.status === 'in_progress').length }}
            </div>
            <div class="text-sm text-gray-600">待办任务</div>
          </div>
        </div>
      </div>

      <!-- 项目列表 -->
      <div class="mb-8">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-900">项目列表</h2>
          <div class="text-sm text-gray-600">
            共 {{ projects.length }} 个项目
          </div>
        </div>
        
        <div v-if="isLoading" class="text-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-2 text-sm text-gray-600">加载中...</p>
        </div>
        
        <div v-else-if="projects.length === 0" class="card p-8 text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">暂无项目</h3>
          <p class="mt-1 text-sm text-gray-500">创建您的第一个项目开始管理任务</p>
          <div class="mt-6">
            <button @click="showCreateModal = true" class="btn btn-primary">
              创建项目
            </button>
          </div>
        </div>
        
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="project in projects" 
            :key="project.id"
            class="card p-6 hover:shadow-md transition-shadow cursor-pointer"
            @click="$router.push(`/projects/${project.id}`)"
          >
            <div class="flex justify-between items-start mb-3">
              <h3 class="text-lg font-semibold text-gray-900">{{ project.name }}</h3>
              <span :class="[
                'px-2 py-1 rounded-full text-xs font-medium',
                project.status === 'active' ? 'bg-green-100 text-green-800' :
                project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              ]">
                {{ project.status === 'active' ? '进行中' : project.status === 'completed' ? '已完成' : '规划中' }}
              </span>
            </div>
            <p class="text-sm text-gray-600 mb-4">{{ project.description || '暂无描述' }}</p>
            <div class="flex justify-between items-center text-xs text-gray-500">
              <span>进度: {{ project.progress_percentage || 0 }}%</span>
              <span>{{ new Date(project.created_at).toLocaleDateString('zh-CN') }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 任务列表 -->
      <div class="mb-8">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-900">最近任务</h2>
          <button @click="addTask" class="btn btn-outline text-sm">
            创建任务
          </button>
        </div>
        
        <div v-if="tasks.length === 0" class="card p-6 text-center text-gray-500">
          <p>暂无任务数据</p>
        </div>
        
        <div v-else class="space-y-3">
          <div 
            v-for="task in tasks.slice(0, 5)" 
            :key="task.id"
            class="card p-4 hover:shadow-md transition-shadow"
          >
            <div class="flex justify-between items-start">
              <h4 class="font-medium text-gray-900">{{ task.title }}</h4>
              <span :class="[
                'px-2 py-1 rounded-full text-xs font-medium',
                task.status === 'completed' ? 'bg-green-100 text-green-800' :
                task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              ]">
                {{ task.status === 'completed' ? '已完成' : task.status === 'in_progress' ? '进行中' : '待办' }}
              </span>
            </div>
            <div class="flex justify-between items-center mt-2 text-xs text-gray-500">
              <span>负责人: {{ task.assignee?.display_name || '未分配' }}</span>
              <span v-if="task.due_date">{{ new Date(task.due_date).toLocaleDateString('zh-CN') }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- AI建议 -->
      <div class="card p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">AI建议</h2>
        <div class="space-y-3">
          <div v-for="suggestion in suggestions" :key="suggestion.text" class="p-3 bg-blue-50 rounded-lg">
            <p class="text-sm text-blue-700">{{ suggestion.text }}</p>
          </div>
        </div>
      </div>
    </main>

    <!-- 创建项目模态框 -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <h3 class="text-lg font-semibold mb-4">创建新项目</h3>
        
        <form @submit.prevent="createProject">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">项目名称</label>
              <input
                v-model="newProject.name"
                type="text"
                required
                class="input"
                placeholder="请输入项目名称"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">项目描述</label>
              <textarea
                v-model="newProject.description"
                class="input resize-none"
                rows="3"
                placeholder="请输入项目描述（可选）"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">所属组织</label>
              <select
                v-model="newProject.organization_id"
                required
                class="input"
              >
                <option value="">请选择组织</option>
                <option 
                  v-for="org in organizationStore.organizations" 
                  :key="org.id" 
                  :value="org.id"
                >
                  {{ org.name }}
                </option>
              </select>
            </div>
          </div>

          <div v-if="createError" class="text-red-600 text-sm mt-2">
            {{ createError }}
          </div>

          <div class="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              @click="showCreateModal = false"
              class="btn btn-secondary"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="isCreating"
              class="btn btn-primary"
            >
              {{ isCreating ? '创建中...' : '创建' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- AI聊天助手 -->
    <div class="fixed bottom-6 right-6 z-50">
      <button
        @click="openChat"
        class="w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 flex items-center justify-center"
      >
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
        </svg>
      </button>
    </div>

    <!-- AI聊天对话框 -->
    <div v-if="showChat" class="fixed bottom-6 right-6 z-50 w-96 h-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col">
      <!-- 标题栏 -->
      <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <div class="flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
          <span class="font-semibold">AI助手</span>
        </div>
        <button @click="closeChat" class="text-white hover:text-gray-200">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- 消息区域 -->
      <div class="flex-1 p-4 overflow-y-auto bg-gray-50">
        <div v-for="message in chatMessages" :key="message.id" class="mb-4">
          <div v-if="!message.isUser" class="flex items-start space-x-2">
            <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
            </div>
            <div class="bg-white p-3 rounded-lg shadow-sm border border-gray-200 max-w-xs">
              <p class="text-sm text-gray-800">{{ message.text }}</p>
            </div>
          </div>
          
          <div v-else class="flex items-start space-x-2 justify-end">
            <div class="bg-blue-100 p-3 rounded-lg shadow-sm border border-blue-200 max-w-xs">
              <p class="text-sm text-blue-800">{{ message.text }}</p>
            </div>
            <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="p-4 border-t border-gray-200">
        <div class="flex space-x-2">
          <input
            v-model="newMessage"
            @keyup.enter="sendMessage"
            type="text"
            placeholder="输入您的问题..."
            class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            @click="sendMessage"
            :disabled="!newMessage.trim()"
            class="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            发送
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useOrganizationStore } from '@/stores/organization'
import { useProjectStore } from '@/stores/project'
import { TaskService } from '@/lib/database'

const router = useRouter()
const authStore = useAuthStore()
const organizationStore = useOrganizationStore()
const projectStore = useProjectStore()

// 项目数据
const projects = ref<any[]>([])
const tasks = ref<any[]>([])
const isLoading = ref(false)

// AI建议
const suggestions = ref([
  { text: '建议优先处理高优先级任务' },
  { text: '本周项目进度良好，继续保持' },
  { text: '可以考虑增加团队协作功能' }
])

// 创建项目表单
const showCreateModal = ref(false)
const isCreating = ref(false)
const createError = ref('')

const newProject = reactive({
  name: '',
  description: '',
  organization_id: ''
})

// Chat functionality
const showChat = ref(false)
const chatMessages = ref([
  { text: '你好！我是AI助手，有什么可以帮助你的吗？', isUser: false }
])
const newMessage = ref('')

// 加载项目数据
async function loadProjects() {
  isLoading.value = true
  try {
    // 获取当前登录用户
    const authUserId = authStore.user?.id
    if (!authUserId) {
      throw new Error('用户未登录')
    }
    
    // 获取用户记录
    const userRecord = await getUserRecordWithCache()
    if (!userRecord) {
      throw new Error('用户记录不存在')
    }
    
    // 加载用户组织
    await organizationStore.fetchOrganizations(userRecord.id)
    
    // 加载每个组织的项目
    projects.value = []
    for (const org of organizationStore.organizations) {
      await projectStore.fetchProjects(org.id)
      projects.value.push(...projectStore.projects)
    }
    
    // 如果组织为空，直接加载所有项目（降级方案）
    if (projects.value.length === 0) {
      console.log('组织为空，尝试直接加载所有项目...')
      try {
        const { data: allProjects, error } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (!error && allProjects) {
          projects.value = allProjects
        }
      } catch (error) {
        console.error('加载所有项目失败:', error)
      }
    }
    
    // 加载任务数据
    if (projects.value.length > 0) {
      await loadTasks()
    }
    
    console.log(`✅ 成功加载 ${projects.value.length} 个项目`)
    
  } catch (error) {
    console.error('加载项目数据失败:', error)
    // 降级处理：显示空项目列表
    projects.value = []
    tasks.value = []
  } finally {
    isLoading.value = false
  }
}

// 加载任务数据
async function loadTasks() {
  try {
    tasks.value = []
    for (const project of projects.value) {
      const projectTasks = await TaskService.getTasksByProject(project.id)
      tasks.value.push(...projectTasks)
    }
  } catch (error) {
    console.error('加载任务数据失败:', error)
  }
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

// 创建新项目 - 优化版本
async function createProject() {
  if (!newProject.name.trim()) {
    createError.value = '请输入项目名称'
    return
  }

  if (!newProject.organization_id) {
    createError.value = '请选择组织'
    return
  }

  isCreating.value = true
  createError.value = ''

  try {
    // 获取用户记录
    const userRecord = await getUserRecordWithCache()
    
    if (!userRecord) {
      throw new Error('用户记录不存在，请先完善用户信息')
    }

    // 乐观更新：立即在UI中添加项目
    const optimisticProject = {
      id: Date.now(), // 临时ID
      name: newProject.name,
      description: newProject.description,
      organization_id: parseInt(newProject.organization_id),
      owner_id: userRecord.id,
      status: 'active',
      priority: 'medium',
      progress_percentage: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    // 立即更新UI
    projects.value.unshift(optimisticProject)
    
    // 异步创建项目（不阻塞UI）
    const actualProject = await projectStore.createProject({
      name: newProject.name.trim(),
      description: newProject.description?.trim() || '',
      organization_id: parseInt(newProject.organization_id),
      owner_id: userRecord.id
    })
    
    // 替换临时项目为实际项目
    const index = projects.value.findIndex(p => p.id === optimisticProject.id)
    if (index !== -1) {
      projects.value[index] = actualProject
    }
    
    // 关闭模态框并重置表单
    showCreateModal.value = false
    resetForm()
    
    console.log('✅ 项目创建成功')
    
  } catch (error: any) {
    console.error('创建项目失败:', error)
    
    // 回滚乐观更新
    rollbackOptimisticUpdate()
    
    // 提供更友好的错误信息
    if (error.message.includes('项目名称已存在')) {
      createError.value = '项目名称已存在，请使用其他名称'
    } else if (error.message.includes('权限不足')) {
      createError.value = '权限不足，无法创建项目'
    } else if (error.message.includes('指定的组织或负责人不存在')) {
      createError.value = '指定的组织或负责人不存在'
    } else {
      createError.value = error.message || '创建项目失败，请检查网络连接或数据库状态'
    }
  } finally {
    isCreating.value = false
  }
}

// 带缓存的用户记录获取
let userRecordCache: any = null
let cacheTimestamp = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5分钟缓存

async function getUserRecordWithCache() {
  const authUserId = authStore.user?.id
  if (!authUserId) {
    throw new Error('用户未登录')
  }

  // 检查缓存
  const now = Date.now()
  if (userRecordCache && (now - cacheTimestamp) < CACHE_DURATION) {
    console.log('📦 使用缓存的用户记录')
    return userRecordCache
  }

  // 获取用户记录
  const { UserService } = await import('@/lib/database')
  const userRecord = await UserService.getUserByAuthId(authUserId)
  
  // 更新缓存
  userRecordCache = userRecord
  cacheTimestamp = now
  
  return userRecord
}

// 准备项目数据
function prepareProjectData() {
  return {
    name: newProject.name.trim(),
    description: newProject.description?.trim() || '',
    organization_id: parseInt(newProject.organization_id),
    status: 'active',
    priority: 'medium',
    progress_percentage: 0
  }
}

// 重置表单
function resetForm() {
  newProject.name = ''
  newProject.description = ''
  newProject.organization_id = ''
}

// 回滚乐观更新
function rollbackOptimisticUpdate() {
  // 移除最后添加的项目（假设是乐观更新的项目）
  if (projects.value.length > 0) {
    projects.value = projects.value.filter(p => !p.id || p.id > 1000) // 保留真实项目
  }
}

const openChat = () => {
  showChat.value = true
}

const closeChat = () => {
  showChat.value = false
}

const sendMessage = () => {
  if (newMessage.value.trim() === '') return

  // Add user message
  chatMessages.value.push({ text: newMessage.value, isUser: true })

  // Simulate AI response
  setTimeout(() => {
    chatMessages.value.push({ text: '收到你的消息，我会尽快回复你。', isUser: false })
  }, 1000)

  newMessage.value = ''
}

const addTask = () => {
  // 这里应该打开创建任务的模态框
  alert('创建新任务功能待实现')
}

onMounted(async () => {
  await loadProjects()
})
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #F5F5F5;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  background-color: #FFFFFF;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 24px;
  font-weight: bold;
  color: #333333;
  margin: 0;
}

.user-section {
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.user-icon {
  font-size: 24px;
}

.main-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.section-title {
  font-size: 20px;
  font-weight: bold;
  color: #333333;
  margin-bottom: 20px;
}

.dashboard-section {
  background-color: #FFFFFF;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.health-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.progress-ring {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: #E0E0E0;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 16px;
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.status-text {
  font-size: 16px;
  color: #666666;
}

.task-list-section {
  background-color: #FFFFFF;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.add-button {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #007AFF;
  color: white;
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  font-size: 20px;
}

.task-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.task-card {
  padding: 16px;
  border-radius: 8px;
  background-color: #FAFAFA;
  border: 1px solid #EEEEEE;
}

.task-title {
  font-size: 16px;
  color: #333333;
  margin-bottom: 8px;
  margin: 0;
}

.task-meta {
  display: flex;
  justify-content: space-between;
}

.meta-item {
  font-size: 14px;
  color: #999999;
}

.ai-suggestions-section {
  background-color: #FFFFFF;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.suggestion-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.suggestion-card {
  padding: 16px;
  border-radius: 8px;
  background-color: #F0F8FF;
  border: 1px solid #D0E8FF;
}

.suggestion-text {
  font-size: 14px;
  color: #333333;
  margin: 0;
}

.ai-assistant-float {
  position: fixed;
  bottom: 60px;
  right: 60px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #007AFF;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 16px rgba(0, 122, 255, 0.3);
  z-index: 1000;
  cursor: pointer;
  font-size: 24px;
}

.chat-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2000;
}

.chat-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.chat-container {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 70%;
  background-color: white;
  border-radius: 20px 20px 0 0;
  display: flex;
  flex-direction: column;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background-color: #FFFFFF;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 20px 20px 0 0;
}

.chat-title {
  font-size: 18px;
  font-weight: bold;
  color: #333333;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #333;
}

.chat-messages {
  flex: 1;
  padding: 16px;
  background-color: #F9F9F9;
  overflow-y: auto;
}

.message-bubble {
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 16px;
  margin-bottom: 12px;
  background-color: #E5E5EA;
  align-self: flex-start;
}

.user-message {
  background-color: #007AFF;
  color: #FFFFFF;
  align-self: flex-end;
  margin-left: auto;
}

.chat-input-area {
  display: flex;
  padding: 16px;
  background-color: #FFFFFF;
  border-top: 1px solid #EEEEEE;
}

.chat-input {
  flex: 1;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #DDDDDD;
  margin-right: 12px;
}

.send-button {
  padding: 12px 24px;
  background-color: #007AFF;
  color: #FFFFFF;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}

.send-button:hover {
  background-color: #0056CC;
}

@media (min-width: 768px) {
  .chat-container {
    width: 400px;
    height: 500px;
    bottom: 80px;
    right: 20px;
    left: auto;
    border-radius: 12px;
  }
}
</style>