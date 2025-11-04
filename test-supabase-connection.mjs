// 测试Supabase连接 - ES模块版本
import { createClient } from '@supabase/supabase-js'

// 使用.env文件中的配置
const supabaseUrl = 'https://pgnjxsvtxrqsuukadlzu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnbmp4c3Z0eHJxc3V1a2FkbHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MTQ5NjYsImV4cCI6MjA3NzE5MDk2Nn0.kw0yn1Wnn4GzkXbPYRUcTjyQr6esb-BED5h-OdFiEMI'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  console.log('🔍 测试Supabase连接...\n')
  
  try {
    // 1. 测试基本连接
    console.log('1. 测试基本连接...')
    const { data, error } = await supabase.from('users').select('count').limit(1)
    
    if (error) {
      console.log('❌ 连接失败:', error.message)
      console.log('错误详情:', error)
      
      // 检查是否是配置问题
      if (error.message.includes('JWT')) {
        console.log('💡 可能是API密钥配置错误')
      } else if (error.message.includes('not found')) {
        console.log('💡 可能是URL配置错误或表不存在')
      }
    } else {
      console.log('✅ 连接成功!')
    }

    // 2. 测试用户表访问
    console.log('\n2. 测试用户表访问...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(2)
    
    if (usersError) {
      console.log('❌ 用户表访问失败:', usersError.message)
    } else {
      console.log('✅ 用户表访问成功，记录数:', users.length)
      users.forEach(user => {
        console.log(`   - ${user.display_name} (${user.email})`)
      })
    }

    // 3. 测试组织表访问
    console.log('\n3. 测试组织表访问...')
    const { data: orgs, error: orgsError } = await supabase
      .from('organizations')
      .select('*')
      .limit(2)
    
    if (orgsError) {
      console.log('❌ 组织表访问失败:', orgsError.message)
    } else {
      console.log('✅ 组织表访问成功，记录数:', orgs.length)
      orgs.forEach(org => {
        console.log(`   - ${org.name}`)
      })
    }

    console.log('\n🎉 测试完成!')
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error)
  }
}

testConnection()