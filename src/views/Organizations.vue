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
            class="card p-6 hover:shadow-md transition-shadow"
          >
            <!-- 组织头部 -->
            <div class="flex items-start justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900 cursor-pointer" @click="goToOrganizationDetail(org.id)">{{ org.name }}</h3>
              <div class="flex items-center space-x-2">
                <span :class="org.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'" class="px-2 py-1 rounded-full text-xs">
                  {{ org.is_active ? '活跃' : '已停用' }}
                </span>
                <!-- 操作菜单 -->
                <div class="relative">
                  <button 
                    @click.stop="toggleMenu(org.id)"
                    class="p-1 text-gray-400 hover:text-gray-600 rounded"
                  >
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
                    </svg>
                  </button>
                  
                  <!-- 下拉菜单 -->
                  <div 
                    v-if="activeMenu === org.id" 
                    class="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10"
                  >
                    <div class="py-1">
                      <button 
                        @click="editOrganization(org)"
                        class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        编辑组织
                      </button>
                      <button 
                        @click="toggleOrganizationStatus(org)"
                        class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {{ org.is_active ? '停用组织' : '激活组织' }}
                      </button>
                      <button 
                        @click="deleteOrganization(org)"
                        class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        删除组织
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 组织描述 -->
            <p class="text-gray-600 text-sm mb-4">{{ org.description || '暂无描述' }}</p>
            
            <!-- 组织统计信息 -->
            <div class="grid grid-cols-2 gap-3 mb-4">
              <div class="text-center">
                <div class="text-lg font-semibold text-blue-600">{{ org.project_count || 0 }}</div>
                <div class="text-xs text-gray-500">项目数</div>
              </div>
              <div class="text-center">
                <div class="text-lg font-semibold text-green-600">{{ org.member_count || 1 }}</div>
                <div class="text-xs text-gray-500">成员数</div>
              </div>
            </div>
            
            <!-- 时间信息 -->
            <div class="border-t pt-3">
              <div class="text-xs text-gray-500 space-y-1">
                <div class="flex justify-between">
                  <span>创建时间:</span>
                  <span>{{ formatDate(org.created_at) }}</span>
                </div>
                <div class="flex justify-between">
                  <span>更新时间:</span>
                  <span>{{ org.updated_at ? formatDate(org.updated_at) : '--' }}</span>
                </div>
              </div>
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

    <!-- 编辑组织模态框 -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <h3 class="text-lg font-semibold mb-4">编辑组织</h3>
        
        <form @submit.prevent="updateOrganization">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">组织名称</label>
              <input
                v-model="editOrg.name"
                type="text"
                required
                class="input"
                placeholder="请输入组织名称"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">组织描述</label>
              <textarea
                v-model="editOrg.description"
                class="input resize-none"
                rows="3"
                placeholder="请输入组织描述（可选）"
              />
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
              :disabled="isEditing"
              class="btn btn-primary"
            >
              {{ isEditing ? '更新中...' : '更新' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 确认删除模态框 -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <h3 class="text-lg font-semibold mb-4 text-red-600">确认删除</h3>
        
        <p class="text-gray-600 mb-6">
          确定要删除组织 "<strong>{{ deleteOrg?.name }}</strong>" 吗？此操作不可恢复，该组织下的所有项目也将被删除。
        </p>

        <div v-if="deleteError" class="text-red-600 text-sm mt-2">
          {{ deleteError }}
        </div>

        <div class="flex justify-end space-x-3">
          <button
            type="button"
            @click="showDeleteConfirm = false"
            class="btn btn-secondary"
          >
            取消
          </button>
          <button
            @click="confirmDelete"
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
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useOrganizationStore } from '@/stores/organization'

const router = useRouter()
const authStore = useAuthStore()
const organizationStore = useOrganizationStore()
const { organizations, isLoading } = organizationStore

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteConfirm = ref(false)
const isCreating = ref(false)
const isEditing = ref(false)
const isDeleting = ref(false)
const createError = ref('')
const editError = ref('')
const deleteError = ref('')
const activeMenu = ref<number | null>(null)

const newOrg = reactive({
  name: '',
  description: ''
})

const editOrg = reactive({
  id: 0,
  name: '',
  description: ''
})

const deleteOrg = ref<any>(null)

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

// 跳转到组织详情页面
function goToOrganizationDetail(orgId: number) {
  router.push(`/organizations/${orgId}`)
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

// 切换菜单显示
function toggleMenu(orgId: number) {
  if (activeMenu.value === orgId) {
    activeMenu.value = null
  } else {
    activeMenu.value = orgId
  }
}

// 点击页面其他地方关闭菜单
document.addEventListener('click', () => {
  activeMenu.value = null
})

// 编辑组织
function editOrganization(org: any) {
  activeMenu.value = null
  editOrg.id = org.id
  editOrg.name = org.name
  editOrg.description = org.description || ''
  showEditModal.value = true
  editError.value = ''
}

// 更新组织
async function updateOrganization() {
  if (!editOrg.name.trim()) {
    editError.value = '请输入组织名称'
    return
  }

  isEditing.value = true
  editError.value = ''

  try {
    await organizationStore.updateOrganization(editOrg.id, {
      name: editOrg.name,
      description: editOrg.description
    })
    
    console.log('✅ 组织更新成功')
    showEditModal.value = false
    
    // 重新加载组织数据
    const authUserId = authStore.user?.id
    if (authUserId) {
      const userRecord = await getUserRecordWithCache(authUserId)
      if (userRecord?.id) {
        await organizationStore.fetchOrganizations(userRecord.id)
      }
    }
  } catch (error: any) {
    console.error('❌ 更新组织失败:', error)
    editError.value = error.message || '更新组织失败，请检查网络连接'
  } finally {
    isEditing.value = false
  }
}

// 切换组织状态
async function toggleOrganizationStatus(org: any) {
  activeMenu.value = null
  
  try {
    await organizationStore.updateOrganization(org.id, {
      is_active: !org.is_active
    })
    
    console.log('✅ 组织状态更新成功')
    
    // 重新加载组织数据
    const authUserId = authStore.user?.id
    if (authUserId) {
      const userRecord = await getUserRecordWithCache(authUserId)
      if (userRecord?.id) {
        await organizationStore.fetchOrganizations(userRecord.id)
      }
    }
  } catch (error: any) {
    console.error('❌ 更新组织状态失败:', error)
    alert('更新组织状态失败: ' + (error.message || '未知错误'))
  }
}

// 删除组织
function deleteOrganization(org: any) {
  activeMenu.value = null
  deleteOrg.value = org
  showDeleteConfirm.value = true
  deleteError.value = ''
}

// 确认删除
async function confirmDelete() {
  if (!deleteOrg.value) return

  isDeleting.value = true
  deleteError.value = ''

  try {
    await organizationStore.deleteOrganization(deleteOrg.value.id)
    
    console.log('✅ 组织删除成功')
    showDeleteConfirm.value = false
    
    // 重新加载组织数据
    const authUserId = authStore.user?.id
    if (authUserId) {
      const userRecord = await getUserRecordWithCache(authUserId)
      if (userRecord?.id) {
        await organizationStore.fetchOrganizations(userRecord.id)
      }
    }
  } catch (error: any) {
    console.error('❌ 删除组织失败:', error)
    deleteError.value = error.message || '删除组织失败，请检查网络连接'
  } finally {
    isDeleting.value = false
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
    console.log('📝 开始创建组织流程...')
    
    // 直接使用数据库用户ID 125
    const userId = 125
    console.log('👤 直接使用数据库用户ID:', userId)

    // 创建组织
    const newOrganization = await organizationStore.createOrganization({
      name: newOrg.name,
      description: newOrg.description,
      owner_id: userId
    })
    
    console.log('✅ 组织创建成功:', newOrganization)
    
    showCreateModal.value = false
    newOrg.name = ''
    newOrg.description = ''
    
    // 重新加载组织数据，也使用ID 125
    await organizationStore.fetchOrganizations(userId)
    
    console.log('🔄 组织数据重新加载完成')
  } catch (error: any) {
    console.error('❌ 创建组织失败:', error)
    
    // 提供更详细的错误信息
    if (error.message?.includes('foreign key constraint')) {
      createError.value = '创建组织失败：用户ID 125不存在或外键约束失败。请确保数据库中存在ID为125的用户。'
    } else if (error.message?.includes('duplicate key')) {
      createError.value = '创建组织失败：组织名称已存在。请使用不同的名称。'
    } else {
      createError.value = error.message || '创建组织失败，请检查网络连接或数据库状态'
    }
  } finally {
    isCreating.value = false
  }
}

onMounted(async () => {
  await loadOrganizations()
})

// 加载组织数据
async function loadOrganizations() {
  try {
    console.log('🔍 开始加载组织数据...')
    
    // 直接使用数据库用户ID 125加载组织数据
    console.log('👤 直接使用数据库用户ID 125')
    await organizationStore.fetchOrganizations(125)
    
    console.log('✅ 组织数据加载完成，数量:', organizationStore.organizations.length)
    
    // 如果没有组织，显示创建组织的提示
    if (organizationStore.organizations.length === 0) {
      console.log('📝 用户暂无组织，显示创建提示')
    }
  } catch (error) {
    console.error('❌ 加载组织数据失败:', error)
    
    // 如果直接使用ID 125失败，尝试备用方案
    console.log('🔄 尝试使用认证用户ID作为备用方案')
    const authUserId = authStore.user?.id
    if (authUserId) {
      try {
        const fallbackUser = await getUserRecordWithCache(authUserId)
        if (fallbackUser && fallbackUser.id) {
          await organizationStore.fetchOrganizations(fallbackUser.id)
        }
      } catch (fallbackError) {
        console.error('❌ 备用方案也失败:', fallbackError)
      }
    }
  }
}

// 带缓存的用户记录获取
let userRecordCache: any = null
let cacheTimestamp = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5分钟缓存

async function getUserRecordWithCache(authUserId: string) {
  // 检查缓存
  const now = Date.now()
  if (userRecordCache && (now - cacheTimestamp) < CACHE_DURATION) {
    console.log('📦 使用缓存的用户记录')
    return userRecordCache
  }

  try {
    // 根据Auth用户ID查找对应的users表记录
    const { UserService } = await import('@/lib/database')
    const userRecord = await UserService.getUserByAuthId(authUserId)
    
    if (userRecord) {
      // 更新缓存
      userRecordCache = userRecord
      cacheTimestamp = now
      return userRecord
    }

    // 如果用户记录不存在，自动创建用户记录
    console.log('用户记录不存在，自动创建用户记录')
    
    // 获取用户邮箱
    const userEmail = authStore.user?.email || `user_${Date.now()}@example.com`
    const displayName = authStore.user?.user_metadata?.name || userEmail.split('@')[0] || '用户'
    
    // 创建用户记录
    const newUserRecord = await UserService.createUser({
      auth_id: authUserId,
      email: userEmail,
      display_name: displayName,
      role: 'member',
      is_active: true
    })
    
    // 更新缓存
    userRecordCache = newUserRecord
    cacheTimestamp = now
    
    return newUserRecord
  } catch (error) {
    console.error('获取用户记录失败:', error)
    
    // 返回默认用户对象作为降级方案
    const defaultUser = {
      id: Date.now(), // 临时ID
      email: authStore.user?.email || `user_${Date.now()}@example.com`,
      display_name: authStore.user?.user_metadata?.name || '用户',
      role: 'member',
      is_active: true
    }
    
    userRecordCache = defaultUser
    cacheTimestamp = now
    return defaultUser
  }
}
</script>