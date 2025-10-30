// 生成组织和项目数据并添加到数据库
// 使用修复后的查询语法

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// 创建Supabase客户端
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

// 数据生成器类
class DataGenerator {
  // 生成组织数据
  static generateOrganizations(adminId) {
    return [
      {
        name: '人工智能研究院',
        description: '专注于人工智能前沿技术研究和应用开发',
        owner_id: adminId,
        logo_url: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=200&h=200&fit=crop'
      },
      {
        name: '云计算事业部',
        description: '负责云计算平台建设和云服务产品开发',
        owner_id: adminId,
        logo_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=200&h=200&fit=crop'
      },
      {
        name: '大数据分析中心',
        description: '大数据处理、分析和可视化技术研发',
        owner_id: adminId,
        logo_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&h=200&fit=crop'
      },
      {
        name: '物联网创新实验室',
        description: '物联网设备研发和智能硬件创新',
        owner_id: adminId,
        logo_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop'
      },
      {
        name: '区块链技术团队',
        description: '区块链底层技术和应用场景探索',
        owner_id: adminId,
        logo_url: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=200&h=200&fit=crop'
      }
    ];
  }

  // 生成项目数据
  static generateProjects(adminId, organizationIds) {
    const projects = [];
    
    // 为每个组织生成2-3个项目
    organizationIds.forEach((orgId, index) => {
      const orgProjects = [
        {
          name: `智能${['客服', '推荐', '诊断', '预测', '分析'][index]}系统`,
          description: `基于AI的${['客户服务', '个性化推荐', '医疗诊断', '市场预测', '数据分析'][index]}系统开发`,
          status: 'active',
          priority: 'high',
          progress_percentage: Math.floor(Math.random() * 50) + 30,
          start_date: '2024-03-01',
          end_date: '2024-09-30',
          owner_id: adminId,
          organization_id: orgId
        },
        {
          name: `${['云原生', '微服务', '容器化', 'Serverless', '分布式'][index]}平台重构`,
          description: `重构现有${['云原生', '微服务', '容器化', 'Serverless', '分布式'][index]}平台，提升性能和可扩展性`,
          status: 'planning',
          priority: 'medium',
          progress_percentage: Math.floor(Math.random() * 30) + 10,
          start_date: '2024-04-01',
          end_date: '2024-10-31',
          owner_id: adminId,
          organization_id: orgId
        }
      ];
      
      // 为部分组织添加第三个项目
      if (index % 2 === 0) {
        orgProjects.push({
          name: `${['数据中台', '技术中台', '业务中台', 'AI中台', '开发平台'][index]}建设`,
          description: `建设企业级${['数据', '技术', '业务', 'AI', '开发'][index]}中台，提升研发效率`,
          status: 'active',
          priority: 'urgent',
          progress_percentage: Math.floor(Math.random() * 40) + 20,
          start_date: '2024-02-15',
          end_date: '2024-08-31',
          owner_id: adminId,
          organization_id: orgId
        });
      }
      
      projects.push(...orgProjects);
    });
    
    return projects;
  }

  // 生成任务数据
  static generateTasks(projectIds, userIds) {
    const tasks = [];
    const statuses = ['todo', 'in_progress', 'review', 'done'];
    const priorities = ['low', 'medium', 'high', 'urgent'];
    
    projectIds.forEach(projectId => {
      // 每个项目生成3-5个任务
      const taskCount = Math.floor(Math.random() * 3) + 3;
      
      for (let i = 0; i < taskCount; i++) {
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const priority = priorities[Math.floor(Math.random() * priorities.length)];
        const assigneeId = userIds[Math.floor(Math.random() * userIds.length)];
        
        tasks.push({
          title: `${['需求分析', '技术设计', '功能开发', '单元测试', '集成测试', '文档编写', '性能优化', '代码审查'][i]}任务`,
          description: `完成项目${['需求分析', '技术架构设计', '核心功能开发', '单元测试用例编写', '系统集成测试', '技术文档编写', '性能优化工作', '代码质量审查'][i]}`,
          status: status,
          priority: priority,
          due_date: `2024-${String(Math.floor(Math.random() * 6) + 6).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
          estimated_hours: Math.floor(Math.random() * 40) + 10,
          actual_hours: status === 'done' ? Math.floor(Math.random() * 40) + 10 : null,
          project_id: projectId,
          assignee_id: assigneeId,
          reporter_id: 1 // 管理员作为报告人
        });
      }
    });
    
    return tasks;
  }

  // 插入组织数据
  static async insertOrganizations(organizations) {
    console.log('开始插入组织数据...');
    
    const { data, error } = await supabase
      .from('organizations')
      .insert(organizations)
      .select();
    
    if (error) {
      console.error('❌ 插入组织数据失败:', error);
      throw error;
    }
    
    console.log(`✅ 成功插入 ${data.length} 个组织`);
    return data.map(org => org.id);
  }

  // 插入项目数据
  static async insertProjects(projects) {
    console.log('开始插入项目数据...');
    
    const { data, error } = await supabase
      .from('projects')
      .insert(projects)
      .select();
    
    if (error) {
      console.error('❌ 插入项目数据失败:', error);
      throw error;
    }
    
    console.log(`✅ 成功插入 ${data.length} 个项目`);
    return data.map(project => project.id);
  }

  // 插入任务数据
  static async insertTasks(tasks) {
    console.log('开始插入任务数据...');
    
    const { data, error } = await supabase
      .from('tasks')
      .insert(tasks)
      .select();
    
    if (error) {
      console.error('❌ 插入任务数据失败:', error);
      throw error;
    }
    
    console.log(`✅ 成功插入 ${data.length} 个任务`);
    return data;
  }

  // 获取现有用户ID
  static async getExistingUserIds() {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .neq('role', 'admin'); // 排除管理员
    
    if (error) {
      console.error('❌ 获取用户数据失败:', error);
      throw error;
    }
    
    return data.map(user => user.id);
  }

  // 生成并插入所有数据
  static async generateAndInsertData() {
    console.log('开始生成组织和项目数据...');
    
    try {
      // 获取管理员ID（假设ID为1）
      const adminId = 1;
      
      // 获取现有用户ID
      const userIds = await this.getExistingUserIds();
      console.log(`📊 找到 ${userIds.length} 个可用用户`);
      
      // 生成组织数据
      const organizations = this.generateOrganizations(adminId);
      
      // 插入组织数据
      const organizationIds = await this.insertOrganizations(organizations);
      
      // 生成项目数据
      const projects = this.generateProjects(adminId, organizationIds);
      
      // 插入项目数据
      const projectIds = await this.insertProjects(projects);
      
      // 生成任务数据
      const tasks = this.generateTasks(projectIds, userIds);
      
      // 插入任务数据
      await this.insertTasks(tasks);
      
      console.log('🎉 数据生成完成！');
      
      // 显示统计信息
      await this.showStatistics();
      
    } catch (error) {
      console.error('❌ 数据生成过程出错:', error);
    }
  }

  // 显示统计信息
  static async showStatistics() {
    console.log('\n📊 数据统计:');
    
    const queries = [
      supabase.from('organizations').select('*', { count: 'exact' }),
      supabase.from('projects').select('*', { count: 'exact' }),
      supabase.from('tasks').select('*', { count: 'exact' })
    ];
    
    const results = await Promise.all(queries);
    
    console.log(`🏢 组织总数: ${results[0].count}`);
    console.log(`📁 项目总数: ${results[1].count}`);
    console.log(`📋 任务总数: ${results[2].count}`);
    
    // 显示新生成的组织和项目
    const { data: newOrgs } = await supabase
      .from('organizations')
      .select('name')
      .order('created_at', { ascending: false })
      .limit(5);
    
    const { data: newProjects } = await supabase
      .from('projects')
      .select('name, status, progress_percentage')
      .order('created_at', { ascending: false })
      .limit(5);
    
    console.log('\n🏢 最新创建的组织:');
    newOrgs?.forEach(org => {
      console.log(`   • ${org.name}`);
    });
    
    console.log('\n📁 最新创建的项目:');
    newProjects?.forEach(project => {
      console.log(`   • ${project.name} (${project.status}, ${project.progress_percentage}%)`);
    });
  }
}

// 执行数据生成
async function main() {
  console.log('🚀 AI项目管理平台 - 自动生成组织和项目数据');
  console.log('='.repeat(50));
  
  try {
    // 测试数据库连接
    const { data, error } = await supabase.from('users').select('id').limit(1);
    if (error) {
      console.error('❌ 数据库连接失败，请检查环境变量配置');
      console.log('💡 请确保在 .env 文件中配置了正确的 SUPABASE_URL 和 SUPABASE_ANON_KEY');
      return;
    }
    
    console.log('✅ 数据库连接正常');
    
    // 生成数据
    await DataGenerator.generateAndInsertData();
    
  } catch (error) {
    console.error('❌ 程序执行出错:', error);
  }
}

// 执行主函数
main();