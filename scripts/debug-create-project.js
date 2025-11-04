// 调试创建项目功能，查看实际数据库状态

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// 创建Supabase客户端
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

// 调试创建项目功能
class ProjectCreationDebugger {
  // 查看当前数据库中的项目
  static async listAllProjects() {
    console.log('🔍 查看数据库中的所有项目...');
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ 查询项目失败:', error);
        return [];
      }
      
      console.log(`📊 数据库中共有 ${data.length} 个项目:`);
      data.forEach((project, index) => {
        console.log(`${index + 1}. ${project.name} (ID: ${project.id}, 组织: ${project.organization_id}, 状态: ${project.status})`);
      });
      
      return data;
      
    } catch (error) {
      console.error('❌ 查询项目异常:', error);
      return [];
    }
  }

  // 测试创建项目并详细调试
  static async debugCreateProject() {
    console.log('\n🔍 详细调试创建项目过程...');
    
    try {
      // 获取一个存在的组织ID和用户ID
      const { data: organizations } = await supabase
        .from('organizations')
        .select('id, name')
        .limit(1);
      
      const { data: users } = await supabase
        .from('users')
        .select('id, display_name')
        .limit(1);
      
      if (!organizations || organizations.length === 0) {
        throw new Error('没有找到组织，无法测试');
      }
      
      if (!users || users.length === 0) {
        throw new Error('没有找到用户，无法测试');
      }
      
      const organization = organizations[0];
      const user = users[0];
      
      console.log(`📊 使用组织: ${organization.name} (ID: ${organization.id})`);
      console.log(`📊 使用用户: ${user.display_name} (ID: ${user.id})`);
      
      // 测试创建项目
      const testProjectData = {
        name: `调试测试项目-${Date.now()}`,
        description: '这是一个调试测试项目',
        organization_id: organization.id,
        owner_id: user.id,
        status: 'active',
        priority: 'medium',
        progress_percentage: 0
      };
      
      console.log('📝 测试项目数据:', testProjectData);
      
      // 直接使用Supabase插入
      console.log('\n🔍 直接使用Supabase插入项目...');
      const { data: insertedData, error: insertError } = await supabase
        .from('projects')
        .insert([testProjectData])
        .select()
        .single();
      
      if (insertError) {
        console.error('❌ 插入项目失败:', insertError);
        
        // 分析错误原因
        if (insertError.code === '23505') {
          console.error('💡 错误原因: 项目名称已存在');
        } else if (insertError.code === '23503') {
          console.error('💡 错误原因: 外键约束失败（组织或用户不存在）');
          
          // 验证组织是否存在
          const { data: orgCheck } = await supabase
            .from('organizations')
            .select('id')
            .eq('id', testProjectData.organization_id);
          console.log(`💡 组织验证: ${orgCheck?.length ? '存在' : '不存在'}`);
          
          // 验证用户是否存在
          const { data: userCheck } = await supabase
            .from('users')
            .select('id')
            .eq('id', testProjectData.owner_id);
          console.log(`💡 用户验证: ${userCheck?.length ? '存在' : '不存在'}`);
          
        } else if (insertError.code === '42501') {
          console.error('💡 错误原因: 权限不足');
        }
        
        return false;
      }
      
      console.log('✅ 项目插入成功:', insertedData);
      
      // 立即验证项目是否真的保存了
      console.log('\n🔍 立即验证项目保存...');
      const { data: verifyData, error: verifyError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', insertedData.id)
        .single();
      
      if (verifyError) {
        console.error('❌ 验证项目保存失败:', verifyError);
        
        // 尝试使用非single查询
        const { data: multiData } = await supabase
          .from('projects')
          .select('*')
          .eq('id', insertedData.id);
        
        console.log('💡 使用非single查询结果:', multiData);
        
        return false;
      }
      
      console.log('✅ 项目保存验证成功:', verifyData);
      
      return true;
      
    } catch (error) {
      console.error('❌ 调试过程异常:', error);
      return false;
    }
  }

  // 检查数据库表结构
  static async checkTableStructure() {
    console.log('\n🔍 检查projects表结构...');
    
    try {
      // 获取表的前几行数据来查看结构
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .limit(3);
      
      if (error) {
        console.error('❌ 查询表结构失败:', error);
        return false;
      }
      
      if (data && data.length > 0) {
        console.log('📋 projects表字段结构:');
        const firstRow = data[0];
        Object.keys(firstRow).forEach(key => {
          console.log(`   ${key}: ${typeof firstRow[key]} = ${firstRow[key]}`);
        });
      }
      
      return true;
      
    } catch (error) {
      console.error('❌ 表结构检查异常:', error);
      return false;
    }
  }

  // 运行完整调试
  static async runFullDebug() {
    console.log('🚀 开始创建项目功能详细调试');
    console.log('='.repeat(50));
    
    try {
      // 测试数据库连接
      const { data, error } = await supabase.from('users').select('id').limit(1);
      if (error) {
        console.error('❌ 数据库连接失败:', error);
        return;
      }
      
      console.log('✅ 数据库连接正常');
      
      // 查看当前项目
      await this.listAllProjects();
      
      // 检查表结构
      await this.checkTableStructure();
      
      // 调试创建项目
      const success = await this.debugCreateProject();
      
      // 再次查看项目列表
      console.log('\n🔍 创建后的项目列表:');
      await this.listAllProjects();
      
      if (success) {
        console.log('\n🎉 调试完成！创建项目功能正常');
      } else {
        console.log('\n❌ 调试发现存在问题');
      }
      
    } catch (error) {
      console.error('❌ 调试过程出错:', error);
    }
  }
}

// 执行调试
async function main() {
  await ProjectCreationDebugger.runFullDebug();
}

main();