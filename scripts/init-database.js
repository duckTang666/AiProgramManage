import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取环境变量
const supabaseUrl = 'https://pgnjxsvtxrqsuukadlzu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnbmp4c3Z0eHJxc3V1a2FkbHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MTQ5NjYsImV4cCI6MjA3NzE5MDk2Nn0.kw0yn1Wnn4GzkXbPYRUcTjyQr6esb-BED5h-OdFiEMI';

// 创建Supabase客户端
const supabase = createClient(supabaseUrl, supabaseKey);

// 读取SQL文件
const initSql = fs.readFileSync(path.join(__dirname, '..', 'supabase-init.sql'), 'utf8');
const mockDataSql = fs.readFileSync(path.join(__dirname, '..', 'supabase-mock-data.sql'), 'utf8');

async function executeSql(sql) {
  // 将SQL语句分割成单独的语句
  const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
  
  for (const statement of statements) {
    if (statement.trim().startsWith('--') || statement.trim().length === 0) {
      continue; // 跳过注释和空行
    }
    
    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
      if (error) {
        console.error('❌ SQL执行错误:', error.message);
        console.log('执行的SQL:', statement.substring(0, 200) + '...');
      } else {
        console.log('✅ SQL执行成功');
      }
    } catch (error) {
      console.error('❌ 执行过程中出现错误:', error.message);
    }
    
    // 添加延迟避免请求过快
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

async function initDatabase() {
  console.log('🚀 开始初始化数据库...');
  
  try {
    // 执行初始化脚本
    console.log('📝 执行数据库表结构初始化...');
    await executeSql(initSql);
    
    console.log('✅ 数据库表结构初始化完成');
    
    // 等待2秒让表创建完成
    console.log('⏳ 等待表创建完成...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 执行模拟数据插入
    console.log('📊 插入模拟数据...');
    await executeSql(mockDataSql);
    
    console.log('✅ 模拟数据插入完成');
    console.log('🎉 数据库初始化完成！');
    
    // 验证数据
    console.log('🔍 验证数据...');
    const { data: users, error: usersError } = await supabase.from('users').select('*', { count: 'exact' });
    const { data: projects, error: projectsError } = await supabase.from('projects').select('*', { count: 'exact' });
    const { data: tasks, error: tasksError } = await supabase.from('tasks').select('*', { count: 'exact' });
    
    if (usersError) console.error('❌ 用户数据查询失败:', usersError);
    if (projectsError) console.error('❌ 项目数据查询失败:', projectsError);
    if (tasksError) console.error('❌ 任务数据查询失败:', tasksError);
    
    console.log('📊 数据统计:');
    console.log('👥 用户数量:', users?.length || 0);
    console.log('📁 项目数量:', projects?.length || 0);
    console.log('✅ 任务数量:', tasks?.length || 0);
    
  } catch (error) {
    console.error('❌ 初始化过程中出现错误:', error);
  }
}

// 运行初始化
initDatabase();