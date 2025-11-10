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
          <h2 class="text-lg font-semibold mb-4">项目信息</h2>
          <p class="text-gray-600 mb-6">{{ project?.description || '暂无描述' }}</p>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 class="text-md font-medium text-gray-900 mb-3">基本信息</h3>
              <div class="space-y-3">
                <div>
                  <span class="text-sm text-gray-500">项目名称:</span>
                  <p class="font-medium">{{ project?.name || '未设置' }}</p>
                </div>
                <div>
                  <span class="text-sm text-gray-500">项目描述:</span>
                  <p class="text-gray-700">{{ project?.description || '暂无描述' }}</p>
                </div>
                <div>
                  <span class="text-sm text-gray-500">项目状态:</span>
                  <p class="font-medium">{{ statusText(project?.status) }}</p>
                </div>
                <div>
                  <span class="text-sm text-gray-500">项目优先级:</span>
                  <p class="font-medium">{{ getPriorityText(project?.priority) }}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 class="text-md font-medium text-gray-900 mb-3">时间信息</h3>
              <div class="space-y-3">
                <div>
                  <span class="text-sm text-gray-500">创建时间:</span>
                  <p class="font-medium">{{ project?.created_at ? formatDate(project.created_at) : '未设置' }}</p>
                </div>
                <div>
                  <span class="text-sm text-gray-500">更新时间:</span>
                  <p class="font-medium">{{ project?.updated_at ? formatDate(project.updated_at) : '未设置' }}</p>
                </div>
                <div>
                  <span class="text-sm text-gray-500">结束时间:</span>
                  <p class="font-medium">{{ project?.end_date ? formatDate(project.end_date) : '未设置' }}</p>
                </div>
                <div>
                  <span class="text-sm text-gray-500">项目进度:</span>
                  <p class="font-medium">{{ project?.progress_percentage || 0 }}%</p>
                </div>
              </div>
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
            <div class="flex space-x-2">
              <button @click="showAddMemberModal = true" class="btn btn-primary text-sm">
                添加成员
              </button>
              <button 
                v-if="memberStore.members.length === 0" 
                @click="generateSampleTeam" 
                class="btn btn-secondary text-sm"
                :disabled="isGeneratingSample"
              >
                {{ isGeneratingSample ? '生成中...' : '生成示例团队' }}
              </button>
              <button 
                v-if="memberStore.members.length > 0" 
                @click="showTeamStats = !showTeamStats" 
                class="btn btn-outline text-sm"
              >
                {{ showTeamStats ? '隐藏统计' : '显示统计' }}
              </button>
            </div>
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
          
          <div v-if="generateSampleError" class="text-red-600 text-sm mb-4">
            {{ generateSampleError }}
          </div>
          
          <div v-if="generateSampleError" class="text-red-600 text-sm mb-4">
            {{ generateSampleError }}
          </div>
          
          <!-- 团队统计信息 -->
          <div v-if="showTeamStats && memberStore.members.length > 0" class="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 class="text-md font-semibold mb-3">团队统计</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="text-center">
                <div class="text-2xl font-bold text-blue-600">{{ teamStats.total }}</div>
                <div class="text-sm text-gray-600">总人数</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-green-600">{{ teamStats.developers }}</div>
                <div class="text-sm text-gray-600">开发人员</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-purple-600">{{ teamStats.designers }}</div>
                <div class="text-sm text-gray-600">设计师</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-orange-600">{{ teamStats.testers }}</div>
                <div class="text-sm text-gray-600">测试人员</div>
              </div>
            </div>
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

        <!-- 任务列表 -->
        <div class="card p-6 mb-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold">任务列表</h2>
            <div class="flex space-x-2">
              <select v-model="taskFilter" class="input text-sm">
                <option value="all">全部任务</option>
                <option value="todo">待办</option>
                <option value="in_progress">进行中</option>
                <option value="review">审核中</option>
                <option value="done">已完成</option>
                <option value="cancelled">已取消</option>
              </select>
              <button @click="showCreateTaskModal = true" class="btn btn-primary text-sm">
                创建任务
              </button>
            </div>
          </div>
          
          <div v-if="tasksLoading" class="text-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p class="mt-2 text-sm text-gray-600">加载任务中...</p>
          </div>
          
          <div v-else-if="filteredTasks.length === 0" class="text-center py-8">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">暂无任务</h3>
            <p class="mt-1 text-sm text-gray-500">创建第一个任务开始工作</p>
            <button @click="showCreateTaskModal = true" class="mt-4 btn btn-primary">
              创建任务
            </button>
          </div>
          
          <div v-else class="space-y-3">
            <div 
              v-for="task in filteredTasks" 
              :key="task.id"
              class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div class="flex justify-between items-start mb-2">
                <h3 class="font-medium text-gray-900">{{ task.title }}</h3>
                <div class="flex space-x-2">
                  <span :class="[
                    'px-2 py-1 rounded-full text-xs font-medium',
                    task.priority === 'high' ? 'bg-red-100 text-red-800' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  ]">
                    {{ getPriorityText(task.priority) }}
                  </span>
                  <span :class="[
                    'px-2 py-1 rounded-full text-xs font-medium',
                    task.status === 'done' ? 'bg-green-100 text-green-800' :
                    task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    task.status === 'review' ? 'bg-purple-100 text-purple-800' :
                    task.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                    'bg-orange-100 text-orange-800'
                  ]">
                    {{ getStatusText(task.status) }}
                  </span>
                  <button 
                    @click="openEditTaskModal(task)"
                    class="flex items-center space-x-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                    title="编辑任务"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>编辑</span>
                  </button>
                  <button 
                    @click="confirmDeleteTask(task)"
                    class="flex items-center space-x-1 px-2 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                    title="删除任务"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>删除</span>
                  </button>
                </div>
              </div>
              
              <p v-if="task.description" class="text-sm text-gray-600 mb-3 line-clamp-2">
                {{ task.description }}
              </p>
              
              <div class="flex justify-between items-center text-xs text-gray-500">
                <div class="flex items-center space-x-4">
                  <span v-if="task.assignee">
                    负责人: {{ task.assignee.display_name }}
                  </span>
                  <span v-if="task.due_date">
                    截止: {{ formatDate(task.due_date) }}
                  </span>
                </div>
                <span>
                  创建: {{ formatDate(task.created_at) }}
                </span>
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
            <button @click="refreshTasks" class="btn btn-secondary">
              刷新任务
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

    <!-- 删除任务确认模态框 -->
    <div v-if="showDeleteTaskConfirmModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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
          确定要删除任务 <span class="font-semibold text-gray-900">"{{ taskToDelete?.title }}"</span> 吗？
          此操作无法撤销。
        </p>

        <div v-if="deleteTaskError" class="text-red-600 text-sm mb-4 p-3 bg-red-50 rounded-lg">
          {{ deleteTaskError }}
        </div>

        <div class="flex justify-end space-x-3">
          <button
            type="button"
            @click="cancelDeleteTask"
            :disabled="isDeletingTask"
            class="btn btn-secondary"
          >
            取消
          </button>
          <button
            type="button"
            @click="deleteTask"
            :disabled="isDeletingTask"
            class="btn btn-danger"
          >
            {{ isDeletingTask ? '删除中...' : '确认删除' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 删除任务确认模态框 -->
    <div v-if="showDeleteTaskConfirmModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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
          确定要删除任务 <span class="font-semibold text-gray-900">"{{ taskToDelete?.title }}"</span> 吗？
          此操作无法撤销。
        </p>

        <div v-if="deleteTaskError" class="text-red-600 text-sm mb-4 p-3 bg-red-50 rounded-lg">
          {{ deleteTaskError }}
        </div>

        <div class="flex justify-end space-x-3">
          <button
            type="button"
            @click="cancelDeleteTask"
            :disabled="isDeletingTask"
            class="btn btn-secondary"
          >
            取消
          </button>
          <button
            type="button"
            @click="deleteTask"
            :disabled="isDeletingTask"
            class="btn btn-danger"
          >
            {{ isDeletingTask ? '删除中...' : '确认删除' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 编辑任务窗体 -->
    <div v-if="showEditTaskModal" class="fixed inset-0 z-50 overflow-hidden">
      <!-- 背景遮罩 -->
      <div class="absolute inset-0 bg-black bg-opacity-50 transition-opacity" @click="closeEditTaskModal"></div>
      
      <!-- 窗体容器 -->
      <div class="absolute inset-y-0 right-0 max-w-lg w-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
        <!-- 窗体头部 -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-blue-100 rounded-lg">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">编辑任务</h3>
              <p class="text-sm text-gray-500" v-if="editingTask">ID: {{ editingTask.id }}</p>
            </div>
          </div>
          
          <div class="flex items-center space-x-2">
            <button 
              @click="saveTaskChanges" 
              :disabled="!editTaskTitle.trim()" 
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              保存
            </button>
            <button 
              @click="closeEditTaskModal" 
              class="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <!-- 窗体内容 -->
        <div class="p-6 overflow-y-auto" style="height: calc(100vh - 80px)">
          <div class="space-y-6">
            <!-- 基本信息区域 -->
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="text-sm font-semibold text-gray-700 mb-3">基本信息</h4>
              
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">任务标题 *</label>
                  <input 
                    v-model="editTaskTitle" 
                    type="text" 
                    class="input w-full" 
                    placeholder="请输入任务标题"
                    required
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">任务描述</label>
                  <textarea 
                    v-model="editTaskDescription" 
                    class="input w-full resize-none" 
                    rows="4" 
                    placeholder="请输入任务描述"
                  />
                </div>
              </div>
            </div>
            
            <!-- 详细设置区域 -->
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="text-sm font-semibold text-gray-700 mb-3">详细设置</h4>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">负责人</label>
                  <select v-model="editTaskAssignee" class="input w-full">
                    <option value="">不指定负责人</option>
                    <option 
                      v-for="member in memberStore.members" 
                      :key="member.id" 
                      :value="member.user_id"
                    >
                      {{ member.user?.display_name || '未知用户' }}
                    </option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">优先级</label>
                  <select v-model="editTaskPriority" class="input w-full">
                    <option value="low">低</option>
                    <option value="medium">中</option>
                    <option value="high">高</option>
                    <option value="urgent">紧急</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">状态</label>
                  <select v-model="editTaskStatus" class="input w-full">
                    <option value="todo">待办</option>
                    <option value="in_progress">进行中</option>
                    <option value="review">审核中</option>
                    <option value="done">已完成</option>
                    <option value="cancelled">已取消</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">截止日期</label>
                  <input 
                    v-model="editTaskDueDate" 
                    type="date" 
                    class="input w-full" 
                  />
                </div>
              </div>
            </div>
            
            <!-- 任务统计信息 -->
            <div v-if="editingTask" class="bg-gray-50 p-4 rounded-lg">
              <h4 class="text-sm font-semibold text-gray-700 mb-3">任务信息</h4>
              
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="text-gray-500">创建时间:</span>
                  <p class="font-medium">{{ formatDate(editingTask.created_at) }}</p>
                </div>
                <div>
                  <span class="text-gray-500">更新时间:</span>
                  <p class="font-medium">{{ formatDate(editingTask.updated_at) }}</p>
                </div>
                <div>
                  <span class="text-gray-500">报告人:</span>
                  <p class="font-medium">{{ editingTask.reporter?.display_name || '未知' }}</p>
                </div>
                <div>
                  <span class="text-gray-500">项目:</span>
                  <p class="font-medium">{{ project?.name }}</p>
                </div>
              </div>
            </div>
            
            <!-- 错误信息 -->
            <div v-if="editTaskError" class="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div class="flex items-center">
                <svg class="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
                <span class="text-red-700 text-sm">{{ editTaskError }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useProjectStore } from '@/stores/project'
import { useProjectMemberStore } from '@/stores/projectMember'
import { useAuthStore } from '@/stores/auth'
import { TaskService, type Task } from '@/lib/database'

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
const showTeamStats = ref(false)
const isGeneratingSample = ref(false)

const selectedUser = ref('')
const selectedRole = ref('')
const editingMember = ref<any>(null)
const editingRole = ref('')
const assigningMember = ref<any>(null)

const addMemberError = ref('')
const editMemberError = ref('')
const assignTaskError = ref('')
const createTaskError = ref('')
const generateSampleError = ref('')

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

// 任务编辑状态
const showEditTaskModal = ref(false)
const editingTask = ref<Task | null>(null)
const editTaskTitle = ref('')
const editTaskDescription = ref('')
const editTaskAssignee = ref('')
const editTaskPriority = ref('medium')
const editTaskStatus = ref('todo')
const editTaskDueDate = ref('')
const editTaskError = ref('')

// 任务删除状态
const showDeleteTaskConfirmModal = ref(false)
const taskToDelete = ref<Task | null>(null)
const isDeletingTask = ref(false)
const deleteTaskError = ref('')

// 任务相关状态
const tasks = ref<Task[]>([])
const tasksLoading = ref(false)
const taskFilter = ref('all')

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

// 计算过滤后的任务列表
const filteredTasks = computed(() => {
  if (taskFilter.value === 'all') {
    return tasks.value
  }
  return tasks.value.filter(task => task.status === taskFilter.value)
})

// 计算团队统计信息
const teamStats = computed(() => {
  const stats = {
    total: memberStore.members.length,
    managers: memberStore.members.filter(m => m.role === 'manager').length,
    developers: memberStore.members.filter(m => m.role === 'developer').length,
    designers: memberStore.members.filter(m => m.role === 'designer').length,
    testers: memberStore.members.filter(m => m.role === 'tester').length
  }
  return stats
})

const editProject = reactive({
  name: '',
  description: '',
  status: 'active'
})

function formatDate(dateString: string) {
  if (!dateString) return '未设置'
  
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return '无效日期'
  
  return date.toLocaleDateString('zh-CN')
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
    planning: '规划中',
    active: '活跃',
    completed: '已完成',
    cancelled: '已取消',
    paused: '暂停',
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

function getPriorityText(priority: string) {
  const priorityMap: Record<string, string> = {
    'low': '低',
    'medium': '中',
    'high': '高',
    'urgent': '紧急'
  }
  return priorityMap[priority] || priority
}

function getStatusText(status: string) {
  const statusMap: Record<string, string> = {
    'todo': '待办',
    'in_progress': '进行中',
    'review': '审核中',
    'done': '已完成',
    'cancelled': '已取消'
  }
  return statusMap[status] || status
}

function openTaskDetail(task: Task) {
  console.log('打开任务详情:', task)
  // 这里可以添加跳转到任务详情页面的逻辑
  // router.push(`/tasks/${task.id}`)
}

async function fetchTasks() {
  const projectId = parseInt(route.params.id as string)
  
  // 检查projectId是否为有效数字
  if (isNaN(projectId) || projectId <= 0) {
    console.error('❌ 无效的项目ID:', projectId)
    tasksLoading.value = false
    return
  }
  
  tasksLoading.value = true
  
  try {
    console.log('📊 开始获取项目任务，projectId:', projectId)
    
    const taskList = await TaskService.getTasksByProject(projectId)
    tasks.value = taskList
    
    // 更新任务统计
    const stats = await TaskService.getTaskStats(projectId)
    taskStats.total = stats.total
    taskStats.pending = stats.pending
    taskStats.inProgress = stats.inProgress
    taskStats.completed = stats.completed
    taskStats.completionRate = stats.completionRate
    
    console.log('✅ 任务获取成功，任务数量:', taskList.length, '统计信息:', stats)
  } catch (error) {
    console.error('❌ 获取任务失败:', error)
    // 设置默认的统计信息
    taskStats.total = 0
    taskStats.pending = 0
    taskStats.inProgress = 0
    taskStats.completed = 0
    taskStats.completionRate = 0
  } finally {
    tasksLoading.value = false
  }
}

async function refreshTasks() {
  await fetchTasks()
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
    // 获取数据库用户ID
    const { UserService } = await import('@/lib/database')
    let reporterId = 125 // 默认使用用户ID 125
    
    // 尝试通过邮箱获取用户ID
    const userEmail = authStore.user?.email
    if (userEmail) {
      try {
        const userRecord = await UserService.getUserByEmail(userEmail)
        if (userRecord?.id) {
          reporterId = userRecord.id
        }
      } catch (error) {
        console.warn('通过邮箱查询用户失败，使用默认ID 125:', error)
      }
    }
    
    await memberStore.createTaskWithAssignment({
      title: newTaskTitle.value,
      description: newTaskDescription.value,
      project_id: parseInt(route.params.id as string),
      assignee_id: newTaskAssignee.value ? parseInt(newTaskAssignee.value) : undefined,
      reporter_id: reporterId,
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

// 任务编辑功能
function openEditTaskModal(task: Task) {
  editingTask.value = task
  editTaskTitle.value = task.title
  editTaskDescription.value = task.description || ''
  editTaskAssignee.value = task.assignee_id ? task.assignee_id.toString() : ''
  editTaskPriority.value = task.priority || 'medium'
  editTaskStatus.value = task.status || 'todo'
  editTaskDueDate.value = task.due_date ? formatDateForInput(task.due_date) : ''
  editTaskError.value = ''
  showEditTaskModal.value = true
}

function closeEditTaskModal() {
  showEditTaskModal.value = false
  editingTask.value = null
  editTaskTitle.value = ''
  editTaskDescription.value = ''
  editTaskAssignee.value = ''
  editTaskPriority.value = 'medium'
  editTaskStatus.value = 'todo'
  editTaskDueDate.value = ''
  editTaskError.value = ''
}

async function saveTaskChanges() {
  if (!editTaskTitle.value.trim()) {
    editTaskError.value = '请输入任务标题'
    return
  }

  if (!editingTask.value) {
    editTaskError.value = '未找到要编辑的任务'
    return
  }

  editTaskError.value = ''

  try {
    // 更新任务信息
    await TaskService.updateTask(editingTask.value.id, {
      title: editTaskTitle.value,
      description: editTaskDescription.value,
      assignee_id: editTaskAssignee.value ? parseInt(editTaskAssignee.value) : undefined,
      priority: editTaskPriority.value,
      status: editTaskStatus.value,
      due_date: editTaskDueDate.value || undefined
    })
    
    // 重新加载任务列表
    await fetchTasks()
    
    // 关闭模态框
    closeEditTaskModal()
    
    alert('任务更新成功！')
  } catch (error: any) {
    editTaskError.value = error.message || '更新任务失败'
    console.error('Error updating task:', error)
  }
}

function formatDateForInput(dateString: string) {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  return date.toISOString().split('T')[0]
}

// 生成示例团队成员
async function generateSampleTeam() {
  if (!project.value?.organization_id) {
    generateSampleError.value = '项目没有关联的组织，无法生成示例团队'
    return
  }

  if (!confirm('这将生成7个示例团队成员和6个示例任务。确定要继续吗？')) {
    return
  }

  isGeneratingSample.value = true
  generateSampleError.value = ''

  try {
    const result = await memberStore.generateSampleTeamMembers(
      project.value.organization_id,
      parseInt(route.params.id as string)
    )
    
    // 重新加载任务列表
    await fetchTasks()
    
    alert(`✅ 示例团队生成成功！

创建了 ${result.length} 个团队成员
自动生成了6个示例任务

现在可以开始项目协作了！`)
  } catch (error: any) {
    generateSampleError.value = error.message || '生成示例团队失败'
  } finally {
    isGeneratingSample.value = false
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
    await projectStore.updateProject(parseInt(route.params.id as string), editProject)
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
    console.log('🚀 开始加载项目详情，项目ID:', projectId)
    
    // 使用项目存储获取项目详情
    const result = await projectStore.fetchProjectById(projectId)
    
    if (result.success && result.data) {
      project.value = result.data
      
      console.log('✅ 项目详情加载成功:', result.data)
      
      // 初始化编辑表单
      editProject.name = project.value.name
      editProject.description = project.value.description || ''
      editProject.status = project.value.status
      
      // 加载项目成员
      console.log('🔍 开始加载项目成员...')
      await memberStore.fetchProjectMembers(parseInt(projectId))
      console.log('✅ 项目成员加载完成，数量:', memberStore.members.length)
      
      // 如果有组织ID，加载可添加的用户列表
      if (project.value.organization_id) {
        console.log('🔍 开始加载可添加的用户列表...')
        await memberStore.fetchAvailableUsers(project.value.organization_id, parseInt(projectId))
        console.log('✅ 可添加用户列表加载完成，数量:', memberStore.availableUsers.length)
      }
      
      // 加载任务列表和统计数据
      console.log('🔍 开始加载任务列表...')
      await fetchTasks()
      console.log('✅ 任务列表加载完成，数量:', tasks.value.length)
    } else {
      console.error('❌ 项目详情加载失败: 项目不存在')
      // 可以添加错误处理，比如跳转到404页面
    }
  } catch (error) {
    console.error('❌ 加载项目详情失败:', error)
  } finally {
    isLoading.value = false
  }
})
</script>