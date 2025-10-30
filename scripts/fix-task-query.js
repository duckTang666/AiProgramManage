// 修复任务数据查询错误
// 问题：tasks表中有多个外键指向users表，需要明确指定关系

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// 创建Supabase客户端
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

// 修复任务查询函数
class TaskQueryFixer {
  // 获取任务详情（明确指定关系）
  static async getTaskById(taskId) {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        project:projects(id, name),
        assignee:users!tasks_assignee_id_fkey(id, display_name, avatar_url),
        reporter:users!tasks_reporter_id_fkey(id, display_name, avatar_url)
      `)
      .eq('id', taskId)
      .single();
    
    if (error) {
      console.error('获取任务详情错误:', error);
      throw error;
    }
    
    return data;
  }

  // 获取项目任务列表（明确指定关系）
  static async getProjectTasks(projectId) {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assignee:users!tasks_assignee_id_fkey(id, display_name, avatar_url),
        reporter:users!tasks_reporter_id_fkey(id, display_name, avatar_url)
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('获取项目任务错误:', error);
      throw error;
    }
    
    return data;
  }

  // 获取用户任务列表（明确指定关系）
  static async getUserTasks(userId) {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        project:projects(id, name, organization_id),
        assignee:users!tasks_assignee_id_fkey(id, display_name, avatar_url),
        reporter:users!tasks_reporter_id_fkey(id, display_name, avatar_url)
      `)
      .eq('assignee_id', userId)
      .order('due_date', { ascending: true });
    
    if (error) {
      console.error('获取用户任务错误:', error);
      throw error;
    }
    
    return data;
  }

  // 测试修复后的查询
  static async testFixedQueries() {
    console.log('开始测试修复后的任务查询...');
    
    try {
      // 测试获取项目任务
      console.log('测试获取项目任务...');
      const projectTasks = await this.getProjectTasks(1);
      console.log(`✅ 成功获取项目任务: ${projectTasks?.length || 0} 个任务`);
      
      // 测试获取用户任务
      console.log('测试获取用户任务...');
      const userTasks = await this.getUserTasks(1);
      console.log(`✅ 成功获取用户任务: ${userTasks?.length || 0} 个任务`);
      
      // 测试获取单个任务详情
      if (projectTasks && projectTasks.length > 0) {
        console.log('测试获取任务详情...');
        const taskDetail = await this.getTaskById(projectTasks[0].id);
        console.log('✅ 成功获取任务详情:', taskDetail?.title);
      }
      
      console.log('🎉 所有查询测试通过！');
      return true;
      
    } catch (error) {
      console.error('❌ 查询测试失败:', error);
      return false;
    }
  }
}

// 执行修复测试
async function runFix() {
  console.log('开始修复任务数据查询错误...');
  
  try {
    // 测试当前连接
    const { data, error } = await supabase.from('tasks').select('id').limit(1);
    if (error) {
      console.error('❌ 数据库连接失败:', error);
      return;
    }
    
    console.log('✅ 数据库连接正常');
    
    // 运行修复测试
    const success = await TaskQueryFixer.testFixedQueries();
    
    if (success) {
      console.log('\n📋 修复后的查询语法示例:');
      console.log(`
// 获取任务详情（明确指定关系）
supabase
  .from('tasks')
  .select(\`
    *,
    project:projects(id, name),
    assignee:users!tasks_assignee_id_fkey(id, display_name, avatar_url),
    reporter:users!tasks_reporter_id_fkey(id, display_name, avatar_url)
  \`)
  .eq('id', taskId)
  .single();

// 获取项目任务列表
supabase
  .from('tasks')
  .select(\`
    *,
    assignee:users!tasks_assignee_id_fkey(id, display_name, avatar_url),
    reporter:users!tasks_reporter_id_fkey(id, display_name, avatar_url)
  \`)
  .eq('project_id', projectId);

// 获取用户任务列表
supabase
  .from('tasks')
  .select(\`
    *,
    project:projects(id, name, organization_id),
    assignee:users!tasks_assignee_id_fkey(id, display_name, avatar_url),
    reporter:users!tasks_reporter_id_fkey(id, display_name, avatar_url)
  \`)
  .eq('assignee_id', userId);
      `);
    }
    
  } catch (error) {
    console.error('❌ 修复过程出错:', error);
  }
}

// 执行修复
runFix();