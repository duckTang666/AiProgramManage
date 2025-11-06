<template>
  <div class="min-h-screen">
    <!-- 导航栏 -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center space-x-4">
            <RouterLink to="/organizations" class="text-gray-600 hover:text-gray-900">
              ← 返回组织列表
            </RouterLink>
            <h1 class="text-xl font-semibold text-gray-900">{{ organization?.name }}</h1>
          </div>
          <div class="flex items-center space-x-4">
            <button @click="showCreateProjectModal = true" class="btn btn-primary">
              创建项目
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主内容 -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- 组织信息 -->
        <div class="card p-6 mb-6">
          <h2 class="text-lg font-semibold mb-4">组织信息</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 class="text-md font-medium text-gray-900 mb-2">基本信息</h3>
              <div class="space-y-3">
                <div>
                  <span class="text-sm text-gray-500">组织名称:</span>
                  <p class="font-medium">{{ organization?.name || '未设置' }}</p>
                </div>
                <div>
                  <span class="text-sm text-gray-500">组织描述:</span>
                  <p class="text-gray-700">{{ organization?.description || '暂无描述' }}</p>
                </div>
                <div>
                  <span class="text-sm text-gray-500">组织状态:</span>
                  <p class="font-medium">{{ organization?.is_active ? '活跃' : '已停用' }}</p>
                </div>
              </div>
            </div>
            <div>
              <h3 class="text-md font-medium text-gray-900 mb-2">时间信息</h3>
              <div class="space-y-3">
                <div>
                  <span class="text-sm text-gray-500">创建时间:</span>
                  <p class="font-medium">{{ organization?.created_at ? formatDate(organization.created_at) : '未设置' }}</p>
                </div>
                <div>
                  <span class="text-sm text-gray-500">更新时间:</span>
                  <p class="font-medium">{{ organization?.updated_at ? formatDate(organization.updated_at) : '未设置' }}</p>
                </div>
                <div>
                  <span class="text-sm text-gray-500">项目数量:</span>
                  <p class="font-medium">{{ projects.length }} 个</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 项目列表 -->
        <div>
          <h2 class="text-lg font-semibold mb-4">项目列表</h2>
          
          <div v-if="!isLoading && projects.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              v-for="project in projects" 
              :key="project.id"
              class="card p-6 hover:shadow-md transition-shadow cursor-pointer"
              @click="$router.push(`/projects/${project.id}`)"
            >
              <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ project.name }}</h3>
              <p class="text-gray-600 text-sm mb-4">{{ project.description || '暂无描述' }}</p>
              <div class="flex justify-between items-center">
                <span :class="statusClass(project.status)" class="px-2 py-1 rounded-full text-xs">
                  {{ statusText(project.status) }}
                </span>
                <span class="text-xs text-gray-500">
                  {{ formatDate(project.created_at) }}
                </span>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-else-if="!isLoading" class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">暂无项目</h3>
            <p class="mt-1 text-sm text-gray-500">创建您的第一个项目开始工作</p>
            <div class="mt-6">
              <button @click="showCreateProjectModal = true" class="btn btn-primary">
                创建项目
              </button>
            </div>
          </div>

          <!-- 加载状态 -->
          <div v-else class="text-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p class="mt-2 text-sm text-gray-600">加载中...</p>
          </div>
        </div>
      </div>
    </main>

    <!-- 创建项目模态框 -->
    <div v-if="showCreateProjectModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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
              <label class="block text-sm font-medium text-gray-700 mb-1">项目状态</label>
              <select v-model="newProject.status" class="input">
                <option value="planning">规划中</option>
                <option value="active">活跃</option>
                <option value="completed">已完成</option>
                <option value="cancelled">已取消</option>
              </select>
            </div>
          </div>

          <div v-if="createError" class="text-red-600 text-sm mt-2">
            {{ createError }}
          </div>

          <div class="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              @click="showCreateProjectModal = false"
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useOrganizationStore } from '@/stores/organization'
import { useProjectStore } from '@/stores/project'
import { useAuthStore } from '@/stores/auth'
import { UserService } from '@/lib/database'
import type { Project } from '@/types'

const route = useRoute()
const organizationStore = useOrganizationStore()
const projectStore = useProjectStore()
const authStore = useAuthStore()

const organization = ref()
const projects = ref<Project[]>([])
const isLoading = ref(true)
const showCreateProjectModal = ref(false)
const isCreating = ref(false)
const createError = ref('')

const newProject = reactive({
  name: '',
  description: '',
  status: 'active'
})

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

function statusClass(status: string) {
  const classes = {
    planning: 'bg-gray-100 text-gray-800',
    active: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

function statusText(status: string) {
  const texts = {
    planning: '规划中',
    active: '活跃',
    completed: '已完成',
    cancelled: '已取消'
  }
  return texts[status] || status
}

async function createProject() {
  if (!newProject.name.trim()) {
    createError.value = '请输入项目名称'
    return
  }

  // 检查用户是否已登录
  if (!authStore.user) {
    createError.value = '请先登录后再创建项目'
    return
  }

  isCreating.value = true
  createError.value = ''

  try {
    // 获取当前用户的ID作为项目负责人
    const ownerId = await getCurrentUserId()
    
    await projectStore.createProject({
      ...newProject,
      organization_id: parseInt(route.params.id as string),
      owner_id: ownerId
    })
    showCreateProjectModal.value = false
    newProject.name = ''
    newProject.description = ''
    newProject.status = 'active'
  } catch (error: any) {
    createError.value = error.message || '创建项目失败'
  } finally {
    isCreating.value = false
  }
}

// 获取当前用户的ID
async function getCurrentUserId(): Promise<number> {
  try {
    // 从认证存储中获取当前用户
    if (!authStore.user) {
      throw new Error('用户未登录')
    }
    
    // 首先尝试通过auth_id获取用户记录
    if (authStore.user.id) {
      const userRecord = await UserService.getUserByAuthId(authStore.user.id)
      if (userRecord) {
        return userRecord.id
      }
    }
    
    // 如果通过auth_id找不到，尝试通过邮箱查找
    if (authStore.user.email) {
      const userRecord = await UserService.getUserByEmail(authStore.user.email)
      if (userRecord) {
        return userRecord.id
      }
    }
    
    // 如果用户记录不存在，自动创建用户记录
    if (authStore.user.email && authStore.user.user_metadata?.name) {
      console.log('📝 用户记录不存在，自动创建用户记录')
      const newUser = await UserService.createUser({
        auth_id: authStore.user.id,
        email: authStore.user.email,
        display_name: authStore.user.user_metadata.name || authStore.user.email.split('@')[0],
        role: 'member'
      })
      return newUser.id
    }
    
    throw new Error('用户记录不存在，请先完善个人信息')
  } catch (error) {
    console.error('获取用户ID失败:', error)
    throw new Error('无法获取用户信息，请重新登录')
  }
}

onMounted(async () => {
  const orgId = parseInt(route.params.id as string)
  
  // 检查组织ID是否有效
  if (isNaN(orgId)) {
    console.error('❌ 无效的组织ID:', route.params.id)
    isLoading.value = false
    return
  }
  
  try {
    console.log('🔍 加载组织详情，组织ID:', orgId)
    
    // 加载组织信息
    organization.value = await organizationStore.fetchOrganizationById(orgId)
    console.log('✅ 组织信息加载完成:', organization.value)
    
    if (!organization.value) {
      console.error('❌ 组织不存在，ID:', orgId)
      // 可以在这里添加重定向到组织列表的逻辑
      return
    }
    
    // 加载项目列表
    const result = await projectStore.fetchProjects(orgId)
    if (result.success) {
      projects.value = projectStore.projects
      console.log('✅ 项目列表加载完成，数量:', projects.value.length)
    } else {
      console.error('❌ 加载项目列表失败:', result.error)
      projects.value = []
    }
  } catch (error) {
    console.error('❌ 加载组织详情失败:', error)
  } finally {
    isLoading.value = false
  }
})
</script>