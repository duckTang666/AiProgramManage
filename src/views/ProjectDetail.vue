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

        <!-- 成员管理 -->
        <div class="card p-6 mb-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold">团队成员</h2>
            <button @click="showAddMemberModal = true" class="btn btn-primary text-sm">
              添加成员
            </button>
          </div>
          
          <div v-if="memberStore.isLoading" class="text-center py-4">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p class="mt-2 text-sm text-gray-600">加载中...</p>
          </div>
          
          <div v-else-if="memberStore.members.length === 0" class="text-center py-6">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">暂无团队成员</h3>
            <p class="mt-1 text-sm text-gray-500">添加成员开始协作</p>
          </div>
          
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div 
              v-for="member in memberStore.members" 
              :key="member.id"
              class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div class="flex items-center space-x-3 mb-3">
                <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span class="text-blue-600 font-semibold">{{ member.user?.display_name?.charAt(0) || 'U' }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">{{ member.user?.display_name || '未知用户' }}</p>
                  <p class="text-xs text-gray-500 truncate">{{ member.user?.email || '无邮箱' }}</p>
                </div>
              </div>
              
              <div class="flex justify-between items-center">
                <span :class="[
                  'px-2 py-1 rounded-full text-xs font-medium',
                  member.role === 'admin' ? 'bg-red-100 text-red-800' :
                  member.role === 'manager' ? 'bg-purple-100 text-purple-800' :
                  member.role === 'developer' ? 'bg-blue-100 text-blue-800' :
                  member.role === 'designer' ? 'bg-pink-100 text-pink-800' :
                  member.role === 'tester' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'
                ]">
                  {{ memberStore.getRoleDisplayText(member.role) }}
                </span>
                <div class="flex space-x-1">
                  <button 
                    @click="openEditMemberModal(member)"
                    class="text-gray-400 hover:text-blue-600 p-1"
                    title="编辑角色"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button 
                    @click="openAssignTaskModal(member)"
                    class="text-gray-400 hover:text-green-600 p-1"
                    title="分配任务"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </button>
                  <button 
                    v-if="member.role !== 'admin'"
                    @click="removeMember(member.id)"
                    class="text-gray-400 hover:text-red-600 p-1"
                    title="移除成员"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div class="mt-3 text-xs text-gray-500">
                加入时间: {{ formatDate(member.joined_at) }}
              </div>
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
            <button @click="showCreateTaskModal = true" class="btn btn-secondary">
              创建任务
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

    <!-- 添加成员模态框 -->
    <div v-if="showAddMemberModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <h3 class="text-lg font-semibold mb-4">添加成员到项目</h3>
        
        <div v-if="memberStore.availableUsers.length === 0" class="text-center py-4">
          <p class="text-gray-500">没有可添加的成员</p>
        </div>
        
        <div v-else class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">选择成员</label>
            <select v-model="selectedUser" class="input w-full">
              <option value="">请选择成员</option>
              <option v-for="user in memberStore.availableUsers" :key="user.id" :value="user.id">
                {{ user.display_name }} ({{ user.email }})
              </option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">分配角色</label>
            <select v-model="selectedRole" class="input w-full">
              <option value="">请选择角色</option>
              <option v-for="role in memberStore.getRoleOptions()" :key="role.value" :value="role.value">
                {{ role.label }} - {{ role.description }}
              </option>
            </select>
          </div>
        </div>

        <div v-if="addMemberError" class="text-red-600 text-sm mt-2">
          {{ addMemberError }}
        </div>

        <div class="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            @click="showAddMemberModal = false"
            class="btn btn-secondary"
          >
            取消
          </button>
          <button
            type="button"
            @click="addMember"
            :disabled="!selectedUser || !selectedRole || memberStore.isAddingMember"
            class="btn btn-primary"
          >
            {{ memberStore.isAddingMember ? '添加中...' : '添加' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 编辑成员角色模态框 -->
    <div v-if="showEditMemberModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <h3 class="text-lg font-semibold mb-4">编辑成员角色</h3>
        
        <div class="space-y-4">
          <div>
            <p class="text-sm text-gray-600">成员: {{ editingMember?.user?.display_name }}</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">角色</label>
            <select v-model="editingRole" class="input w-full">
              <option value="">请选择角色</option>
              <option v-for="role in memberStore.getRoleOptions()" :key="role.value" :value="role.value">
                {{ role.label }} - {{ role.description }}
              </option>
            </select>
          </div>
        </div>

        <div v-if="editMemberError" class="text-red-600 text-sm mt-2">
          {{ editMemberError }}
        </div>

        <div class="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            @click="showEditMemberModal = false"
            class="btn btn-secondary"
          >
            取消
          </button>
          <button
            type="button"
            @click="updateMemberRole"
            :disabled="!editingRole"
            class="btn btn-primary"
          >
            更新
          </button>
        </div>
      </div>
    </div>

    <!-- 分配任务模态框 -->
    <div v-if="showAssignTaskModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <h3 class="text-lg font-semibold mb-4">分配任务</h3>
        
        <div class="space-y-4">
          <div>
            <p class="text-sm text-gray-600">分配给: {{ assigningMember?.user?.display_name }}</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">任务标题</label>
            <input
              v-model="taskTitle"
              type="text"
              class="input w-full"
              placeholder="请输入任务标题"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">任务描述</label>
            <textarea
              v-model="taskDescription"
              class="input w-full resize-none"
              rows="3"
              placeholder="请输入任务描述"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">优先级</label>
            <select v-model="taskPriority" class="input w-full">
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">截止日期</label>
            <input
              v-model="taskDueDate"
              type="date"
              class="input w-full"
            />
          </div>
        </div>

        <div v-if="assignTaskError" class="text-red-600 text-sm mt-2">
          {{ assignTaskError }}
        </div>

        <div class="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            @click="showAssignTaskModal = false"
            class="btn btn-secondary"
          >
            取消
          </button>
          <button
            type="button"
            @click="assignTask"
            :disabled="!taskTitle.trim() || memberStore.isAssigningTask"
            class="btn btn-primary"
          >
            {{ memberStore.isAssigningTask ? '分配中...' : '分配任务' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 创建任务模态框 -->
    <div v-if="showCreateTaskModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <h3 class="text-lg font-semibold mb-4">创建新任务</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">任务标题</label>
            <input
              v-model="newTaskTitle"
              type="text"
              class="input w-full"
              placeholder="请输入任务标题"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">任务描述</label>
            <textarea
              v-model="newTaskDescription"
              class="input w-full resize-none"
              rows="3"
              placeholder="请输入任务描述"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">分配给</label>
            <select v-model="newTaskAssignee" class="input w-full">
              <option value="">不分配</option>
              <option v-for="member in memberStore.members" :key="member.id" :value="member.user_id">
                {{ member.user?.display_name }}
              </option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">优先级</label>
            <select v-model="newTaskPriority" class="input w-full">
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">截止日期</label>
            <input
              v-model="newTaskDueDate"
              type="date"
              class="input w-full"
            />
          </div>
        </div>

        <div v-if="createTaskError" class="text-red-600 text-sm mt-2">
          {{ createTaskError }}
        </div>

        <div class="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            @click="showCreateTaskModal = false"
            class="btn btn-secondary"
          >
            取消
          </button>
          <button
            type="button"
            @click="createTask"
            :disabled="!newTaskTitle.trim() || memberStore.isAssigningTask"
            class="btn btn-primary"
          >
            {{ memberStore.isAssigningTask ? '创建中...' : '创建任务' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useProjectStore } from '@/stores/project'
import { useProjectMemberStore } from '@/stores/projectMember'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const projectStore = useProjectStore()
const memberStore = useProjectMemberStore()
const authStore = useAuthStore()

const project = ref()
const isLoading = ref(true)
const showEditModal = ref(false)
const isUpdating = ref(false)
const editError = ref('')

// 成员管理相关状态
const showAddMemberModal = ref(false)
const showEditMemberModal = ref(false)
const showAssignTaskModal = ref(false)
const showCreateTaskModal = ref(false)

const selectedUser = ref('')
const selectedRole = ref('')
const editingMember = ref<any>(null)
const editingRole = ref('')
const assigningMember = ref<any>(null)

const addMemberError = ref('')
const editMemberError = ref('')
const assignTaskError = ref('')
const createTaskError = ref('')

// 任务相关状态
const taskTitle = ref('')
const taskDescription = ref('')
const taskPriority = ref('medium')
const taskDueDate = ref('')

const newTaskTitle = ref('')
const newTaskDescription = ref('')
const newTaskAssignee = ref('')
const newTaskPriority = ref('medium')
const newTaskDueDate = ref('')

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

// 成员管理相关函数
function openEditMemberModal(member: any) {
  editingMember.value = member
  editingRole.value = member.role
  showEditMemberModal.value = true
}

function openAssignTaskModal(member: any) {
  assigningMember.value = member
  taskTitle.value = ''
  taskDescription.value = ''
  taskPriority.value = 'medium'
  taskDueDate.value = ''
  assignTaskError.value = ''
  showAssignTaskModal.value = true
}

async function addMember() {
  if (!selectedUser.value || !selectedRole.value) {
    addMemberError.value = '请选择成员和角色'
    return
  }

  addMemberError.value = ''

  try {
    await memberStore.addMemberToProject(
      parseInt(route.params.id as string),
      parseInt(selectedUser.value),
      selectedRole.value
    )
    
    // 重置表单
    selectedUser.value = ''
    selectedRole.value = ''
    showAddMemberModal.value = false
  } catch (error: any) {
    addMemberError.value = error.message || '添加成员失败'
  }
}

async function updateMemberRole() {
  if (!editingMember.value || !editingRole.value) {
    editMemberError.value = '请选择角色'
    return
  }

  editMemberError.value = ''

  try {
    await memberStore.updateMemberRole(editingMember.value.id, editingRole.value)
    
    // 重置表单
    editingMember.value = null
    editingRole.value = ''
    showEditMemberModal.value = false
  } catch (error: any) {
    editMemberError.value = error.message || '更新角色失败'
  }
}

async function removeMember(memberId: number) {
  if (confirm('确定要移除该成员吗？')) {
    try {
      await memberStore.removeMemberFromProject(memberId)
    } catch (error: any) {
      alert('移除成员失败: ' + (error.message || '未知错误'))
    }
  }
}

async function assignTask() {
  if (!taskTitle.value.trim()) {
    assignTaskError.value = '请输入任务标题'
    return
  }

  if (!assigningMember.value) {
    assignTaskError.value = '请选择要分配的成员'
    return
  }

  assignTaskError.value = ''

  try {
    await memberStore.createTaskWithAssignment({
      title: taskTitle.value,
      description: taskDescription.value,
      project_id: parseInt(route.params.id as string),
      assignee_id: assigningMember.value.user_id,
      reporter_id: authStore.user?.id || 0,
      status: 'todo',
      priority: taskPriority.value,
      due_date: taskDueDate.value || undefined
    })
    
    // 重置表单
    taskTitle.value = ''
    taskDescription.value = ''
    taskPriority.value = 'medium'
    taskDueDate.value = ''
    assigningMember.value = null
    showAssignTaskModal.value = false
    
    alert('任务分配成功！')
  } catch (error: any) {
    assignTaskError.value = error.message || '分配任务失败'
  }
}

async function createTask() {
  if (!newTaskTitle.value.trim()) {
    createTaskError.value = '请输入任务标题'
    return
  }

  createTaskError.value = ''

  try {
    await memberStore.createTaskWithAssignment({
      title: newTaskTitle.value,
      description: newTaskDescription.value,
      project_id: parseInt(route.params.id as string),
      assignee_id: newTaskAssignee.value ? parseInt(newTaskAssignee.value) : undefined,
      reporter_id: authStore.user?.id || 0,
      status: 'todo',
      priority: newTaskPriority.value,
      due_date: newTaskDueDate.value || undefined
    })
    
    // 重置表单
    newTaskTitle.value = ''
    newTaskDescription.value = ''
    newTaskAssignee.value = ''
    newTaskPriority.value = 'medium'
    newTaskDueDate.value = ''
    showCreateTaskModal.value = false
    
    alert('任务创建成功！')
  } catch (error: any) {
    createTaskError.value = error.message || '创建任务失败'
  }
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
      
      // 加载项目成员
      await memberStore.fetchProjectMembers(parseInt(projectId))
      
      // 如果有组织ID，加载可添加的用户列表
      if (project.value.organization_id) {
        await memberStore.fetchAvailableUsers(project.value.organization_id, parseInt(projectId))
      }
      
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