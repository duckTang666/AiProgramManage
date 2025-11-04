import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { UserService } from '@/lib/database'
import type { User } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isLoading = ref(true)

  const isAuthenticated = computed(() => !!user.value)

  async function init() {
    try {
      // 并行执行认证检查和监听器设置
      const [sessionResult] = await Promise.allSettled([
        supabase.auth.getSession()
      ])
      
      if (sessionResult.status === 'fulfilled') {
        const { data: { session } } = sessionResult.value
        user.value = session?.user ?? null
        
        // 异步检查用户记录，不阻塞初始化
        if (user.value) {
          ensureUserRecordExists(user.value).catch(() => {
            // 静默处理错误，不影响初始化
          })
        }
      }
      
      // 监听认证状态变化（非阻塞）
      supabase.auth.onAuthStateChange(async (event, session) => {
        user.value = session?.user ?? null
        
        // 只在登录事件时检查用户记录
        if (user.value && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          ensureUserRecordExists(user.value).catch(() => {
            // 静默处理错误
          })
        }
      })
    } catch (error) {
      console.error('Auth initialization error:', error)
    } finally {
      // 设置超时，确保初始化不会无限期等待
      setTimeout(() => {
        isLoading.value = false
      }, 100)
    }
  }
  
  // 确保用户记录存在（带缓存检查）
  async function ensureUserRecordExists(authUser: User) {
    try {
      await UserService.getUserByAuthId(authUser.id)
    } catch (error) {
      // 用户记录不存在，自动创建用户记录
      await UserService.createUser({
        auth_id: authUser.id,
        email: authUser.email!,
        display_name: authUser.email!.split('@')[0],
        role: 'member',
        is_active: true
      })
    }
  }

  async function login(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        console.error('Login error:', error)
        // 提供更友好的错误信息
        if (error.message === 'Invalid login credentials') {
          throw new Error('邮箱或密码错误，请检查后重试')
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('请先验证您的邮箱地址')
        } else if (error.message.includes('Bad Request')) {
          throw new Error('认证服务暂时不可用，请稍后重试')
        }
        throw error
      }
      
      // 登录成功后，检查用户记录是否存在
      if (data.user) {
        try {
          await UserService.getUserByAuthId(data.user.id)
        } catch (profileError) {
          // 用户记录不存在，自动创建用户记录
          await UserService.createUser({
            auth_id: data.user.id,
            email: data.user.email!,
            display_name: data.user.email!.split('@')[0],
            role: 'member',
            is_active: true
          })
        }
      }
      
      return data
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  async function register(email: string, password: string, userData: { name: string }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
        emailRedirectTo: `${window.location.origin}/email-confirmation`
      }
    })
    
    if (error) {
      // 提供更友好的错误信息
      if (error.message.includes('User already registered')) {
        throw new Error('该邮箱已被注册，请使用其他邮箱或尝试登录')
      } else if (error.message.includes('Password should be at least')) {
        throw new Error('密码强度不足，请使用更复杂的密码')
      } else if (error.message.includes('Email rate limit exceeded')) {
        throw new Error('发送邮件过于频繁，请稍后再试')
      }
      throw error
    }
    
    // 如果注册成功且有会话，创建用户记录
    if (data.user && data.session) {
      try {
        await UserService.createUser({
          auth_id: data.user.id,
          email: data.user.email!,
          display_name: userData.name,
          role: 'member',
          is_active: true
        })
      } catch (profileError) {
        console.warn('Failed to create user profile:', profileError)
        // 即使创建用户记录失败，也允许登录
      }
    }
    
    // 保存待确认的邮箱地址
    if (data.user && !data.session) {
      localStorage.setItem('pending_email', email)
    }
    
    return data
  }

  async function resendConfirmationEmail(email: string) {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email
    })
    
    if (error) {
      if (error.message.includes('Email rate limit exceeded')) {
        throw new Error('发送邮件过于频繁，请稍后再试')
      }
      throw error
    }
  }

  async function verifyEmail(token: string) {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'signup'
    })
    
    if (error) throw error
    
    // 清除待确认邮箱
    localStorage.removeItem('pending_email')
    
    return data
  }

  async function resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    
    if (error) throw error
  }

  async function updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })
    
    if (error) throw error
  }



  async function logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    user.value = null
  }

  return {
    user,
    isLoading,
    isAuthenticated,
    init,
    login,
    register,
    logout,
    resendConfirmationEmail,
    verifyEmail,
    resetPassword,
    updatePassword
  }
})