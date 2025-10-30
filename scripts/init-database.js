import { createClient } from '@supabase/supabase-js'
const fs = require('fs')
const path = require('path')

// 从环境变量读取配置
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://pgnjxsvtxrqsuukadlzu.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnbmp4c3Z0eHJxc3V1a2FkbHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MTQ5NjYsImV4cCI6MjA3NzE5MDk2Nn0.kw0yn1Wnn4GzkXbPYRUcTjyQr6esb-BED5h-OdFiEMI'

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 缺少Supabase环境变量配置')
  console.log('请设置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY 环境变量')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function initDatabase() {
  console.log('🚀 开始初始化数据库...')
  
  try {
    // 1. 读取SQL初始化脚本
    const initSqlPath = path.join(__dirname, '..', 'supabase-init.sql')
    const mockDataSqlPath = path.join(__dirname, '..', 'supabase-mock-data.sql')
    
    if (!fs.existsSync(initSqlPath)) {
      console.error('❌ 找不到数据库初始化脚本:', initSqlPath)
      return
    }
    
    const initSql = fs.readFileSync(initSqlPath, 'utf8')
    const mockDataSql = fs.existsSync(mockDataSqlPath) 
      ? fs.readFileSync(mockDataSqlPath, 'utf8')
      : null
    
    console.log('📋 执行数据库表创建脚本...')
    
    // 2. 执行初始化脚本
    const { data: initResult, error: initError } = await supabase.rpc('exec_sql', { 
      sql: initSql 
    })
    
    if (initError) {
      console.log('⚠️ 直接执行SQL失败，尝试逐条执行...')
      await executeSqlStatements(initSql)
    } else {
      console.log('✅ 数据库表创建成功')
    }
    
    // 3. 执行模拟数据脚本
    if (mockDataSql) {
      console.log('📊 插入模拟数据...')
      const { data: mockResult, error: mockError } = await supabase.rpc('exec_sql', { 
        sql: mockDataSql 
      })
      
      if (mockError) {
        console.log('⚠️ 直接执行模拟数据SQL失败，尝试逐条执行...')
        await executeSqlStatements(mockDataSql)
      } else {
        console.log('✅ 模拟数据插入成功')
      }
    }
    
    console.log('🎉 数据库初始化完成！')
    
    // 4. 验证数据
    await verifyData()
    
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error)
  }
}

async function executeSqlStatements(sql) {
  // 简单的SQL语句分割（实际项目中应该使用更复杂的SQL解析器）
  const statements = sql.split(';').filter(stmt => stmt.trim())
  
  for (const statement of statements) {
    if (statement.trim() && !statement.trim().startsWith('--')) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' })
        if (error) {
          console.log('⚠️ 执行SQL语句失败:', statement.substring(0, 100) + '...')
          console.log('错误详情:', error.message)
        }
      } catch (err) {
        console.log('⚠️ 执行SQL语句异常:', err)
      }
    }
  }
}

async function verifyData() {
  console.log('🔍 验证数据...')
  
  try {
    // 验证用户表
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (!usersError) {
      console.log('✅ 用户表验证通过')
    }
    
    // 验证项目表
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('count')
      .limit(1)
    
    if (!projectsError) {
      console.log('✅ 项目表验证通过')
    }
    
    // 验证任务表
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('count')
      .limit(1)
    
    if (!tasksError) {
      console.log('✅ 任务表验证通过')
    }
    
    console.log('🎉 数据验证完成！')
    
  } catch (error) {
    console.error('❌ 数据验证失败:', error)
  }
}

// 运行初始化
initDatabase()
  .then(() => {
    console.log('\n📋 使用说明:')
    console.log('1. 访问 http://localhost:5173/data-display 查看数据展示页面')
    console.log('2. 访问 http://localhost:5173/ 查看仪表盘')
    console.log('3. 访问 http://localhost:5173/database-test 测试数据库连接')
    console.log('\n💡 提示: 如果数据未显示，请检查浏览器控制台错误信息')
  })
  .catch(error => {
    console.error('初始化过程出错:', error)
  })