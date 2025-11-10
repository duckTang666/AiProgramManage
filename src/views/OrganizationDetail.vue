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
            <div>
              <h1 class="text-xl font-semibold text-gray-900">{{ organization?.name || '加载中...' }}</h1>
              <p class="text-sm text-gray-500">组织ID: {{ $route.params.id }}</p>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <button @click="showCreateProjectModal = true" class="btn btn-primary" :disabled="!organization">
              创建项目
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主内容 -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- 错误提示 -->
        <div v-if="loadError" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <span class="text-red-800">{{ loadError }}</span>
          </div>
          <button @click="reloadData" class="mt-2 text-red-700 hover:text-red-900 underline text-sm">
            重新加载数据
          </button>
        </div>

        <!-- 组织信息 -->
        <div v-if="organization" class="card p-6 mb-6">
          <h2 class="text-lg font-semibold mb-4">组织信息</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 class="text-md font-medium text-gray-900 mb-2">基本信息</h3>
              <div class="space-y-3">
                <div>
                  <span class="text-sm text-gray-500">组织名称:</span>
                  <p class="font-medium">{{ organization.name }}</p>
                </div>
                <div>
                  <span class="text-sm text-gray-500">组织描述:</span>
                  <p class="text-gray-700">{{ organization.description || '暂无描述' }}</p>
                </div>
                <div>
                  <span class="text-sm text-gray-500">组织状态:</span>
                  <span :class="organization.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'" class="px-2 py-1 rounded-full text-xs">
                    {{ organization.is_active ? '活跃' : '已停用' }}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h3 class="text-md font-medium text-gray-900 mb-2">时间信息</h3>
              <div class="space-y-3">
                <div>
                  <span class="text-sm text-gray-500">创建时间:</span>
                  <p class="font-medium">{{ formatDate(organization.created_at) }}</p>
                </div>
                <div>
                  <span class="text-sm text-gray-500">更新时间:</span>
                  <p class="font-medium">{{ organization.updated_at ? formatDate(organization.updated_at) : '--' }}</p>
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
              class="card p-6 hover:shadow-md transition-shadow"
            >
              <div class="flex justify-between items-start mb-3">
                <h3 
                  class="text-lg font-semibold text-gray-900 cursor-pointer flex-1"
                  @click="goToProjectDetail(project.id)"
                >
                  {{ project.name }}
                </h3>
                <button
                  @click.stop="confirmDeleteProject(project)"
                  class="p-1 text-gray-400 hover:text-red-600 transition-colors ml-2"
                  title="删除项目"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <p 
                class="text-gray-600 text-sm mb-4 cursor-pointer"
                @click="goToProjectDetail(project.id)"
              >
                {{ project.description || '暂无描述' }}
              </p>
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
          <div v-else-if="!isLoading && organization" class="text-center py-12">
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
          <div v-else-if="isLoading" class="text-center py-12">
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

    <!-- 删除项目确认模态框 -->
    <div v-if="showDeleteConfirmModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <div class="flex items-center mb-4">
          <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-3">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900">确认删除</h3>
        </div>
        
        <p class="text-gray-600 mb-6">
          确定要删除项目 <span class="font-semibold text-gray-900">"{{ projectToDelete?.name }}"</span> 吗？
          此操作将删除项目及其所有关联任务，且无法撤销。
        </p>

        <div v-if="deleteError" class="text-red-600 text-sm mb-4 p-3 bg-red-50 rounded-lg">
          {{ deleteError }}
        </div>

        <div class="flex justify-end space-x-3">
          <button
            type="button"
            @click="cancelDelete"
            :disabled="isDeleting"
            class="btn btn-secondary"
          >
            取消
          </button>
          <button
            type="button"
            @click="deleteProject"
            :disabled="isDeleting"
            class="btn btn-danger"
          >
            {{ isDeleting ? '删除中...' : '确认删除' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrganizationStore } from '@/stores/organization'
import { useProjectStore } from '@/stores/project'
import { useAuthStore } from '@/stores/auth'
import { UserService, OrganizationService } from '@/lib/database'
import { MockDataService } from '@/lib/mock-data'
import type { Project, Organization } from '@/types'

const route = useRoute()
const router = useRouter()
const organizationStore = useOrganizationStore()
const projectStore = useProjectStore()
const authStore = useAuthStore()

const organization = ref<Organization | null>(null)
const projects = ref<Project[]>([])
const isLoading = ref(true)
const showCreateProjectModal = ref(false)
const showDeleteConfirmModal = ref(false)
const isCreating = ref(false)
const isDeleting = ref(false)
const createError = ref('')
const deleteError = ref('')
const loadError = ref('')

const projectToDelete = ref<Project | null>(null)

const newProject = reactive({
  name: '',
  description: '',
  status: 'active'
})

// 检查是否启用模拟数据模式
const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true'

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

// 跳转到项目详情
function goToProjectDetail(projectId: number) {
  console.log('🔍 跳转到项目详情，项目ID:', projectId)
  router.push(`/projects/${projectId}`)
}

// 重新加载数据
async function reloadData() {
  loadError.value = ''
  await loadOrganizationData()
}

// 加载组织数据
async function loadOrganizationData() {
  isLoading.value = true
  loadError.value = ''
  
  const orgId = parseInt(route.params.id as string)
  
  // 检查组织ID是否有效
  if (isNaN(orgId) || orgId <= 0) {
    console.error('❌ 无效的组织ID:', route.params.id)
    loadError.value = '无效的组织ID，请检查URL是否正确'
    isLoading.value = false
    
    // 延迟重定向，让用户看到错误信息
    setTimeout(() => {
      router.push('/organizations')
    }, 2000)
    return
  }
  
  try {
    console.log('🔍 开始加载组织详情，组织ID:', orgId)
    
    // 强制使用真实数据库查询，确保和组织列表页面数据一致
    console.log('🔄 从数据库加载组织信息')
    
    // 首先尝试从缓存中获取组织信息（与组织列表页面保持一致）
    const existingOrg = organizationStore.organizations.find(org => org.id === orgId)
    if (existingOrg) {
      console.log('✅ 从缓存中找到组织信息，确保名称一致性')
      organization.value = existingOrg
    } else {
      console.log('🔄 组织信息不在缓存中，从数据库加载')
      organization.value = await organizationStore.fetchOrganizationById(orgId)
    }
    
    if (!organization.value) {
      throw new Error('组织不存在或已被删除')
    }
    
    console.log('✅ 组织信息加载完成:', organization.value)
    
    // 加载项目列表
    await loadProjects(orgId)
    
  } catch (error: any) {
    console.error('❌ 加载组织详情失败:', error)
    
    // 数据库模式下的错误处理
    if (error.message?.includes('PGRST116') || error.message?.includes('Cannot coerce') || error.code === 'PGRST116') {
      loadError.value = `组织ID ${orgId} 不存在，请检查URL是否正确`
    } else if (error.message?.includes('net::ERR_NAME_NOT_RESOLVED') || error.message?.includes('网络连接错误')) {
      loadError.value = '网络连接失败，请检查网络连接或服务器状态'
    } else {
      loadError.value = `加载组织详情失败: ${error.message || '未知错误'}`
    }
    
    // 提供返回链接，不自动重定向
    setTimeout(() => {
      router.push('/organizations')
    }, 3000)
  } finally {
    isLoading.value = false
  }
}

// 加载项目数据
async function loadProjects(orgId: number) {
  try {
    console.log('🔄 开始加载项目列表，组织ID:', orgId)
    
    // 强制使用真实数据库查询，不使用模拟数据
    const result = await projectStore.fetchProjects(orgId)
    if (result.success) {
      projects.value = projectStore.projects
      console.log('✅ 项目列表加载完成，数量:', projects.value.length)
    } else {
      console.warn('⚠️ 加载项目列表失败，将显示空项目列表:', result.error)
      projects.value = []
    }
  } catch (error: any) {
    console.error('❌ 加载项目列表失败:', error)
    projects.value = []
  }
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
    
    // 重新加载项目列表
    await loadProjects(parseInt(route.params.id as string))
    
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
    
    // 首先尝试通过邮箱查找用户记录
    if (authStore.user.email) {
      const userRecord = await UserService.getUserByEmail(authStore.user.email)
      if (userRecord) {
        return userRecord.id
      }
    }
    
    // 如果通过邮箱找不到，尝试通过auth_id查找
    if (authStore.user.id) {
      const userRecord = await UserService.getUserByAuthId(authStore.user.id)
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
  await loadOrganizationData()
})

// 确认删除项目
function confirmDeleteProject(project: Project) {
  projectToDelete.value = project
  deleteError.value = ''
  showDeleteConfirmModal.value = true
}

// 取消删除
function cancelDelete() {
  projectToDelete.value = null
  deleteError.value = ''
  showDeleteConfirmModal.value = false
}

// 删除项目
async function deleteProject() {
  if (!projectToDelete.value) return
  
  isDeleting.value = true
  deleteError.value = ''
  
  try {
    const result = await projectStore.deleteProject(projectToDelete.value.id)
    
    if (result.success) {
      // 从本地列表中移除项目
      projects.value = projects.value.filter(p => p.id !== projectToDelete.value!.id)
      console.log('✅ 项目删除成功:', projectToDelete.value.name)
      
      // 关闭模态框并重置状态
      showDeleteConfirmModal.value = false
      projectToDelete.value = null
    } else {
      deleteError.value = result.error || '删除项目失败'
      console.error('❌ 删除项目失败:', result.error)
    }
  } catch (error: any) {
    deleteError.value = error.message || '删除项目时发生错误'
    console.error('❌ 删除项目时发生错误:', error)
  } finally {
    isDeleting.value = false
  }
}
</script>