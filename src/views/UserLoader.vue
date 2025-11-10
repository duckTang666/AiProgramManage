<template>
  <div class="user-loader">
    <div class="loader-container">
      <h2 class="page-title">用户信息加载</h2>
      
      <!-- 搜索和加载区域 -->
      <div class="search-section">
        <div class="input-group">
          <label for="userIdentifier">用户标识符</label>
          <div class="input-with-button">
            <input
              id="userIdentifier"
              v-model="identifier"
              type="text"
              placeholder="输入用户ID（如：125）或邮箱地址"
              @keyup.enter="loadUser"
              class="search-input"
            />
            <button @click="loadUser" :disabled="isLoading" class="search-button">
              {{ isLoading ? '加载中...' : '加载用户' }}
            </button>
          </div>
          <p class="input-hint">支持：用户ID（数字）或邮箱地址</p>
        </div>
      </div>

      <!-- 搜索结果 -->
      <div v-if="user" class="user-details">
        <div class="user-card">
          <div class="user-header">
            <div class="avatar-placeholder">{{ userInitials }}</div>
            <div class="user-info">
              <h3 class="user-name">{{ user.display_name }}</h3>
              <p class="user-email">{{ user.email }}</p>
            </div>
            <div class="user-badge" :class="user.role">{{ roleText }}</div>
          </div>
          
          <div class="user-details-grid">
            <div class="detail-item">
              <span class="detail-label">用户ID：</span>
              <span class="detail-value">{{ user.id }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">状态：</span>
              <span class="detail-value" :class="{ active: user.is_active, inactive: !user.is_active }">
                {{ user.is_active ? '活跃' : '非活跃' }}
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">上次登录：</span>
              <span class="detail-value">{{ formattedLastLogin }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">创建时间：</span>
              <span class="detail-value">{{ formattedCreatedAt }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 错误信息 -->
      <div v-if="error" class="error-message">
        <div class="error-icon">⚠️</div>
        <p>{{ error }}</p>
      </div>

      <!-- 搜索建议 -->
      <div v-if="searchResults.length > 0" class="search-results">
        <h3 class="results-title">搜索建议</h3>
        <div class="results-list">
          <div
            v-for="result in searchResults"
            :key="result.id"
            class="result-item"
            @click="selectUser(result)"
          >
            <div class="result-avatar">{{ result.display_name.charAt(0) }}</div>
            <div class="result-info">
              <span class="result-name">{{ result.display_name }}</span>
              <span class="result-email">{{ result.email }}</span>
            </div>
            <div class="result-id">ID: {{ result.id }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { UserService } from '@/lib/database'
import type { User } from '@/types'

const identifier = ref('')
const user = ref<User | null>(null)
const searchResults = ref<User[]>([])
const isLoading = ref(false)
const error = ref('')

// 监听标识符变化，进行搜索
watch(identifier, async (newValue) => {
  if (newValue.length > 1) {
    await searchUsers(newValue)
  } else {
    searchResults.value = []
  }
})

// 计算用户姓名首字母
const userInitials = computed(() => {
  if (!user.value) return ''
  return user.value.display_name
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2)
})

// 计算角色文本
const roleText = computed(() => {
  if (!user.value) return ''
  const roleMap = {
    'admin': '管理员',
    'manager': '经理',
    'member': '成员',
    'guest': '访客'
  }
  return roleMap[user.value.role] || user.value.role
})

// 格式化上次登录时间
const formattedLastLogin = computed(() => {
  if (!user.value?.last_login_at) return '从未登录'
  return new Date(user.value.last_login_at).toLocaleString('zh-CN')
})

// 格式化创建时间
const formattedCreatedAt = computed(() => {
  if (!user.value?.created_at) return ''
  return new Date(user.value.created_at).toLocaleString('zh-CN')
})

// 加载用户信息
async function loadUser() {
  if (!identifier.value.trim()) {
    error.value = '请输入用户ID或邮箱地址'
    return
  }

  isLoading.value = true
  error.value = ''
  user.value = null

  try {
    console.log('🔍 开始加载用户，标识符:', identifier.value)
    
    const result = await UserService.getUserByIdentifier(identifier.value.trim())
    
    if (result) {
      user.value = result
      console.log('✅ 用户加载成功:', result)
      
      // 清除搜索建议
      searchResults.value = []
    } else {
      error.value = '未找到匹配的用户。请检查输入的用户ID或邮箱是否正确。'
      
      // 如果没有找到精确匹配，显示搜索建议
      if (identifier.value.length > 2) {
        await searchUsers(identifier.value)
      }
    }
  } catch (err) {
    console.error('❌ 加载用户失败:', err)
    error.value = '加载用户信息时发生错误，请稍后重试。'
  } finally {
    isLoading.value = false
  }
}

// 搜索用户（模糊匹配）
async function searchUsers(query: string) {
  try {
    const results = await UserService.searchUsers(query, 5)
    searchResults.value = results
    
    if (results.length === 0 && query.length > 2) {
      console.log('ℹ️ 没有找到相关用户')
    }
  } catch (err) {
    console.error('搜索用户失败:', err)
    searchResults.value = []
  }
}

// 选择搜索结果中的用户
function selectUser(selectedUser: User) {
  user.value = selectedUser
  identifier.value = selectedUser.id.toString()
  searchResults.value = []
  error.value = ''
}
</script>

<style scoped>
.user-loader {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.loader-container {
  background: #fff;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.page-title {
  text-align: center;
  margin-bottom: 30px;
  color: #2c3e50;
  font-size: 24px;
  font-weight: 600;
}

.search-section {
  margin-bottom: 30px;
}

.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
}

.input-with-button {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #3498db;
}

.search-button {
  padding: 12px 24px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.search-button:hover:not(:disabled) {
  background: #2980b9;
}

.search-button:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.input-hint {
  margin-top: 8px;
  font-size: 14px;
  color: #7f8c8d;
}

.user-details {
  margin-top: 30px;
}

.user-card {
  border: 1px solid #e1e5e9;
  border-radius: 12px;
  padding: 24px;
  background: #f8f9fa;
}

.user-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  gap: 16px;
}

.avatar-placeholder {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #3498db;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
}

.user-info {
  flex: 1;
}

.user-name {
  margin: 0 0 4px 0;
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
}

.user-email {
  margin: 0;
  color: #7f8c8d;
  font-size: 14px;
}

.user-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.user-badge.admin {
  background: #e74c3c;
  color: white;
}

.user-badge.manager {
  background: #f39c12;
  color: white;
}

.user-badge.member {
  background: #3498db;
  color: white;
}

.user-badge.guest {
  background: #95a5a6;
  color: white;
}

.user-details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #ecf0f1;
}

.detail-label {
  font-weight: 500;
  color: #555;
}

.detail-value {
  color: #2c3e50;
}

.detail-value.active {
  color: #27ae60;
  font-weight: 500;
}

.detail-value.inactive {
  color: #e74c3c;
  font-weight: 500;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 8px;
  margin-top: 20px;
  color: #c53030;
}

.error-icon {
  font-size: 20px;
}

.search-results {
  margin-top: 20px;
}

.results-title {
  margin-bottom: 12px;
  font-size: 16px;
  color: #555;
}

.results-list {
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  overflow: hidden;
}

.result-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid #ecf0f1;
}

.result-item:hover {
  background: #f8f9fa;
}

.result-item:last-child {
  border-bottom: none;
}

.result-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #3498db;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 12px;
}

.result-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.result-name {
  font-weight: 500;
  color: #2c3e50;
}

.result-email {
  font-size: 12px;
  color: #7f8c8d;
}

.result-id {
  font-size: 12px;
  color: #95a5a6;
}

@media (max-width: 768px) {
  .user-loader {
    padding: 16px;
  }
  
  .loader-container {
    padding: 20px;
  }
  
  .user-details-grid {
    grid-template-columns: 1fr;
  }
  
  .input-with-button {
    flex-direction: column;
  }
  
  .search-button {
    width: 100%;
  }
}
</style>