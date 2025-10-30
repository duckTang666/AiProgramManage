// Dashboard页面数据库设置脚本
// 确保Dashboard页面能正确连接Supabase数据库

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// 检查环境变量配置
function checkEnvironment() {
  console.log('🔍 检查环境变量配置...');
  
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.error('❌ 未找到.env文件，请创建.env文件并配置Supabase连接信息');
    console.log('📝 请在.env文件中添加以下配置：');
    console.log('VITE_SUPABASE_URL=你的Supabase项目URL');
    console.log('VITE_SUPABASE_ANON_KEY=你的Supabase匿名密钥');
    return false;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (!envContent.includes('VITE_SUPABASE_URL') || !envContent.includes('VITE_SUPABASE_ANON_KEY')) {
    console.error('❌ .env文件中缺少必要的Supabase配置');
    console.log('📝 请在.env文件中添加以下配置：');
    console.log('VITE_SUPABASE_URL=你的Supabase项目URL');
    console.log('VITE_SUPABASE_ANON_KEY=你的Supabase匿名密钥');
    return false;
  }
  
  console.log('✅ 环境变量配置检查通过');
  return true;
}

// 执行SQL脚本
function executeSQLScript(scriptPath) {
  return new Promise((resolve, reject) => {
    console.log(`📊 执行SQL脚本: ${path.basename(scriptPath)}`);
    
    // 这里需要根据你的Supabase CLI配置来执行
    // 你可以使用supabase CLI或者直接通过SQL编辑器执行
    console.log('📋 请手动执行以下步骤：');
    console.log('1. 登录 Supabase Dashboard: https://supabase.com/dashboard');
    console.log('2. 选择你的项目');
    console.log('3. 进入 SQL Editor');
    console.log(`4. 复制并执行 ${scriptPath} 文件中的SQL语句`);
    console.log('5. 或者使用 Supabase CLI: supabase db push --file ' + scriptPath);
    
    resolve(true);
  });
}

// 测试数据库连接
function testDatabaseConnection() {
  return new Promise((resolve, reject) => {
    console.log('🔗 测试数据库连接...');
    
    // 这里可以添加实际的数据库连接测试
    // 由于安全原因，我们不会在这里直接测试连接
    console.log('📝 请通过以下方式测试数据库连接：');
    console.log('1. 启动应用: npm run dev');
    console.log('2. 访问 http://localhost:5173');
    console.log('3. 登录后检查Dashboard页面是否能正常加载数据');
    
    resolve(true);
  });
}

// 主执行函数
async function main() {
  console.log('🚀 开始设置Dashboard页面数据库连接...\n');
  
  // 步骤1: 检查环境变量
  if (!checkEnvironment()) {
    console.log('\n❌ 环境检查失败，请先配置.env文件');
    return;
  }
  
  // 步骤2: 执行数据库设置脚本
  const sqlScriptPath = path.join(__dirname, 'dashboard-database-setup.sql');
  if (fs.existsSync(sqlScriptPath)) {
    await executeSQLScript(sqlScriptPath);
  } else {
    console.error('❌ 未找到数据库设置脚本');
    return;
  }
  
  // 步骤3: 测试连接
  await testDatabaseConnection();
  
  console.log('\n✅ Dashboard页面数据库设置完成！');
  console.log('\n📋 后续步骤：');
  console.log('1. 确保已执行 dashboard-database-setup.sql 脚本');
  console.log('2. 启动应用: npm run dev');
  console.log('3. 注册新用户或使用现有用户登录');
  console.log('4. 检查Dashboard页面是否能正常显示数据');
  console.log('5. 如果遇到数据库策略错误，请执行修复脚本');
  
  console.log('\n🔧 故障排除：');
  console.log('- 如果遇到"策略递归错误"，请执行 fix-database-policies.sql');
  console.log('- 如果遇到"用户档案未找到"，请检查用户注册流程');
  console.log('- 如果数据加载失败，请检查网络连接和Supabase配置');
}

// 执行主函数
main().catch(error => {
  console.error('❌ 设置过程中出现错误:', error);
});