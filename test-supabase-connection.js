// Supabase数据库连接测试脚本
import { createClient } from '@supabase/supabase-js';

// 配置信息
const supabaseUrl = 'https://pgnjxsvtxrqsuukadlzu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnbmp4c3Z0eHJxc3V1a2FkbHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MTQ5NjYsImV4cCI6MjA3NzE5MDk2Nn0.kw0yn1Wnn4GzkXbPYRUcTjyQr6esb-BED5h-OdFiEMI';

// 创建Supabase客户端
const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔗 测试Supabase数据库连接...\n');
  
  try {
    // 1. 测试认证连接
    console.log('1. 测试认证连接...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.log('   ⚠️ 认证连接测试失败:', authError.message);
    } else {
      console.log('   ✅ 认证连接正常');
    }
    
    // 2. 测试数据库查询
    console.log('\n2. 测试数据库查询...');
    
    // 测试用户表查询
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError) {
      console.log('   ⚠️ 用户表查询失败:', usersError.message);
    } else {
      console.log('   ✅ 用户表查询正常，数据条数:', usersData.length);
    }
    
    // 测试组织表查询
    const { data: orgsData, error: orgsError } = await supabase
      .from('organizations')
      .select('*')
      .limit(1);
    
    if (orgsError) {
      console.log('   ⚠️ 组织表查询失败:', orgsError.message);
    } else {
      console.log('   ✅ 组织表查询正常，数据条数:', orgsData.length);
    }
    
    // 3. 测试数据插入
    console.log('\n3. 测试数据插入...');
    
    const testUser = {
      email: 'test@example.com',
      password_hash: '$2b$10$testhash',
      display_name: '测试用户',
      role: 'member'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert(testUser)
      .select();
    
    if (insertError) {
      console.log('   ⚠️ 数据插入测试失败:', insertError.message);
    } else {
      console.log('   ✅ 数据插入正常，插入ID:', insertData[0].id);
      
      // 清理测试数据
      await supabase
        .from('users')
        .delete()
        .eq('email', 'test@example.com');
      console.log('   ✅ 测试数据清理完成');
    }
    
    // 4. 测试所有表结构
    console.log('\n4. 检查表结构...');
    
    const tables = [
      'users', 'organizations', 'projects', 'project_members', 
      'tasks', 'chat_history', 'documents', 'notifications', 
      'invitations', 'organization_members'
    ];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1);
      
      if (error) {
        console.log(`   ❌ ${table} 表不存在或无法访问:`, error.message);
      } else {
        console.log(`   ✅ ${table} 表访问正常`);
      }
    }
    
    console.log('\n🎉 Supabase数据库连接测试完成！');
    console.log('\n📋 下一步操作：');
    console.log('1. 在Supabase控制台中执行 supabase-init.sql 文件');
    console.log('2. 运行 npm run dev 启动开发服务器');
    console.log('3. 访问 http://localhost:5173 测试应用');
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error.message);
    console.log('\n🔧 故障排除建议：');
    console.log('1. 检查网络连接');
    console.log('2. 验证Supabase URL和API Key是否正确');
    console.log('3. 检查Supabase项目是否已启用');
    console.log('4. 确认数据库表是否已创建');
  }
}

// 运行测试
testConnection();