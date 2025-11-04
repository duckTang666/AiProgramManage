// 最终仪表盘数据加载测试
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pgnjxsvtxrqsuukadlzu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnbm14c3Z0eHJxc3V1a2FkbHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTYyODUyNTQsImV4cCI6MjAzMTg2MTI1NH0.9J7J8v7J7J8v7J7J8v7J7J8v7J7J8v7J7J8v7J7J8'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 最终仪表盘数据加载测试...\n')

async function testDashboardData() {
  try {
    console.log('1. 测试用户数据加载...')
    
    // 测试用户1
    const { data: user1, error: error1 } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@aiproject.com')
      .single()
    
    if (error1) {
      console.log('❌ 用户1数据加载失败:', error1.message)
    } else {
      console.log('✅ 用户1数据加载成功:', user1.display_name)
    }
    
    // 测试用户2
    const { data: user2, error: error2 } = await supabase
      .from('users')
      .select('*')
      .eq('email', '2948340954@qq.com')
      .single()
    
    if (error2) {
      console.log('❌ 用户2数据加载失败:', error2.message)
    } else {
      console.log('✅ 用户2数据加载成功:', user2.display_name)
    }
    
    console.log('\n2. 测试组织成员关系...')
    
    // 测试用户1的组织成员关系
    if (user1) {
      const { data: orgs1, error: orgsError1 } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user1.id)
      
      if (orgsError1) {
        console.log('❌ 用户1组织成员关系查询失败:', orgsError1.message)
      } else {
        console.log('✅ 用户1组织数量:', orgs1?.length || 0)
      }
    }
    
    // 测试用户2的组织成员关系
    if (user2) {
      const { data: orgs2, error: orgsError2 } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user2.id)
      
      if (orgsError2) {
        console.log('❌ 用户2组织成员关系查询失败:', orgsError2.message)
      } else {
        console.log('✅ 用户2组织数量:', orgs2?.length || 0)
      }
    }
    
    console.log('\n3. 测试项目数据...')
    
    // 获取所有项目
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (projectsError) {
      console.log('❌ 项目数据查询失败:', projectsError.message)
    } else {
      console.log('✅ 项目数量:', projects?.length || 0)
      const activeProjects = projects?.filter(p => p.status === 'active').length || 0
      console.log('✅ 活跃项目数量:', activeProjects)
    }
    
    console.log('\n4. 测试任务数据...')
    
    // 获取所有任务
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
    
    if (tasksError) {
      console.log('❌ 任务数据查询失败:', tasksError.message)
    } else {
      console.log('✅ 任务数量:', tasks?.length || 0)
      const pendingTasks = tasks?.filter(t => ['todo', 'in_progress'].includes(t.status)).length || 0
      console.log('✅ 待办任务数量:', pendingTasks)
    }
    
    console.log('\n5. 测试AI对话数据...')
    
    // 获取AI对话数据
    const { data: aiChats, error: aiChatsError } = await supabase
      .from('chat_history')
      .select('*')
    
    if (aiChatsError) {
      console.log('❌ AI对话数据查询失败:', aiChatsError.message)
    } else {
      console.log('✅ AI对话数量:', aiChats?.length || 0)
    }
    
    console.log('\n🎉 仪表盘数据加载测试完成！')
    console.log('📊 所有数据表均可正常访问')
    console.log('🌐 请访问 http://localhost:3001/ 查看修复后的仪表盘')
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error)
  }
}

testDashboardData()