<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-orange-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
    <!-- 背景装饰元素 -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-yellow-200 to-orange-200 rounded-full opacity-20 blur-3xl"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-orange-200 to-red-200 rounded-full opacity-20 blur-3xl"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full opacity-10 blur-3xl"></div>
    </div>
    
    <!-- 主卡片 -->
    <div class="max-w-md w-full space-y-8 relative z-10">
      <!-- Logo和标题区域 -->
      <div class="text-center">
        <div class="mx-auto w-16 h-16 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
          </svg>
        </div>
        <h2 class="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
          邮箱确认
        </h2>
        <p class="mt-3 text-gray-600">
          请检查您的邮箱并完成验证
        </p>
      </div>
      
      <!-- 确认信息卡片 -->
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8 transition-all duration-300 hover:shadow-2xl">
        <div class="text-center space-y-6">
          <!-- 成功图标 -->
          <div class="mx-auto w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
          </div>
          
          <!-- 确认信息 -->
          <div class="space-y-4">
            <h3 class="text-xl font-semibold text-gray-900">
              注册成功！
            </h3>
            <p class="text-gray-600">
              我们已经向 <span class="font-medium text-blue-600">{{ email }}</span> 发送了确认邮件。
            </p>
            <p class="text-sm text-gray-500">
              请点击邮件中的链接来验证您的邮箱地址。
            </p>
          </div>
          
          <!-- 操作按钮 -->
          <div class="space-y-4">
            <button
              @click="resendEmail"
              :disabled="isResending"
              class="w-full py-3 px-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <span v-if="!isResending" class="flex items-center justify-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                重新发送确认邮件
              </span>
              <span v-else class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                发送中...
              </span>
            </button>
            
            <button
              @click="goToLogin"
              class="w-full py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-200"
            >
              返回登录
            </button>
          </div>
          
          <!-- 提示信息 -->
          <div v-if="message" class="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-600 text-sm">
            {{ message }}
          </div>
          
          <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {{ error }}
          </div>
        </div>
      </div>
      
      <!-- 帮助信息 -->
      <div class="text-center text-sm text-gray-500">
        <p>没有收到邮件？请检查垃圾邮件文件夹或联系支持。</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '@/lib/supabase'

const router = useRouter()
const route = useRoute()

const email = ref('')
const isResending = ref(false)
const message = ref('')
const error = ref('')

onMounted(() => {
  // 从路由参数或本地存储获取邮箱地址
  email.value = route.query.email as string || localStorage.getItem('pending_email') || ''
  
  // 检查URL中是否有确认令牌
  if (route.query.token) {
    handleEmailConfirmation(route.query.token as string)
  }
})

async function resendEmail() {
  if (!email.value) {
    error.value = '邮箱地址不可用'
    return
  }
  
  isResending.value = true
  error.value = ''
  message.value = ''
  
  try {
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: email.value
    })
    
    if (resendError) throw resendError
    
    message.value = '确认邮件已重新发送，请检查您的邮箱'
  } catch (err: any) {
    error.value = err.message || '发送失败，请稍后重试'
  } finally {
    isResending.value = false
  }
}

async function handleEmailConfirmation(token: string) {
  try {
    const { data, error: confirmError } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'signup'
    })
    
    if (confirmError) throw confirmError
    
    message.value = '邮箱验证成功！您现在可以登录了。'
    localStorage.removeItem('pending_email')
    
    // 3秒后自动跳转到登录页
    setTimeout(() => {
      router.push('/login')
    }, 3000)
  } catch (err: any) {
    error.value = err.message || '邮箱验证失败，请重试'
  }
}

function goToLogin() {
  router.push('/login')
}
</script>