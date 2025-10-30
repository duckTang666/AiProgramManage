// Supabase认证系统测试脚本
// 用于验证登录和注册功能是否正常工作

const { createClient } = require('@supabase/supabase-js');

// 配置信息 - 请确保这些值与您的.env文件一致
const supabaseUrl = 'https://pgnjxsvtxrqsuukadlzu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnbmp4c3Z0eHJxc3V1a2FkbHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MTQ5NjYsImV4cCI6MjA3NzE5MDk2Nn0.kw0yn1Wnn4GzkXbPYRUcTjyQr6esb-BED5h-OdFiEMI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
    console.log('=== Supabase认证系统测试 ===\n');
    
    try {
        // 1. 测试连接
        console.log('1. 测试Supabase连接...');
        const { data: session, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
            console.error('❌ 连接失败:', sessionError.message);
            return;
        }
        console.log('✅ 连接成功');
        
        // 2. 测试注册功能
        console.log('\n2. 测试注册功能...');
        const testEmail = `test${Date.now()}@example.com`;
        const testPassword = 'Test123456!';
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword,
            options: {
                data: {
                    name: '测试用户'
                }
            }
        });
        
        if (signUpError) {
            console.error('❌ 注册失败:', signUpError.message);
        } else {
            console.log('✅ 注册成功');
            console.log('   用户ID:', signUpData.user?.id);
            console.log('   邮箱:', signUpData.user?.email);
        }
        
        // 3. 测试登录功能
        console.log('\n3. 测试登录功能...');
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: testEmail,
            password: testPassword
        });
        
        if (signInError) {
            console.error('❌ 登录失败:', signInError.message);
        } else {
            console.log('✅ 登录成功');
            console.log('   会话用户ID:', signInData.user?.id);
            console.log('   访问令牌:', signInData.session?.access_token?.substring(0, 20) + '...');
        }
        
        // 4. 测试用户档案查询
        console.log('\n4. 测试用户档案查询...');
        if (signInData.user) {
            const { data: profileData, error: profileError } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', signInData.user.id)
                .single();
            
            if (profileError) {
                console.error('❌ 用户档案查询失败:', profileError.message);
            } else {
                console.log('✅ 用户档案查询成功');
                console.log('   显示名称:', profileData.display_name);
                console.log('   角色:', profileData.role);
            }
        }
        
        // 5. 测试登出
        console.log('\n5. 测试登出功能...');
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) {
            console.error('❌ 登出失败:', signOutError.message);
        } else {
            console.log('✅ 登出成功');
        }
        
        console.log('\n=== 测试完成 ===');
        
    } catch (error) {
        console.error('❌ 测试过程中发生错误:', error);
    }
}

// 运行测试
testAuth();