// 测试创建项目功能，诊断为什么项目不能保存到数据库

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// 创建Supabase客户端
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

// 测试创建项目功能
class ProjectCreationTester {
  // 测试数据库连接
  static async testConnection() {
    console.log('🔍 测试数据库连接...');
    
    try {
      const { data, error } = await supabase.from('users').select('id').limit(1);
      
      if (error) {
        console.error('❌ 数据库连接失败:', error);
        return false;
      }
      
      console.log('✅ 数据库连接正常');
      return true;
      
    } catch (error) {
      console.error('❌ 连接测试异常:', error);
      return false;
    }
  }

  // 检查表结构
  static async checkTableStructure() {
    console.log('\n🔍 检查表结构...');
    
    try {
      // 检查projects表是否存在
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .limit(1);
      
      if (projectsError) {
        console.error('❌ projects表查询失败:', projectsError);
        return false;
      }
      
      console.log('✅ projects表存在');
      
      // 检查表字段
      if (projects && projects.length > 0) {
        console.log('📋 projects表字段:', Object.keys(projects[0]));
      }
      
      return true;
      
    } catch (error) {
      console.error('❌ 表结构检查异常:', error);
      return false;
    }
  }

  // 测试创建项目
  static async testCreateProject() {
    console.log('\n🔍 测试创建项目...');
    
    try {
      // 获取一个存在的组织ID和用户ID
      const { data: organizations } = await supabase
        .from('organizations')
        .select('id')
        .limit(1);
      
      const { data: users } = await supabase
        .from('users')
        .select('id')
        .limit(1);
      
      if (!organizations || organizations.length === 0) {
        console.error('❌ 没有找到组织，无法测试');
        return false;
      }
      
      if (!users || users.length === 0) {
        console.error('❌ 没有找到用户，无法测试');
        return false;
      }
      
      const organizationId = organizations[0].id;
      const userId = users[0].id;
      
      console.log(`📊 使用组织ID: ${organizationId}, 用户ID: ${userId}`);
      
      // 测试创建项目
      const testProjectData = {
        name: `测试项目-${Date.now()}`,
        description: '这是一个测试项目',
        organization_id: organizationId,
        owner_id: userId,
        status: 'active',
        priority: 'medium',
        progress_percentage: 0
      };
      
      console.log('📝 测试项目数据:', testProjectData);
      
      const { data, error } = await supabase
        .from('projects')
        .insert([testProjectData])
        .select()
        .single();
      
      if (error) {
        console.error('❌ 创建项目失败:', error);
        
        // 分析错误原因
        if (error.code === '23505') {
          console.error('💡 错误原因: 项目名称已存在');
        } else if (error.code === '23503') {
          console.error('💡 错误原因: 外键约束失败（组织或用户不存在）');
        } else if (error.code === '42501') {
          console.error('💡 错误原因: 权限不足');
        } else if (error.code === 'PGRST201') {
          console.error('💡 错误原因: 关系查询错误');
        }
        
        return false;
      }
      
      console.log('✅ 创建项目成功:', data);
      
      // 验证项目是否真的保存了
      const { data: verifyData, error: verifyError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', data.id)
        .single();
      
      if (verifyError) {
        console.error('❌ 验证项目保存失败:', verifyError);
        return false;
      }
      
      console.log('✅ 项目保存验证成功:', verifyData);
      
      return true;
      
    } catch (error) {
      console.error('❌ 创建项目测试异常:', error);
      return false;
    }
  }

  // 检查数据库权限
  static async checkPermissions() {
    console.log('\n🔍 检查数据库权限...');
    
    try {
      // 尝试插入一条记录
      const { error } = await supabase
        .from('projects')
        .insert([{
          name: '权限测试项目',
          organization_id: 1,
          owner_id: 1
        }])
        .select();
      
      if (error) {
        console.error('❌ 插入权限检查失败:', error);
        
        if (error.code === '42501') {
          console.error('💡 权限问题: RLS（行级安全）策略阻止了插入操作');
          console.log('💡 解决方案: 检查并配置适当的RLS策略');
        }
        
        return false;
      }
      
      console.log('✅ 插入权限正常');
      return true;
      
    } catch (error) {
      console.error('❌ 权限检查异常:', error);
      return false;
    }
  }

  // 运行完整测试
  static async runFullTest() {
    console.log('🚀 开始创建项目功能诊断测试');
    console.log('='.repeat(50));
    
    const tests = [
      { name: '数据库连接', func: this.testConnection },
      { name: '表结构检查', func: this.checkTableStructure },
      { name: '权限检查', func: this.checkPermissions },
      { name: '创建项目测试', func: this.testCreateProject }
    ];
    
    let allPassed = true;
    
    for (const test of tests) {
      const passed = await test.func.call(this);
      allPassed = allPassed && passed;
      
      if (!passed) {
        console.log(`\n❌ ${test.name} 测试失败`);
        break;
      } else {
        console.log(`✅ ${test.name} 测试通过`);
      }
      
      console.log('');
    }
    
    console.log('='.repeat(50));
    
    if (allPassed) {
      console.log('🎉 所有测试通过！创建项目功能正常');
      console.log('💡 问题可能出现在前端代码或数据传递过程中');
    } else {
      console.log('❌ 测试失败，请检查上述错误信息');
    }
    
    return allPassed;
  }
}

// 执行测试
async function main() {
  try {
    await ProjectCreationTester.runFullTest();
  } catch (error) {
    console.error('❌ 测试执行出错:', error);
  }
}

main();