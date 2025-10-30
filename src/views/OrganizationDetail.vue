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
          <h2 class="text-lg font-semibold mb-2">组织信息</h2>
          <p class="text-gray-600 mb-4">{{ organization?.description || '暂无描述' }}</p>
          <div class="text-sm text-gray-500">
            创建于 {{ formatDate(organization?.created_at) }}
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
                <option value="active">活跃</option>
                <option value="paused">暂停</option>
                <option value="completed">已完成</option>
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

const route = useRoute()
const organizationStore = useOrganizationStore()
const projectStore = useProjectStore()

const organization = ref()
const projects = ref([])
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
    active: 'bg-green-100 text-green-800',
    paused: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-blue-100 text-blue-800',
    archived: 'bg-gray-100 text-gray-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

function statusText(status: string) {
  const texts = {
    active: '活跃',
    paused: '暂停',
    completed: '已完成',
    archived: '已归档'
  }
  return texts[status] || status
}

async function createProject() {
  if (!newProject.name.trim()) {
    createError.value = '请输入项目名称'
    return
  }

  isCreating.value = true
  createError.value = ''

  try {
    await projectStore.createProject({
      ...newProject,
      organization_id: route.params.id as string
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

onMounted(async () => {
  const orgId = route.params.id as string
  
  try {
    organization.value = await organizationStore.fetchOrganizationById(orgId)
    const response = await projectStore.fetchProjects(orgId)
    if (response.success) {
      projects.value = projectStore.projects
    }
  } catch (error) {
    console.error('Error loading organization detail:', error)
  } finally {
    isLoading.value = false
  }
})
</script>