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
            <div class="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded">
              当前用户: ID 125
            </div>
            <button @click="loadUser125Organizations" class="btn btn-outline text-sm">
              加载用户125组织
            </button>
            <button @click="loadAllOrganizations" class="btn btn-outline text-sm">
              加载所有组织
            </button>
            <button v-if="showUserInfoBtn" @click="showUserInfoModal = true" class="btn btn-outline text-sm">
              查询用户信息
            </button>
            <button @click="logout" class="btn btn-outline text-sm">
              退出登录
            </button>
            <button @click="showCreateModal = true" class="btn btn-primary">
              创建组织
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主内容 -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <h1 class="text-2xl font-bold text-gray-900 mb-6">组织管理</h1>
        
        <!-- 搜索和过滤区域 -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div class="flex flex-col sm:flex-row gap-4 items-center">
            <!-- 数据状态提示 -->
            <div class="flex items-center space-x-2 text-sm">
              <span class="font-medium text-gray-700">数据源:</span>
              <span :class="organizations && organizations.length > 0 ? 'text-green-600' : 'text-blue-600'" class="font-medium">
                {{ organizations && organizations.length > 0 ? '数据库' : '示例数据' }}
              </span>
              <span class="text-gray-500">({{ filteredOrganizations.length }} 个组织)</span>
            </div>
            
            <!-- 搜索框 -->
            <div class="relative flex-1 min-w-0">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                </svg>
              </div>
              <input
                v-model="searchQuery"
                type="text"
                class="pl-10 pr-10 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="搜索组织名称或描述..."
              />
              <!-- 清除搜索按钮 -->
              <button
                v-if="searchQuery"
                @click="searchQuery = ''"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg class="h-4 w-4 text-gray-400 hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>

            <!-- 状态过滤器 -->
            <div class="flex items-center space-x-2">
              <label class="text-sm font-medium text-gray-700 whitespace-nowrap">状态:</label>
              <select
                v-model="statusFilter"
                class="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">全部</option>
                <option value="active">活跃</option>
                <option value="inactive">已停用</option>
              </select>
            </div>

            <!-- 排序方式 -->
            <div class="flex items-center space-x-2">
              <label class="text-sm font-medium text-gray-700 whitespace-nowrap">排序:</label>
              <select
                v-model="sortBy"
                class="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="created_at">创建时间</option>
                <option value="name">名称</option>
                <option value="project_count">项目数</option>
                <option value="member_count">成员数</option>
              </select>
              <button
                @click="sortOrder = sortOrder === 'desc' ? 'asc' : 'desc'"
                class="p-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg hover:border-gray-400"
                :class="{ 'text-blue-600 border-blue-300': sortOrder === 'asc' }"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path v-if="sortOrder === 'desc'" fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                  <path v-else fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>

            <!-- 清除筛选 -->
            <button
              v-if="hasActiveFilters"
              @click="clearFilters"
              class="text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg px-3 py-2 hover:border-gray-400"
            >
              清除筛选
            </button>
          </div>

          <!-- 搜索结果统计 -->
          <div v-if="hasActiveFilters" class="mt-3 pt-3 border-t border-gray-100">
            <p class="text-sm text-gray-600">
              找到 <span class="font-semibold text-blue-600">{{ filteredOrganizations.length }}</span> 个组织
              <span v-if="searchQuery">（关键词: "{{ searchQuery }}"）</span>
              <span v-if="statusFilter !== 'all'">（状态: {{ statusFilter === 'active' ? '活跃' : '已停用' }}）</span>
            </p>
          </div>
        </div>
        
        <!-- 加载状态 -->
        <div v-if="isLoading" class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p class="mt-2 text-sm text-gray-600">加载中...</p>
        </div>

        <!-- 组织列表 -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- 组织卡片 -->
          <div 
            v-for="org in sortedOrganizations" 
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
        <div v-if="!isLoading && sortedOrganizations.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m2 0v-2m0 2v2M7 21h2m-2 0H5m2 0v-2m0 2v2" />
          </svg>
          
          <!-- 根据是否使用搜索显示不同的提示信息 -->
          <template v-if="hasActiveFilters">
            <h3 class="mt-2 text-sm font-medium text-gray-900">未找到匹配的组织</h3>
            <p class="mt-1 text-sm text-gray-500">
              没有找到与您的搜索条件匹配的组织
              <span v-if="searchQuery">（关键词: "{{ searchQuery }}"）</span>
            </p>
            <div class="mt-6">
              <button @click="clearFilters" class="btn btn-primary mr-2">
                清除搜索条件
              </button>
              <button @click="showCreateModal = true" class="btn btn-secondary">
                创建新组织
              </button>
            </div>
          </template>
          <template v-else>
            <h3 class="mt-2 text-sm font-medium text-gray-900">暂无组织</h3>
            <p class="mt-1 text-sm text-gray-500">创建您的第一个组织开始管理项目</p>
            <div class="mt-6">
              <button @click="showCreateModal = true" class="btn btn-primary">
                创建组织
              </button>
            </div>
          </template>
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

    <!-- 用户信息查询模态框 -->
    <div v-if="showUserInfoModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <h3 class="text-lg font-semibold mb-4">查询用户信息</h3>
        
        <form @submit.prevent="fetchUserInfo">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">查询方式</label>
              <div class="space-y-3">
                <div class="flex items-center">
                  <input type="radio" id="queryByEmail" v-model="queryMethod" value="email" class="mr-2">
                  <label for="queryByEmail" class="text-sm">通过邮箱查询</label>
                </div>
                <div class="flex items-center">
                  <input type="radio" id="queryById" v-model="queryMethod" value="id" class="mr-2">
                  <label for="queryById" class="text-sm">通过用户ID查询 (ID: 125)</label>
                </div>
              </div>
            </div>
            
            <div v-if="queryMethod === 'email'">
              <label class="block text-sm font-medium text-gray-700 mb-1">用户邮箱</label>
              <input
                v-model="userEmail"
                type="email"
                required
                class="input"
                placeholder="请输入用户邮箱"
              />
            </div>
            
            <div v-if="queryMethod === 'id'">
              <label class="block text-sm font-medium text-gray-700 mb-1">用户ID</label>
              <input
                value="125"
                type="text"
                readonly
                class="input bg-gray-100"
              />
            </div>
          </div>

          <div v-if="userInfoError" class="text-red-600 text-sm mt-2">
            {{ userInfoError }}
          </div>

          <!-- 用户信息显示区域 -->
          <div v-if="currentUser" class="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 class="font-semibold text-gray-900 mb-3">用户信息</h4>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">用户ID:</span>
                <span class="font-medium">{{ currentUser.id }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">显示名称:</span>
                <span class="font-medium">{{ currentUser.display_name }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">邮箱:</span>
                <span class="font-medium">{{ currentUser.email }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">角色:</span>
                <span class="font-medium">{{ currentUser.role }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">状态:</span>
                <span :class="currentUser.is_active ? 'text-green-600' : 'text-gray-600'" class="font-medium">
                  {{ currentUser.is_active ? '活跃' : '已停用' }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">创建时间:</span>
                <span class="font-medium">{{ formatDate(currentUser.created_at) }}</span>
              </div>
            </div>
            
            <!-- 加载用户组织按钮 -->
            <div class="mt-4">
              <button 
                @click="loadUserOrganizations" 
                class="btn btn-primary w-full"
                :disabled="!currentUser"
              >
                加载该用户的组织数据
              </button>
            </div>
          </div>

          <div class="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              @click="closeUserInfoModal"
              class="btn btn-secondary"
            >
              关闭
            </button>
            <button
              type="submit"
              :disabled="isFetchingUser"
              class="btn btn-primary"
            >
              {{ isFetchingUser ? '查询中...' : '查询用户' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 按钮样式 */
.btn {
  @apply px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200;
}

.btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none;
}

.btn-secondary {
  @apply bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none;
}

.btn-outline {
  @apply border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:outline-none;
}

.btn-danger {
  @apply bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none;
}

/* 输入框样式 */
.input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors duration-200;
}

/* 卡片样式 */
.card {
  @apply bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200;
}

/* 状态标签 */
.status-badge {
  @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
}

.status-active {
  @apply bg-green-100 text-green-800;
}

.status-inactive {
  @apply bg-gray-100 text-gray-800;
}

/* 自定义动画 */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useOrganizationStore } from '@/stores/organization'
import { UserService, OrganizationService } from '@/lib/database'
import { supabase } from '@/lib/supabase'

const router = useRouter()
const authStore = useAuthStore()
const organizationStore = useOrganizationStore()
const { organizations, isLoading } = organizationStore

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteConfirm = ref(false)
const showUserInfoModal = ref(false)
const isCreating = ref(false)
const isEditing = ref(false)
const isDeleting = ref(false)
const isFetchingUser = ref(false)
const createError = ref('')
const editError = ref('')
const deleteError = ref('')
const userInfoError = ref('')
const activeMenu = ref<number | null>(null)

// 用户信息相关变量
const userEmail = ref('')
const queryMethod = ref<'email' | 'id'>('email')
const currentUser = ref<any>(null)
const userInfo = ref({
  id: null as number | null,
  display_name: '',
  email: '',
  role: '',
  is_active: false,
  created_at: ''
})

// 新增组织相关变量
const showUserInfoBtn = ref(true) // 控制用户信息按钮显示

// 搜索和过滤相关变量
const searchQuery = ref('')
const statusFilter = ref('all') // 'all', 'active', 'inactive'
const sortBy = ref('created_at') // 'created_at', 'name', 'project_count', 'member_count'
const sortOrder = ref('desc') // 'asc', 'desc'

// 计算属性：过滤后的组织列表
const filteredOrganizations = computed(() => {
  // 确保organizations.value是数组，如果为undefined则使用空数组
  let filtered = organizations.value || []

  // 根据搜索关键词过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(org => 
      org.name.toLowerCase().includes(query) ||
      (org.description && org.description.toLowerCase().includes(query))
    )
  }

  // 根据状态过滤
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(org => 
      statusFilter.value === 'active' ? org.is_active : !org.is_active
    )
  }

  return filtered
})

// 计算属性：排序后的组织列表
const sortedOrganizations = computed(() => {
  const filtered = filteredOrganizations.value

  if (!filtered || filtered.length === 0) return []

  // 创建排序副本
  const sorted = [...filtered]

  // 根据选择的排序字段和顺序进行排序
  sorted.sort((a, b) => {
    let valueA: any, valueB: any

    switch (sortBy.value) {
      case 'name':
        valueA = a.name.toLowerCase()
        valueB = b.name.toLowerCase()
        break
      case 'project_count':
        valueA = a.project_count || 0
        valueB = b.project_count || 0
        break
      case 'member_count':
        valueA = a.member_count || 1
        valueB = b.member_count || 1
        break
      case 'created_at':
      default:
        valueA = new Date(a.created_at).getTime()
        valueB = new Date(b.created_at).getTime()
        break
    }

    // 根据排序顺序调整比较结果
    if (valueA < valueB) {
      return sortOrder.value === 'desc' ? 1 : -1
    }
    if (valueA > valueB) {
      return sortOrder.value === 'desc' ? -1 : 1
    }
    return 0
  })

  return sorted
})

// 计算属性：是否有活跃的筛选条件
const hasActiveFilters = computed(() => {
  return searchQuery.value !== '' || statusFilter.value !== 'all'
})

// 清除所有筛选条件
function clearFilters() {
  searchQuery.value = ''
  statusFilter.value = 'all'
  sortBy.value = 'created_at'
  sortOrder.value = 'desc'
}

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

// 加载所有组织数据
async function loadAllOrganizations() {
  try {
    console.log('🔄 开始加载所有组织数据...')
    await organizationStore.fetchAllOrganizations()
    console.log('✅ 所有组织数据加载完成，数量:', organizationStore.organizations ? organizationStore.organizations.length : 0)
  } catch (error) {
    console.error('❌ 加载所有组织数据失败:', error)
  }
}

// 创建组织
async function createOrganization() {
  if (!newOrg.name.trim()) {
    createError.value = '组织名称不能为空'
    return
  }

  isCreating.value = true
  createError.value = ''

  try {
    await organizationStore.createOrganization({
      name: newOrg.name.trim(),
      description: newOrg.description.trim(),
      owner_id: 125 // 使用固定的用户ID
    })

    // 重置表单
    newOrg.name = ''
    newOrg.description = ''
    showCreateModal.value = false

    // 显示成功消息
    console.log('✅ 组织创建成功')
  } catch (error: any) {
    createError.value = error.message || '创建组织失败'
    console.error('❌ 创建组织失败:', error)
  } finally {
    isCreating.value = false
  }
}

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
    await organizationStore.fetchOrganizations(125)
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
    await organizationStore.fetchOrganizations(125)
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
    await organizationStore.fetchOrganizations(125)
  } catch (error: any) {
    console.error('❌ 删除组织失败:', error)
    deleteError.value = error.message || '删除组织失败，请检查网络连接'
  } finally {
    isDeleting.value = false
  }
}

// 跳转到组织详情页面
function goToOrganizationDetail(orgId: number) {
  console.log('🔍 跳转到组织详情，组织ID:', orgId)
  
  // 验证组织ID是否有效
  if (!orgId || isNaN(orgId)) {
    console.error('❌ 无效的组织ID:', orgId)
    // 显示错误提示
    globalError.value = '无效的组织ID，无法跳转到详情页面'
    return
  }
  
  try {
    // 查找对应的组织信息，确保组织存在
    const org = organizations.value?.find(o => o.id === orgId)
    if (!org) {
      console.warn('⚠️ 组织不在当前列表中，但仍尝试跳转，组织ID:', orgId)
      // 可以尝试从数据库加载，但这里先直接跳转
    }
    
    // 使用导航守卫确保路由参数正确传递
    router.push({
      name: 'organization-detail',
      params: { 
        id: orgId.toString() 
      }
    })
    
  } catch (error) {
    console.error('❌ 跳转到组织详情失败:', error)
    globalError.value = '跳转到组织详情失败，请稍后重试'
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
const handleDocumentClick = () => {
  activeMenu.value = null
}

// 页面加载时自动加载组织数据
onMounted(async () => {
  document.addEventListener('click', handleDocumentClick)
  
  try {
    // 检查认证状态
    if (!authStore.isAuthenticated) {
      console.warn('用户未认证，跳转到登录页面')
      router.push('/login')
      return
    }
    
    console.log('🚀 页面加载，开始加载组织数据...')
    
    // 首先尝试直接加载所有组织数据
    try {
      console.log('🔄 尝试直接加载所有组织数据...')
      await loadAllOrganizationsDirect()
      
      // 如果直接加载没有数据，再尝试使用store加载
      if (!organizations.value || organizations.value.length === 0) {
        console.log('🔄 直接加载无数据，尝试使用store加载...')
        await organizationStore.fetchAllOrganizations()
      }
      
      console.log('✅ 组织数据加载完成，数量:', organizations.value.length)
    } catch (error) {
      console.error('❌ 加载组织数据失败:', error)
    }
    
    // 检查是否有数据，如果没有则显示空状态
    if (!organizations.value || organizations.value.length === 0) {
      console.log('📊 数据库中没有组织数据，将显示空状态')
      // 确保使用空数组而不是示例数据
      organizations.value = []
    } else {
      console.log('✅ 组织数据加载成功，数量:', organizations.value.length)
    }
    
  } catch (error) {
    console.error('❌ 加载组织数据失败:', error)
    console.log('📊 将显示空列表作为替代')
    // 出错时使用空数组，而不是示例数据
    organizations.value = []
  }
})

// 清理事件监听器
onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick)
})

// 格式化日期
function formatDate(dateString: string) {
  try {
    if (!dateString) return '--'
    const date = new Date(dateString)
    return isNaN(date.getTime()) ? '--' : date.toLocaleDateString('zh-CN')
  } catch (error) {
    console.error('❌ 日期格式化错误:', error, '日期字符串:', dateString)
    return '--'
  }
}

// 直接加载用户ID 125的组织数据
async function loadUser125Organizations() {
  try {
    console.log('🔄 开始加载用户ID 125的组织数据')
    await organizationStore.fetchOrganizations(125)
    console.log('✅ 用户ID 125的组织数据加载完成')
  } catch (error: any) {
    console.error('❌ 加载用户ID 125的组织数据失败:', error)
    // 出错时仍然显示友好提示
  }
}

// 直接加载所有组织数据（跳过Store）
async function loadAllOrganizationsDirect() {
  try {
    console.log('🔄 开始直接加载所有组织数据')
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ 直接查询组织数据失败:', error)
      return
    }
    
    if (data && data.length > 0) {
      console.log(`✅ 直接查询到 ${data.length} 条组织数据`)
      
      // 为每个组织统计实际的项目数量
      const organizationsWithProjectCount = await Promise.all(
        data.map(async (org) => {
          // 查询该组织下的项目数量
          const { data: projects, error: projectsError } = await supabase
            .from('projects')
            .select('id', { count: 'exact' })
            .eq('organization_id', org.id)
          
          let actualProjectCount = 0
          if (!projectsError && projects) {
            actualProjectCount = projects.length
          } else {
            // 如果查询失败，使用数据库中的字段值
            actualProjectCount = org.project_count || 0
          }
          
          return {
            id: org.id,
            name: org.name,
            description: org.description || '暂无描述',
            project_count: actualProjectCount,
            member_count: org.member_count || 0,
            is_active: org.is_active ?? true,
            created_at: org.created_at,
            updated_at: org.updated_at
          }
        })
      )
      
      organizations.value = organizationsWithProjectCount
      console.log(`✅ 组织数据加载完成，包含项目数量统计`)
    } else {
      console.log('📊 数据库中暂无组织数据')
      organizations.value = []
    }
  } catch (error) {
    console.error('❌ 直接加载组织数据失败:', error)
  }
}

// 查询用户信息
async function fetchUserInfo() {
  isFetchingUser.value = true
  userInfoError.value = ''
  currentUser.value = null

  try {
    let userData: any = null
    
    if (queryMethod.value === 'email') {
      if (!userEmail.value.trim()) {
        userInfoError.value = '请输入邮箱地址'
        return
      }
      userData = await UserService.getUserByEmail(userEmail.value.trim())
    } else {
      // 使用固定用户ID 125
      userData = await UserService.getUserById(125)
    }
    
    if (!userData) {
      userInfoError.value = '用户不存在'
      return
    }
    
    currentUser.value = userData
    console.log('✅ 用户信息查询成功:', userData)
  } catch (error: any) {
    console.error('❌ 查询用户信息失败:', error)
    userInfoError.value = error.message || '查询用户信息失败'
  } finally {
    isFetchingUser.value = false
  }
}

// 加载用户组织数据
async function loadUserOrganizations() {
  if (!currentUser.value) return

  try {
    console.log('🔄 开始加载用户组织数据，用户ID:', currentUser.value.id)
    await organizationStore.fetchOrganizations(currentUser.value.id)
    console.log('✅ 用户组织数据加载完成')
    
    // 关闭用户信息模态框
    closeUserInfoModal()
  } catch (error: any) {
    console.error('❌ 加载用户组织数据失败:', error)
    alert('加载组织数据失败: ' + (error.message || '未知错误'))
  }
}

// 关闭用户信息模态框
function closeUserInfoModal() {
  showUserInfoModal.value = false
  currentUser.value = null
  userEmail.value = ''
  userInfoError.value = ''
}

// 退出登录
function logout() {
  authStore.logout()
  router.push('/login')
}
</script>