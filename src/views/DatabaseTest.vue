<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
      <!-- 标题 -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Supabase数据库连接测试</h1>
        <p class="text-gray-600">验证数据库连接状态和表结构</p>
      </div>

      <!-- 配置信息卡片 -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">配置信息</h2>
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-gray-600">Supabase URL:</span>
            <span class="font-mono text-sm">{{ config.supabaseUrl ? '已配置' : '未配置' }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-gray-600">API Key:</span>
            <span class="font-mono text-sm">{{ config.supabaseKey ? '已配置' : '未配置' }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-gray-600">连接状态:</span>
            <span :class="connectionStatusClass">{{ connectionStatusText }}</span>
          </div>
        </div>
      </div>

      <!-- 测试按钮 -->
      <div class="flex gap-4 mb-6">
        <button 
          @click="testConnection" 
          :disabled="isTesting"
          class="btn btn-primary flex-1"
        >
          <span v-if="!isTesting">测试数据库连接</span>
          <span v-else class="flex items-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            测试中...
          </span>
        </button>
        
        <a 
          href="https://supabase.com/dashboard/project/pgnjxsvtxrqsuukadlzu" 
          target="_blank" 
          class="btn btn-outline"
        >
          打开Supabase控制台
        </a>
      </div>

      <!-- 测试结果 -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">测试结果</h2>
        <div class="space-y-3">
          <div 
            v-for="(result, index) in testResults" 
            :key="index"
            class="flex items-center p-3 rounded-lg"
            :class="{
              'bg-green-50 border border-green-200': result.type === 'success',
              'bg-yellow-50 border border-yellow-200': result.type === 'warning',
              'bg-red-50 border border-red-200': result.type === 'error'
            }"
          >
            <span 
              class="w-6 h-6 rounded-full flex items-center justify-center mr-3 text-white text-sm"
              :class="{
                'bg-green-500': result.type === 'success',
                'bg-yellow-500': result.type === 'warning',
                'bg-red-500': result.type === 'error'
              }"
            >
              {{ result.type === 'success' ? '✓' : result.type === 'warning' ? '!' : '✗' }}
            </span>
            <div>
              <p class="font-medium">{{ result.title }}</p>
              <p class="text-sm text-gray-600">{{ result.message }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 数据库表状态 -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">数据库表状态</h2>
        <div class="space-y-4">
          <div 
            v-for="table in tableStatus" 
            :key="table.name"
            class="flex items-center justify-between p-3 border rounded-lg"
            :class="{
              'border-green-200 bg-green-50': table.status === 'exists',
              'border-yellow-200 bg-yellow-50': table.status === 'checking',
              'border-red-200 bg-red-50': table.status === 'missing'
            }"
          >
            <div class="flex items-center">
              <span class="font-mono bg-gray-100 px-2 py-1 rounded text-sm mr-3">{{ table.name }}</span>
              <span class="text-sm text-gray-600">{{ table.description }}</span>
            </div>
            <span 
              class="px-2 py-1 rounded text-xs font-medium"
              :class="{
                'bg-green-100 text-green-800': table.status === 'exists',
                'bg-yellow-100 text-yellow-800': table.status === 'checking',
                'bg-red-100 text-red-800': table.status === 'missing'
              }"
            >
              {{ table.status === 'exists' ? '已存在' : table.status === 'checking' ? '检查中' : '未创建' }}
            </span>
          </div>
        </div>
      </div>

      <!-- 操作指南 -->
      <div class="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 class="text-lg font-semibold text-blue-800 mb-3">操作指南</h3>
        <div class="space-y-4">
          <div class="flex items-start">
            <span class="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-1">1</span>
            <div>
              <p class="font-medium">在Supabase控制台中执行SQL脚本</p>
              <p class="text-sm text-gray-600">复制 <code class="bg-gray-100 px-1 rounded">supabase-init.sql</code> 文件内容到SQL编辑器中执行</p>
            </div>
          </div>
          <div class="flex items-start">
            <span class="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-1">2</span>
            <div>
              <p class="font-medium">插入模拟数据</p>
              <p class="text-sm text-gray-600">执行 <code class="bg-gray-100 px-1 rounded">supabase-mock-data.sql</code> 文件内容</p>
            </div>
          </div>
          <div class="flex items-start">
            <span class="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-1">3</span>
            <div>
              <p class="font-medium">测试登录功能</p>
              <p class="text-sm text-gray-600">使用测试账号进行登录测试：admin@aipm.com / 任意密码</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/lib/supabase'

interface TestResult {
  type: 'success' | 'warning' | 'error'
  title: string
  message: string
}

interface TableStatus {
  name: string
  description: string
  status: 'exists' | 'missing' | 'checking'
}

const isTesting = ref(false)
const connectionStatus = ref<'idle' | 'success' | 'error'>('idle')
const connectionStatusText = ref('未测试')
const testResults = ref<TestResult[]>([])
const tableStatus = ref<TableStatus[]>([
  { name: 'users', description: '用户表', status: 'checking' },
  { name: 'organizations', description: '组织表', status: 'checking' },
  { name: 'organization_members', description: '组织成员表', status: 'checking' },
  { name: 'projects', description: '项目表', status: 'checking' },
  { name: 'project_members', description: '项目成员表', status: 'checking' },
  { name: 'tasks', description: '任务表', status: 'checking' },
  { name: 'chat_history', description: 'AI对话历史表', status: 'checking' },
  { name: 'notifications', description: '通知表', status: 'checking' }
])

const config = ref({
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY || ''
})

const connectionStatusClass = computed(() => {
  switch (connectionStatus.value) {
    case 'success':
      return 'text-green-600 font-medium'
    case 'error':
      return 'text-red-600 font-medium'
    default:
      return 'text-gray-600'
  }
})

function addTestResult(type: 'success' | 'warning' | 'error', title: string, message: string) {
  testResults.value.push({ type, title, message })
}

async function testConnection() {
  isTesting.value = true
  testResults.value = []
  connectionStatus.value = 'idle'
  connectionStatusText.value = '测试中...'

  try {
    // 测试环境变量配置
    if (!config.value.supabaseUrl || !config.value.supabaseKey) {
      addTestResult('error', '环境变量配置', 'Supabase配置不完整')
      connectionStatus.value = 'error'
      connectionStatusText.value = '配置错误'
      return
    }
    
    addTestResult('success', '环境变量', 'Supabase配置检查通过')
    
    // 测试认证连接
    const { data: authData, error: authError } = await supabase.auth.getSession()
    
    if (authError) {
      addTestResult('warning', '认证连接', `认证连接测试失败: ${authError.message}`)
    } else {
      addTestResult('success', '认证连接', 'Supabase认证连接正常')
    }
    
    // 测试数据库连接
    const { data, error } = await supabase
      .from('organizations')
      .select('count')
      .limit(1)
    
    if (error) {
      if (error.code === 'PGRST116') {
        addTestResult('warning', '数据库连接', '数据库连接正常，但表可能不存在')
        connectionStatus.value = 'success'
        connectionStatusText.value = '连接正常（表未创建）'
      } else {
        addTestResult('error', '数据库连接', `数据库连接失败: ${error.message}`)
        connectionStatus.value = 'error'
        connectionStatusText.value = '连接失败'
      }
    } else {
      addTestResult('success', '数据库连接', '数据库连接正常')
      connectionStatus.value = 'success'
      connectionStatusText.value = '连接正常'
    }
    
    // 测试表结构
    await checkTableStatus()
    
  } catch (error: any) {
    addTestResult('error', '连接测试', `测试过程中发生错误: ${error.message}`)
    connectionStatus.value = 'error'
    connectionStatusText.value = '测试失败'
  } finally {
    isTesting.value = false
  }
}

async function checkTableStatus() {
  for (const table of tableStatus.value) {
    try {
      const { error } = await supabase
        .from(table.name)
        .select('count')
        .limit(1)
      
      if (error) {
        if (error.code === 'PGRST116') {
          table.status = 'missing'
        } else {
          table.status = 'missing'
        }
      } else {
        table.status = 'exists'
      }
    } catch (error) {
      table.status = 'missing'
    }
  }
}

onMounted(() => {
  // 页面加载时自动检查表状态
  checkTableStatus()
})
</script>

<style scoped>
.btn {
  @apply px-4 py-2 rounded-lg font-medium transition-colors duration-200;
}

.btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300;
}

.btn-outline {
  @apply border border-gray-300 text-gray-700 hover:bg-gray-50;
}
</style>