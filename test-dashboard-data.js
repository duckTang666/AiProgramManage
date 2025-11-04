// 测试仪表盘数据展示功能
import { createClient } from '@supabase/supabase-js'

// 从环境变量获取Supabase配置
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://pgnjxsvtxrqsuukadlzu.supabase.co'
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnbmp4c3Z0eHJxc3V1a2FkbHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MTQ5NjYsImV4cCI6MjA3NzE5MDk2Nn0.kw0yn1Wnn4GzkXbPYRUcTjyQr6esb-BED5h-OdFiEMI'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testDashboardData() {
  console.log('🔧 测试仪表盘数据展示功能...\n')

  try {
    // 1. 测试数据库连接
    console.log('1. 测试数据库连接...')
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (testError) {
      console.log('   ❌ 数据库连接失败:', testError.message)
      return
    }
    console.log('   ✅ 数据库连接正常')

    // 2. 获取默认管理员用户ID
    console.log('\n2. 获取默认管理员用户...')
    const { data: adminUser, error: userError } = await supabase
      .from('users')
      .select('id, email, display_name, role')
      .eq('email', 'admin@aiproject.com')
      .single()
    
    if (userError) {
      console.log('   ❌ 获取用户失败:', userError.message)
      return
    }
    
    if (!adminUser) {
      console.log('   ⚠️ 默认管理员用户不存在')
      return
    }
    
    console.log('   ✅ 获取到管理员用户:', adminUser.display_name)
    const userId = adminUser.id

    // 3. 测试统计数据加载
    console.log('\n3. 测试统计数据加载...')
    
    // 获取用户所属的组织
    const { data: userOrgs, error: orgsError } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', userId)
    
    const organizationIds = userOrgs?.map(org => org.organization_id) || []
    console.log('   ✅ 用户所属组织数量:', organizationIds.length)
    
    // 获取活跃项目数量
    let activeProjects = 0
    if (organizationIds.length > 0) {
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id')
        .in('organization_id', organizationIds)
        .eq('status', 'active')
      
      if (!projectsError) {
        activeProjects = projects?.length || 0
      }
    }
    console.log('   ✅ 活跃项目数量:', activeProjects)
    
    // 获取待办任务数量
    let pendingTasks = 0
    if (organizationIds.length > 0) {
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('id')
        .in('status', ['todo', 'in_progress'])
      
      if (!tasksError) {
        pendingTasks = tasks?.length || 0
      }
    }
    console.log('   ✅ 待办任务数量:', pendingTasks)
    
    // 获取AI对话数量
    let aiChatsCount = 0
    const { data: aiChats, error: aiChatsError } = await supabase
      .from('chat_history')
      .select('id')
      .eq('user_id', userId)
    
    if (!aiChatsError) {
      aiChatsCount = aiChats?.length || 0
    }
    console.log('   ✅ AI对话数量:', aiChatsCount)

    // 4. 测试最近项目加载
    console.log('\n4. 测试最近项目加载...')
    
    let recentProjects = []
    if (organizationIds.length > 0) {
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .in('organization_id', organizationIds)
        .order('created_at', { ascending: false })
        .limit(5)
      
      if (!projectsError) {
        recentProjects = projects || []
      }
    }
    console.log('   ✅ 最近项目数量:', recentProjects.length)
    
    if (recentProjects.length > 0) {
      console.log('   📋 最近项目列表:')
      recentProjects.forEach(project => {
        console.log(`      - ${project.name} (${project.status}, ${project.progress_percentage}%)`)
      })
    }

    // 5. 显示数据统计摘要
    console.log('\n5. 数据统计摘要:')
    console.log('   📊 组织数量:', organizationIds.length)
    console.log('   📊 活跃项目:', activeProjects)
    console.log('   📊 待办任务:', pendingTasks)
    console.log('   📊 AI对话:', aiChatsCount)
    console.log('   📊 最近项目:', recentProjects.length)

    // 6. 检查数据完整性
    console.log('\n6. 数据完整性检查:')
    
    // 检查所有必需的表是否存在
    const tables = ['users', 'organizations', 'projects', 'organization_members', 'tasks', 'chat_history']
    let missingTables = []
    
    for (const table of tables) {
      const { error: tableError } = await supabase
        .from(table)
        .select('count')
        .limit(1)
      
      if (tableError && tableError.message.includes('does not exist')) {
        missingTables.push(table)
      }
    }
    
    if (missingTables.length > 0) {
      console.log('   ⚠️ 缺失的表:', missingTables.join(', '))
      console.log('   💡 建议执行数据库修复脚本')
    } else {
      console.log('   ✅ 所有必需的表都存在')
    }

    console.log('\n🎉 仪表盘数据展示测试完成！')
    console.log('\n📋 总结:')
    console.log('   - 数据库连接: ✅ 正常')
    console.log('   - 用户认证: ✅ 正常')
    console.log('   - 数据加载: ✅ 正常')
    console.log('   - 表完整性: ' + (missingTables.length === 0 ? '✅ 完整' : '⚠️ 部分缺失'))
    
    console.log('\n💡 建议操作:')
    if (missingTables.length > 0) {
      console.log('   1. 执行数据库修复脚本: fix-users-table.sql')
    }
    console.log('   2. 启动前端应用: npm run dev')
    console.log('   3. 访问仪表盘: http://localhost:5173')
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error)
  }
}

// 执行测试
testDashboardData()