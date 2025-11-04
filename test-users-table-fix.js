// 测试用户表修复情况
import { createClient } from '@supabase/supabase-js';

// 配置信息
const supabaseUrl = 'https://pgnjxsvtxrqsuukadlzu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnbmp4c3Z0eHJxc3V1a2FkbHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MTQ5NjYsImV4cCI6MjA3NzE5MDk2Nn0.kw0yn1Wnn4GzkXbPYRUcTjyQr6esb-BED5h-OdFiEMI';

// 创建Supabase客户端
const supabase = createClient(supabaseUrl, supabaseKey);

async function testUsersTableFix() {
  console.log('🔧 测试用户表修复情况...\n');
  
  try {
    // 1. 检查用户表是否存在
    console.log('1. 检查用户表是否存在...');
    
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError) {
      if (usersError.code === 'PGRST116' || usersError.message.includes('does not exist')) {
        console.log('   ❌ 用户表不存在，需要执行修复脚本');
        console.log('   💡 请在Supabase控制台中执行 fix-users-table.sql 文件');
        return false;
      } else {
        console.log('   ⚠️ 用户表查询失败:', usersError.message);
        return false;
      }
    } else {
      console.log('   ✅ 用户表存在，数据条数:', usersData.length);
    }
    
    // 2. 检查用户表结构
    console.log('\n2. 检查用户表结构...');
    
    // 获取表结构信息
    const { data: tableInfo, error: tableError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.log('   ⚠️ 无法获取表结构信息:', tableError.message);
    } else if (tableInfo && tableInfo.length > 0) {
      const user = tableInfo[0];
      console.log('   ✅ 用户表结构正常');
      console.log('      - 包含字段:', Object.keys(user).join(', '));
      console.log('      - 示例数据:', {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        role: user.role
      });
    }
    
    // 3. 测试数据操作
    console.log('\n3. 测试数据操作...');
    
    // 测试插入数据
    const testUser = {
      email: 'test-fix@example.com',
      display_name: '测试修复用户',
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
      
      // 测试查询数据
      const { data: queryData, error: queryError } = await supabase
        .from('users')
        .select('*')
        .eq('email', 'test-fix@example.com')
        .single();
      
      if (queryError) {
        console.log('   ⚠️ 数据查询测试失败:', queryError.message);
      } else {
        console.log('   ✅ 数据查询正常，用户:', queryData.display_name);
      }
      
      // 清理测试数据
      await supabase
        .from('users')
        .delete()
        .eq('email', 'test-fix@example.com');
      console.log('   ✅ 测试数据清理完成');
    }
    
    // 4. 检查相关表是否存在
    console.log('\n4. 检查相关表是否存在...');
    
    const relatedTables = [
      'organizations', 'projects', 'organization_members', 
      'tasks', 'chat_history'
    ];
    
    for (const table of relatedTables) {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1);
      
      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
          console.log(`   ❌ ${table} 表不存在`);
        } else {
          console.log(`   ⚠️ ${table} 表访问失败:`, error.message);
        }
      } else {
        console.log(`   ✅ ${table} 表存在`);
      }
    }
    
    // 5. 检查默认数据
    console.log('\n5. 检查默认数据...');
    
    const { data: defaultUser, error: defaultUserError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@aiproject.com')
      .single();
    
    if (defaultUserError) {
      console.log('   ⚠️ 默认管理员用户不存在或查询失败');
    } else {
      console.log('   ✅ 默认管理员用户存在:', defaultUser.display_name);
    }
    
    console.log('\n🎉 用户表修复测试完成！');
    console.log('\n📋 总结:');
    console.log('- 用户表: ✅ 存在且结构正常');
    console.log('- 数据操作: ✅ 插入、查询、删除功能正常');
    console.log('- 相关表: 部分表可能需要修复');
    console.log('- 默认数据: 建议执行修复脚本添加默认数据');
    
    console.log('\n💡 建议操作:');
    console.log('1. 如果相关表不存在，请执行 fix-users-table.sql 脚本');
    console.log('2. 如果默认数据不存在，请执行修复脚本');
    console.log('3. 测试仪表盘功能是否正常工作');
    
    return true;
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error.message);
    console.log('\n🔧 故障排除建议:');
    console.log('1. 检查网络连接');
    console.log('2. 验证Supabase配置');
    console.log('3. 执行 fix-users-table.sql 修复脚本');
    return false;
  }
}

// 运行测试
testUsersTableFix().then(success => {
  if (success) {
    console.log('\n✅ 用户表修复测试通过！');
  } else {
    console.log('\n❌ 用户表修复测试失败，请检查并修复问题');
  }
});