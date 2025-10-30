<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          完善个人信息
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          请完善您的个人信息以继续使用系统
        </p>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="completeProfile">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="display-name" class="sr-only">显示名称</label>
            <input
              id="display-name"
              v-model="profile.display_name"
              type="text"
              required
              class="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="显示名称"
            />
          </div>
          <div>
            <label for="email" class="sr-only">邮箱地址</label>
            <input
              id="email"
              v-model="profile.email"
              type="email"
              required
              class="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="邮箱地址"
              :readonly="true"
            />
          </div>
        </div>

        <div v-if="error" class="text-red-600 text-sm text-center">
          {{ error }}
        </div>

        <div>
          <button
            type="submit"
            :disabled="isLoading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isLoading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ isLoading ? '保存中...' : '完成注册' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { UserService } from '@/lib/database'

const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(false)
const error = ref('')

const profile = reactive({
  display_name: '',
  email: ''
})

onMounted(() => {
  // 设置当前用户的邮箱
  if (authStore.user?.email) {
    profile.email = authStore.user.email
  }
})

async function completeProfile() {
  if (!profile.display_name.trim()) {
    error.value = '请输入显示名称'
    return
  }

  if (!profile.email.trim()) {
    error.value = '邮箱地址不能为空'
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    // 创建用户记录
    const userData = {
      email: profile.email,
      display_name: profile.display_name,
      role: 'member',
      is_active: true
    }

    await UserService.createUser(userData)
    
    // 标记用户信息已完善
    authStore.markProfileComplete()
    
    // 跳转到首页
    router.push('/')
  } catch (err: any) {
    console.error('Complete profile error:', err)
    error.value = err.message || '保存失败，请重试'
  } finally {
    isLoading.value = false
  }
}
</script>