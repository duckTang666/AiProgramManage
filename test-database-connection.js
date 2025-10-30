// 数据库连接测试脚本
const { createClient } = require('@supabase/supabase-js');

// 从环境变量获取配置
const supabaseUrl = 'https://pgnjxsvtxrqsuukadlzu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnbmp4c3Z0eHJxc3V1a2FkbHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MTQ5NjYsImV4cCI6MjA3NzE5MDk2Nn0.kw0yn1Wnn4GzkXbPYRUcTjyQr6esb-BED5h-OdFiEMI';

// 创建Supabase客户端
const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔗 测试Supabase数据库连接...');
  
  try {
    // 测试认证连接
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('❌ 认证连接失败:', authError.message);
      return false;
    }
    
    console.log('✅ 认证连接成功');
    
    // 测试数据库查询（如果表已存在）
    const { data: tableData, error: tableError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);
    
    if (tableError && tableError.code !== 'PGRST116') { // PGRST116表示表不存在
      console.error('❌ 数据库查询失败:', tableError.message);
      return false;
    }
    
    console.log('✅ 数据库查询成功');
    console.log('📊 当前用户会话:', authData.session ? '已登录' : '未登录');
    
    return true;
    
  } catch (error) {
    console.error('❌ 连接测试失败:', error.message);
    return false;
  }
}

// 运行测试
testConnection().then(success => {
  if (success) {
    console.log('🎉 数据库连接测试完成 - 所有检查通过！');
  } else {
    console.log('💥 数据库连接测试失败 - 请检查配置');
  }
});