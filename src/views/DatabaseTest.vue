<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">数据库连接测试</h1>
      
      <!-- 连接状态 -->
      <div class="card p-6 mb-6">
        <h2 class="text-lg font-semibold mb-4">连接状态</h2>
        <div class="flex items-center space-x-4">
          <div :class="connectionStatus.class" class="px-3 py-1 rounded-full text-sm">
            {{ connectionStatus.text }}
          </div>
          <button @click="testConnection" class="btn btn-primary" :disabled="isTesting">
            {{ isTesting ? '测试中...' : '重新测试连接' }}
          </button>
        </div>
      </div>

      <!-- 组织数据测试 -->
      <div class="card p-6 mb-6">
        <h2 class="text-lg font-semibold mb-4">组织数据测试</h2>
        
        <div class="space-y-4">
          <button @click="fetchOrganizations" class="btn btn-primary" :disabled="isFetchingOrgs">
            {{ isFetchingOrgs ? '加载中...' : '获取所有组织数据' }}
          </button>
          
          <div v-if="organizations.length > 0" class="mt-4">
            <h3 class="text-md font-medium mb-2">组织数据 ({{ organizations.length }} 条)</h3>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名称</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">描述</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">创建时间</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="org in organizations" :key="org.id">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ org.id }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ org.name }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ org.description || '暂无描述' }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="org.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'" class="px-2 py-1 rounded-full text-xs">
                        {{ org.is_active ? '活跃' : '已停用' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(org.created_at) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div v-if="organizationsError" class="text-red-600 text-sm mt-2">
            {{ organizationsError }}
          </div>
        </div>
      </div>

      <!-- 创建组织测试 -->
      <div class="card p-6">
        <h2 class="text-lg font-semibold mb-4">创建组织测试</h2>
        
        <form @submit.prevent="createTestOrganization" class="space-y-4">
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
              placeholder="请输入组织描述"
            />
          </div>
          
          <div v-if="createError" class="text-red-600 text-sm">
            {{ createError }}
          </div>
          
          <div v-if="createSuccess" class="text-green-600 text-sm">
            {{ createSuccess }}
          </div>

          <button
            type="submit"
            :disabled="isCreating"
            class="btn btn-primary"
          >
            {{ isCreating ? '创建中...' : '创建测试组织' }}
          </button>
        </form>
      </div>

      <!-- 导航按钮 -->
      <div class="mt-6 flex space-x-4">
        <button @click="goToOrganizations" class="btn btn-primary" v-if="organizations.length > 0">
          前往组织管理页面
        </button>
        <button @click="goBack" class="btn btn-secondary">
          返回
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { OrganizationService } from '@/lib/database'
import { supabase } from '@/lib/supabase'
import type { Organization } from '@/types'

const router = useRouter()

const isTesting = ref(false)
const isFetchingOrgs = ref(false)
const isCreating = ref(false)
const organizations = ref<Organization[]>([])
const organizationsError = ref('')
const createError = ref('')
const createSuccess = ref('')

const newOrg = reactive({
  name: '',
  description: ''
})

const connectionStatus = computed(() => {
  if (isTesting.value) {
    return { class: 'bg-blue-100 text-blue-800', text: '测试中...' }
  }
  if (organizationsError.value) {
    return { class: 'bg-red-100 text-red-800', text: '连接失败' }
  }
  if (organizations.value.length > 0) {
    return { class: 'bg-green-100 text-green-800', text: '连接成功' }
  }
  return { class: 'bg-gray-100 text-gray-800', text: '未测试' }
})

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

async function testConnection() {
  isTesting.value = true
  organizationsError.value = ''
  
  try {
    // 测试 Supabase 连接
    const { data, error } = await supabase.from('organizations').select('count')
    
    if (error) {
      console.error('数据库连接测试失败:', error)
      organizationsError.value = `连接失败: ${error.message}`
    } else {
      console.log('✅ 数据库连接测试成功')
      // 自动获取组织数据
      await fetchOrganizations()
    }
  } catch (error: any) {
    console.error('连接测试异常:', error)
    organizationsError.value = `连接异常: ${error.message}`
  } finally {
    isTesting.value = false
  }
}

async function fetchOrganizations() {
  isFetchingOrgs.value = true
  organizationsError.value = ''
  
  try {
    console.log('🔍 开始获取组织数据...')
    const data = await OrganizationService.getAllOrganizations()
    
    if (data && data.length > 0) {
      organizations.value = data
      console.log('✅ 组织数据获取成功，数量:', data.length)
    } else {
      organizations.value = []
      console.log('ℹ️ 数据库中暂无组织数据')
    }
  } catch (error: any) {
    console.error('❌ 获取组织数据失败:', error)
    organizationsError.value = `获取数据失败: ${error.message}`
    organizations.value = []
  } finally {
    isFetchingOrgs.value = false
  }
}

async function createTestOrganization() {
  if (!newOrg.name.trim()) {
    createError.value = '请输入组织名称'
    return
  }

  isCreating.value = true
  createError.value = ''
  createSuccess.value = ''

  try {
    console.log('📝 开始创建测试组织...')
    const result = await OrganizationService.createOrganization({
      name: newOrg.name.trim(),
      description: newOrg.description.trim(),
      owner_id: 'test-user' // 使用测试用户ID
    })
    
    createSuccess.value = `组织 "${result.name}" 创建成功！`
    newOrg.name = ''
    newOrg.description = ''
    
    // 重新获取组织列表
    await fetchOrganizations()
    
    console.log('✅ 测试组织创建成功:', result)
  } catch (error: any) {
    console.error('❌ 创建测试组织失败:', error)
    createError.value = `创建失败: ${error.message}`
  } finally {
    isCreating.value = false
  }
}

function goToOrganizations() {
  router.push('/organizations')
}

function goBack() {
  router.back()
}

// 页面加载时自动测试连接
fetchOrganizations()
</script>

<style scoped>
.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #4b5563;
}

.input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
</style>