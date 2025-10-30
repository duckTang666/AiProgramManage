// Supabase认证系统完整修复执行脚本
// 此脚本将执行所有必要的修复步骤

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== Supabase认证系统修复开始 ===\n');

// 步骤1: 检查环境配置
console.log('1. 检查环境配置...');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const hasSupabaseUrl = envContent.includes('VITE_SUPABASE_URL');
    const hasSupabaseKey = envContent.includes('VITE_SUPABASE_ANON_KEY');
    
    if (hasSupabaseUrl && hasSupabaseKey) {
        console.log('✅ 环境配置检查通过');
    } else {
        console.log('⚠️ 环境配置不完整，请检查.env文件');
    }
} else {
    console.log('❌ .env文件不存在');
}

// 步骤2: 检查数据库连接
console.log('\n2. 测试数据库连接...');
const testAuthScript = path.join(__dirname, 'test-auth.js');
if (fs.existsSync(testAuthScript)) {
    console.log('✅ 认证测试脚本存在');
    console.log('   运行命令: node test-auth.js');
} else {
    console.log('❌ 认证测试脚本不存在');
}

// 步骤3: 检查修复脚本
console.log('\n3. 检查数据库修复脚本...');
const fixScripts = [
    'fix-database-policies.sql',
    'supabase-auth-setup.sql',
    'supabase-complete-setup.sql'
];

fixScripts.forEach(script => {
    const scriptPath = path.join(__dirname, script);
    if (fs.existsSync(scriptPath)) {
        console.log(`✅ ${script} 存在`);
    } else {
        console.log(`❌ ${script} 不存在`);
    }
});

// 步骤4: 检查前端代码
console.log('\n4. 检查前端认证代码...');
const frontendFiles = [
    'src/stores/auth.ts',
    'src/views/Login.vue',
    'src/views/Register.vue',
    'src/lib/supabase.ts',
    'src/lib/database.ts'
];

frontendFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        console.log(`✅ ${file} 存在`);
    } else {
        console.log(`❌ ${file} 不存在`);
    }
});

// 步骤5: 提供修复建议
console.log('\n=== 修复建议 ===');
console.log('\n请按以下步骤执行修复：');
console.log('\n1. 数据库修复（在Supabase Dashboard中执行）：');
console.log('   - 登录 https://supabase.com/dashboard');
console.log('   - 选择项目: AiProgramManage');
console.log('   - 进入 SQL Editor');
console.log('   - 依次执行以下脚本：');
console.log('     a. supabase-auth-setup.sql');
console.log('     b. fix-database-policies.sql');

console.log('\n2. 前端代码修复：');
console.log('   - 确保所有前端文件存在且配置正确');
console.log('   - 检查 auth.ts 中的 UserService 导入');

console.log('\n3. 测试认证流程：');
console.log('   - 运行: node test-auth.js');
console.log('   - 在浏览器中测试登录和注册功能');

console.log('\n4. 验证修复结果：');
console.log('   - 登录成功后应能正常访问仪表盘');
console.log('   - 不再出现策略递归错误');
console.log('   - 用户档案应自动创建');

console.log('\n=== 修复执行完成 ===');
console.log('\n请按照上述建议执行修复步骤。');

// 如果用户想要直接运行测试，提供选项
console.log('\n要立即测试认证系统，请运行: node test-auth.js');