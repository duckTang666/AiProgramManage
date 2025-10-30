// AI项目管理平台 - 自动生成更多组织和项目数据
// 用于扩展数据库中的测试数据

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// 初始化Supabase客户端
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 请检查.env文件中的Supabase配置');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 新的组织数据
const newOrganizations = [
  {
    name: '云计算创新中心',
    description: '专注于云计算技术研究和应用创新',
    logo_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=200&h=200&fit=crop'
  },
  {
    name: '区块链技术实验室',
    description: '区块链技术研发与应用探索',
    logo_url: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=200&h=200&fit=crop'
  },
  {
    name: '物联网事业部',
    description: '物联网设备连接与数据采集解决方案',
    logo_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop'
  },
  {
    name: '前端技术中心',
    description: '前端技术架构与用户体验优化',
    logo_url: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=200&h=200&fit=crop'
  },
  {
    name: '后端架构组',
    description: '后端系统架构设计与性能优化',
    logo_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=200&h=200&fit=crop'
  }
];

// 新的项目数据
const newProjects = [
  {
    name: '云原生应用平台',
    description: '基于Kubernetes的云原生应用部署和管理平台',
    status: 'active',
    priority: 'high',
    progress_percentage: 40,
    start_date: '2024-03-01',
    end_date: '2024-09-30'
  },
  {
    name: '智能合约开发框架',
    description: '区块链智能合约开发工具和框架',
    status: 'planning',
    priority: 'medium',
    progress_percentage: 15,
    start_date: '2024-04-01',
    end_date: '2024-10-31'
  },
  {
    name: '物联网设备管理平台',
    description: '物联网设备连接、监控和管理平台',
    status: 'active',
    priority: 'high',
    progress_percentage: 55,
    start_date: '2024-02-15',
    end_date: '2024-07-31'
  },
  {
    name: '微前端架构升级',
    description: '现有前端系统向微前端架构迁移',
    status: 'active',
    priority: 'medium',
    progress_percentage: 70,
    start_date: '2024-01-20',
    end_date: '2024-05-15'
  },
  {
    name: '高并发API网关',
    description: '支持高并发访问的API网关系统',
    status: 'active',
    priority: 'urgent',
    progress_percentage: 85,
    start_date: '2024-01-10',
    end_date: '2024-04-30'
  },
  {
    name: '数据可视化大屏',
    description: '企业级数据可视化展示大屏',
    status: 'active',
    priority: 'medium',
    progress_percentage: 60,
    start_date: '2024-02-01',
    end_date: '2024-06-30'
  },
  {
    name: '移动端性能优化',
    description: '移动端应用性能监控和优化工具',
    status: 'planning',
    priority: 'low',
    progress_percentage: 10,
    start_date: '2024-05-01',
    end_date: '2024-11-30'
  },
  {
    name: 'AI代码助手',
    description: '基于AI的代码自动生成和优化工具',
    status: 'active',
    priority: 'high',
    progress_percentage: 35,
    start_date: '2024-03-15',
    end_date: '2024-08-31'
  }
];

// 新的任务数据
const newTasks = [
  { title: 'Kubernetes集群部署', description: '部署生产环境的Kubernetes集群', status: 'todo', priority: 'high', estimated_hours: 40 },
  { title: 'Docker镜像构建', description: '构建应用Docker镜像并推送到仓库', status: 'in_progress', priority: 'medium', estimated_hours: 25 },
  { title: '智能合约安全审计', description: '对智能合约代码进行安全审计', status: 'todo', priority: 'urgent', estimated_hours: 35 },
  { title: '设备连接协议开发', description: '开发物联网设备连接通信协议', status: 'in_progress', priority: 'high', estimated_hours: 50 },
  { title: '微前端路由设计', description: '设计微前端架构的路由方案', status: 'done', priority: 'medium', estimated_hours: 30 },
  { title: 'API限流算法实现', description: '实现API网关的限流算法', status: 'in_progress', priority: 'high', estimated_hours: 45 },
  { title: '数据图表组件开发', description: '开发可复用的数据图表组件', status: 'todo', priority: 'medium', estimated_hours: 35 },
  { title: '性能监控SDK集成', description: '集成移动端性能监控SDK', status: 'planning', priority: 'low', estimated_hours: 20 },
  { title: 'AI模型训练', description: '训练代码生成AI模型', status: 'in_progress', priority: 'high', estimated_hours: 60 },
  { title: '代码质量检查', description: '实施代码质量检查和规范', status: 'todo', priority: 'medium', estimated_hours: 25 }
];

async function generateMoreData() {
  console.log('🚀 开始生成更多组织和项目数据...\n');

  try {
    // 1. 获取系统管理员用户ID
    const { data: adminUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'admin@aiproject.com')
      .single();

    if (userError || !adminUser) {
      console.error('❌ 获取管理员用户失败:', userError?.message);
      return;
    }

    const adminUserId = adminUser.id;
    console.log(`✅ 获取到管理员用户ID: ${adminUserId}`);

    // 2. 插入新的组织数据
    console.log('📋 插入新的组织数据...');
    const organizationResults = [];
    
    for (const orgData of newOrganizations) {
      const { data: org, error } = await supabase
        .from('organizations')
        .insert([{
          ...orgData,
          owner_id: adminUserId
        }])
        .select()
        .single();

      if (error) {
        console.log(`   ⚠️  组织"${orgData.name}"插入失败:`, error.message);
      } else {
        console.log(`   ✅ 组织"${org.name}"创建成功 (ID: ${org.id})`);
        organizationResults.push(org);
      }
    }

    // 3. 为每个新组织插入项目数据
    console.log('\n📋 为每个组织插入项目数据...');
    const projectResults = [];
    
    for (let i = 0; i < organizationResults.length; i++) {
      const org = organizationResults[i];
      const projectData = newProjects[i];
      
      if (projectData) {
        const { data: project, error } = await supabase
          .from('projects')
          .insert([{
            ...projectData,
            owner_id: adminUserId,
            organization_id: org.id
          }])
          .select()
          .single();

        if (error) {
          console.log(`   ⚠️  项目"${projectData.name}"插入失败:`, error.message);
        } else {
          console.log(`   ✅ 项目"${project.name}"创建成功 (组织: ${org.name})`);
          projectResults.push(project);

          // 4. 为项目添加成员
          await supabase
            .from('project_members')
            .insert([{
              project_id: project.id,
              user_id: adminUserId,
              role: 'owner'
            }]);

          // 5. 为项目添加任务
          const taskData = newTasks[i];
          if (taskData) {
            const { data: task, error: taskError } = await supabase
              .from('tasks')
              .insert([{
                ...taskData,
                project_id: project.id,
                assignee_id: adminUserId,
                reporter_id: adminUserId,
                due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
              }])
              .select()
              .single();

            if (!taskError) {
              console.log(`      📝 任务"${task.title}"创建成功`);
            }
          }
        }
      }
    }

    // 6. 生成一些额外的项目到现有组织
    console.log('\n📋 为现有组织添加额外项目...');
    
    // 获取现有组织
    const { data: existingOrgs, error: orgsError } = await supabase
      .from('organizations')
      .select('id, name')
      .limit(3);

    if (!orgsError && existingOrgs) {
      const extraProjects = newProjects.slice(organizationResults.length);
      
      for (let i = 0; i < Math.min(extraProjects.length, existingOrgs.length); i++) {
        const org = existingOrgs[i];
        const projectData = extraProjects[i];
        
        const { data: project, error } = await supabase
          .from('projects')
          .insert([{
            ...projectData,
            owner_id: adminUserId,
            organization_id: org.id
          }])
          .select()
          .single();

        if (!error) {
          console.log(`   ✅ 额外项目"${project.name}"创建成功 (组织: ${org.name})`);
          
          // 添加项目成员
          await supabase
            .from('project_members')
            .insert([{
              project_id: project.id,
              user_id: adminUserId,
              role: 'owner'
            }]);
        }
      }
    }

    // 7. 验证数据生成结果
    console.log('\n📊 数据生成结果统计:');
    
    const stats = await Promise.all([
      supabase.from('organizations').select('id', { count: 'exact' }),
      supabase.from('projects').select('id', { count: 'exact' }),
      supabase.from('tasks').select('id', { count: 'exact' })
    ]);

    console.log(`   组织总数: ${stats[0].count}`);
    console.log(`   项目总数: ${stats[1].count}`);
    console.log(`   任务总数: ${stats[2].count}`);

    console.log('\n🎉 数据生成完成！');
    console.log('💡 现在可以在前端页面查看新生成的组织和项目数据了。');

  } catch (error) {
    console.error('❌ 数据生成过程中出现错误:', error);
  }
}

// 执行数据生成
if (require.main === module) {
  generateMoreData();
}

module.exports = { generateMoreData };