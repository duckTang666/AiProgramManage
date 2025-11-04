<template>
  <div class="min-h-screen">
    <!-- 导航栏 -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <RouterLink to="/" class="text-gray-600 hover:text-gray-900">
              ← 返回工作台
            </RouterLink>
          </div>
          <div class="flex items-center space-x-4">
            <button @click="showCreateModal = true" class="btn btn-primary">
              创建组织
            </button>
            <button @click="logout" class="btn btn-outline text-sm">
              退出登录
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主内容 -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <h1 class="text-2xl font-bold text-gray-900 mb-6">组织管理</h1>
        
        <!-- 组织列表 -->
        <div v-if="!isLoading && organizations.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="org in organizations" 
            :key="org.id"
            class="card p-6 hover:shadow-md transition-shadow cursor-pointer"
            @click="$router.push(`/organizations/${org.id}`)"
          >
            <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ org.name }}</h3>
            <p class="text-gray-600 text-sm mb-4">{{ org.description || '暂无描述' }}</p>
            <div class="text-xs text-gray-500">
              创建于 {{ formatDate(org.created_at) }}
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else-if="!isLoading" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m2 0v-2m0 2v2M7 21h2m-2 0H5m2 0v-2m0 2v2" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">暂无组织</h3>
          <p class="mt-1 text-sm text-gray-500">创建您的第一个组织开始管理项目</p>
          <div class="mt-6">
            <button @click="showCreateModal = true" class="btn btn-primary">
              创建组织
            </button>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-else class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p class="mt-2 text-sm text-gray-600">加载中...</p>
        </div>
      </div>
    </main>

    <!-- 创建组织模态框 -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <h3 class="text-lg font-semibold mb-4">创建新组织</h3>
        
        <form @submit.prevent="createOrganization">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">组织名称</label>
              <input
                v-model="newOrg.name"
                type="text"
                required
                class="input"
                placeholder="请输入组织名称"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">组织描述</label>
              <textarea
                v-model="newOrg.description"
                class="input resize-none"
                rows="3"
                placeholder="请输入组织描述（可选）"
              />
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useOrganizationStore } from '@/stores/organization'

const router = useRouter()
const authStore = useAuthStore()
const organizationStore = useOrganizationStore()
const { organizations, isLoading } = organizationStore

const showCreateModal = ref(false)
const isCreating = ref(false)
const createError = ref('')

const newOrg = reactive({
  name: '',
  description: ''
})

function formatDate(dateString: string) {
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

async function createOrganization() {
  if (!newOrg.name.trim()) {
    createError.value = '请输入组织名称'
    return
  }

  isCreating.value = true
  createError.value = ''

  try {
    // 获取当前用户ID
    const { useAuthStore } = await import('@/stores/auth')
    const authStore = useAuthStore()
    const authUserId = authStore.user?.id
    
    if (!authUserId) {
      throw new Error('用户未登录')
    }

    // 根据Auth用户ID查找对应的users表记录
    const { UserService } = await import('@/lib/database')
    const userRecord = await UserService.getUserByAuthId(authUserId)
    
    if (!userRecord) {
      throw new Error('用户记录不存在，请先完善用户信息')
    }

    await organizationStore.createOrganization({
      name: newOrg.name,
      description: newOrg.description,
      owner_id: userRecord.id
    })
    
    showCreateModal.value = false
    newOrg.name = ''
    newOrg.description = ''
    
    // 重新加载组织数据
    await organizationStore.fetchOrganizations(userRecord.id)
  } catch (error: any) {
    console.error('创建组织失败:', error)
    createError.value = error.message || '创建组织失败，请检查网络连接或数据库状态'
  } finally {
    isCreating.value = false
  }
}

onMounted(async () => {
  if (organizations.length === 0) {
    await organizationStore.fetchOrganizations()
  }
})
</script>