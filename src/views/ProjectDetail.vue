<template>
  <div class="min-h-screen">
    <!-- 导航栏 -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center space-x-4">
            <RouterLink :to="`/organizations/${project?.organization_id}`" class="text-gray-600 hover:text-gray-900">
              ← 返回组织
            </RouterLink>
            <h1 class="text-xl font-semibold text-gray-900">{{ project?.name }}</h1>
            <span :class="statusClass(project?.status)" class="px-2 py-1 rounded-full text-xs">
              {{ statusText(project?.status) }}
            </span>
          </div>
          <div class="flex items-center space-x-4">
            <button @click="showEditModal = true" class="btn btn-secondary">
              编辑项目
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主内容 -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- 项目信息 -->
        <div class="card p-6 mb-6">
          <h2 class="text-lg font-semibold mb-2">项目信息</h2>
          <p class="text-gray-600 mb-4">{{ project?.description || '暂无描述' }}</p>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span class="text-gray-500">创建时间:</span>
              <p class="font-medium">{{ formatDate(project?.created_at) }}</p>
            </div>
            <div>
              <span class="text-gray-500">更新时间:</span>
              <p class="font-medium">{{ formatDate(project?.updated_at) }}</p>
            </div>
            <div>
              <span class="text-gray-500">任务总数:</span>
              <p class="font-medium">{{ taskStats.total }}</p>
            </div>
            <div>
              <span class="text-gray-500">完成率:</span>
              <p class="font-medium">{{ taskStats.completionRate }}%</p>
            </div>
          </div>
        </div>

        <!-- 项目概览 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div class="card p-6">
            <h3 class="text-lg font-semibold mb-2">待办任务</h3>
            <p class="text-3xl font-bold text-orange-600">{{ taskStats.pending }}</p>
          </div>
          <div class="card p-6">
            <h3 class="text-lg font-semibold mb-2">进行中</h3>
            <p class="text-3xl font-bold text-blue-600">{{ taskStats.inProgress }}</p>
          </div>
          <div class="card p-6">
            <h3 class="text-lg font-semibold mb-2">已完成</h3>
            <p class="text-3xl font-bold text-green-600">{{ taskStats.completed }}</p>
          </div>
        </div>

        <!-- AI分析建议 -->
        <div class="card p-6 mb-6">
          <h2 class="text-lg font-semibold mb-4">AI分析建议</h2>
          <div class="space-y-3">
            <div v-for="suggestion in aiSuggestions" :key="suggestion.id" class="p-3 bg-gray-50 rounded-lg">
              <p class="text-sm text-gray-700">{{ suggestion.message }}</p>
            </div>
          </div>
        </div>

        <!-- 快速操作 -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold mb-4">快速操作</h2>
          <div class="flex flex-wrap gap-4">
            <button @click="showAIChat" class="btn btn-primary">
              咨询AI助手
            </button>
            <button @click="generateReport" class="btn btn-secondary">
              生成项目报告
            </button>
            <button @click="manageTasks" class="btn btn-secondary">
              管理任务
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- 编辑项目模态框 -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <h3 class="text-lg font-semibold mb-4">编辑项目</h3>
        
        <form @submit.prevent="updateProject">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">项目名称</label>
              <input
                v-model="editProject.name"
                type="text"
                required
                class="input"
                placeholder="请输入项目名称"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">项目描述</label>
              <textarea
                v-model="editProject.description"
                class="input resize-none"
                rows="3"
                placeholder="请输入项目描述"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">项目状态</label>
              <select v-model="editProject.status" class="input">
                <option value="active">活跃</option>
                <option value="paused">暂停</option>
                <option value="completed">已完成</option>
                <option value="archived">已归档</option>
              </select>
            </div>
          </div>

          <div v-if="editError" class="text-red-600 text-sm mt-2">
            {{ editError }}
          </div>

          <div class="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              @click="showEditModal = false"
              class="btn btn-secondary"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="isUpdating"
              class="btn btn-primary"
            >
              {{ isUpdating ? '更新中...' : '更新' }}
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
import { useProjectStore } from '@/stores/project'

const route = useRoute()
const projectStore = useProjectStore()

const project = ref()
const isLoading = ref(true)
const showEditModal = ref(false)
const isUpdating = ref(false)
const editError = ref('')

const taskStats = reactive({
  total: 0,
  pending: 0,
  inProgress: 0,
  completed: 0,
  completionRate: 0
})

const aiSuggestions = ref([
  { id: 1, message: '项目进度良好，建议继续保持当前节奏' },
  { id: 2, message: '检测到2个任务即将到期，建议优先处理' },
  { id: 3, message: '团队成员工作负荷均衡，效率较高' }
])

const editProject = reactive({
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

function showAIChat() {
  console.log('打开AI聊天助手')
}

function generateReport() {
  console.log('生成项目报告')
}

function manageTasks() {
  console.log('管理任务')
}

async function updateProject() {
  if (!editProject.name.trim()) {
    editError.value = '请输入项目名称'
    return
  }

  isUpdating.value = true
  editError.value = ''

  try {
    await projectStore.updateProject(route.params.id as string, editProject)
    showEditModal.value = false
  } catch (error: any) {
    editError.value = error.message || '更新项目失败'
  } finally {
    isUpdating.value = false
  }
}

onMounted(async () => {
  const projectId = route.params.id as string
  
  try {
    const response = await projectStore.fetchProjectById(projectId)
    if (response.success) {
      project.value = projectStore.currentProject
      
      // 初始化编辑表单
      editProject.name = project.value.name
      editProject.description = project.value.description || ''
      editProject.status = project.value.status
      
      // 模拟任务统计数据
      taskStats.total = 15
      taskStats.pending = 3
      taskStats.inProgress = 5
      taskStats.completed = 7
      taskStats.completionRate = Math.round((taskStats.completed / taskStats.total) * 100)
    }
  } catch (error) {
    console.error('Error loading project detail:', error)
  } finally {
    isLoading.value = false
  }
})
</script>