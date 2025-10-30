// AI项目管理平台 - 使用数据库服务生成数据
// 通过调用现有的数据库服务类来生成组织和项目数据

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// 初始化Supabase客户端
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 请检查.env文件中的Supabase配置');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 模拟数据库服务类的方法
class DataGenerator {
  static async getAdminUserId() {
    // 获取管理员用户ID
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'admin@aiproject.com')
      .single();
    
    if (error) {
      console.error('获取管理员用户失败:', error);
      return 1; // 默认使用ID 1
    }
    
    return data.id;
  }

  static async createOrganization(name, description, ownerId) {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .insert([{
          name: name,
          description: description,
          owner_id: ownerId,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) {
        if (error.code === '23505') {
          console.log(`组织 "${name}" 已存在，跳过创建`);
          return null;
        }
        throw error;
      }
      
      console.log(`✅ 组织 "${name}" 创建成功 (ID: ${data.id})`);
      return data;
    } catch (error) {
      console.error(`创建组织 "${name}" 失败:`, error.message);
      return null;
    }
  }

  static async createProject(name, description, organizationId, ownerId, status = 'active', priority = 'medium', progress = 0) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          name: name,
          description: description,
          organization_id: organizationId,
          owner_id: ownerId,
          status: status,
          priority: priority,
          progress_percentage: progress,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) {
        if (error.code === '23505') {
          console.log(`项目 "${name}" 已存在，跳过创建`);
          return null;
        }
        throw error;
      }
      
      console.log(`✅ 项目 "${name}" 创建成功 (组织ID: ${organizationId})`);
      
      // 自动添加项目成员
      await this.addProjectMember(data.id, ownerId, 'owner');
      
      return data;
    } catch (error) {
      console.error(`创建项目 "${name}" 失败:`, error.message);
      return null;
    }
  }

  static async addProjectMember(projectId, userId, role = 'member') {
    try {
      const { error } = await supabase
        .from('project_members')
        .insert([{
          project_id: projectId,
          user_id: userId,
          role: role,
          created_at: new Date().toISOString()
        }]);
      
      if (error && error.code !== '23505') { // 忽略唯一约束错误
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error(`添加项目成员失败:`, error.message);
      return false;
    }
  }

  static async addOrganizationMember(organizationId, userId, role = 'member') {
    try {
      const { error } = await supabase
        .from('organization_members')
        .insert([{
          organization_id: organizationId,
          user_id: userId,
          role: role,
          created_at: new Date().toISOString()
        }]);
      
      if (error && error.code !== '23505') { // 忽略唯一约束错误
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error(`添加组织成员失败:`, error.message);
      return false;
    }
  }
}

// 要生成的数据
const organizationsData = [
  {
    name: '云计算创新中心',
    description: '专注于云计算技术研究和应用创新'
  },
  {
    name: '区块链技术实验室', 
    description: '区块链技术研发与应用探索'
  },
  {
    name: '物联网事业部',
    description: '物联网设备连接与数据采集解决方案'
  },
  {
    name: '前端技术中心',
    description: '前端技术架构与用户体验优化'
  },
  {
    name: '后端架构组',
    description: '后端系统架构设计与性能优化'
  }
];

const projectsData = [
  {
    name: '云原生应用平台',
    description: '基于Kubernetes的云原生应用部署和管理平台',
    status: 'active',
    priority: 'high',
    progress: 40
  },
  {
    name: '智能合约开发框架',
    description: '区块链智能合约开发工具和框架',
    status: 'planning', 
    priority: 'medium',
    progress: 15
  },
  {
    name: '物联网设备管理平台',
    description: '物联网设备连接、监控和管理平台',
    status: 'active',
    priority: 'high',
    progress: 55
  },
  {
    name: '微前端架构升级',
    description: '现有前端系统向微前端架构迁移',
    status: 'active',
    priority: 'medium',
    progress: 70
  },
  {
    name: '高并发API网关',
    description: '支持高并发访问的API网关系统',
    status: 'active',
    priority: 'urgent',
    progress: 85
  }
];

async function generateData() {
  console.log('🚀 开始生成组织和项目数据...\n');

  try {
    // 获取管理员用户ID
    const adminUserId = await DataGenerator.getAdminUserId();
    console.log(`✅ 获取到管理员用户ID: ${adminUserId}\n`);

    // 创建组织
    console.log('📋 创建新的组织...');
    const createdOrganizations = [];
    
    for (const orgData of organizationsData) {
      const org = await DataGenerator.createOrganization(
        orgData.name,
        orgData.description,
        adminUserId
      );
      
      if (org) {
        createdOrganizations.push(org);
        // 添加组织成员
        await DataGenerator.addOrganizationMember(org.id, adminUserId, 'owner');
      }
    }

    console.log(`\n✅ 成功创建 ${createdOrganizations.length} 个组织\n`);

    // 为每个组织创建项目
    console.log('📋 为组织创建项目...');
    let createdProjects = 0;
    
    for (let i = 0; i < createdOrganizations.length; i++) {
      const org = createdOrganizations[i];
      const projectData = projectsData[i];
      
      if (projectData) {
        const project = await DataGenerator.createProject(
          projectData.name,
          projectData.description,
          org.id,
          adminUserId,
          projectData.status,
          projectData.priority,
          projectData.progress
        );
        
        if (project) {
          createdProjects++;
        }
      }
    }

    console.log(`\n✅ 成功创建 ${createdProjects} 个项目\n`);

    // 为现有组织添加额外项目
    console.log('📋 为现有组织添加额外项目...');
    
    // 获取现有组织
    const { data: existingOrgs, error: orgsError } = await supabase
      .from('organizations')
      .select('id, name')
      .order('id', { ascending: true })
      .limit(3);

    if (!orgsError && existingOrgs && existingOrgs.length > 0) {
      const extraProjects = projectsData.slice(createdOrganizations.length);
      
      for (let i = 0; i < Math.min(extraProjects.length, existingOrgs.length); i++) {
        const org = existingOrgs[i];
        const projectData = extraProjects[i];
        
        if (projectData) {
          const project = await DataGenerator.createProject(
            projectData.name + ' V2', // 添加V2后缀避免重复
            projectData.description + ' (升级版本)',
            org.id,
            adminUserId,
            projectData.status,
            projectData.priority,
            projectData.progress
          );
          
          if (project) {
            createdProjects++;
          }
        }
      }
    }

    // 统计最终结果
    console.log('📊 数据生成结果统计:');
    
    const stats = await Promise.all([
      supabase.from('organizations').select('id', { count: 'exact' }),
      supabase.from('projects').select('id', { count: 'exact' })
    ]);

    console.log(`   组织总数: ${stats[0].count}`);
    console.log(`   项目总数: ${stats[1].count}`);

    console.log('\n🎉 数据生成完成！');
    console.log('💡 现在可以在前端页面查看新生成的组织和项目数据了。');

  } catch (error) {
    console.error('❌ 数据生成过程中出现错误:', error);
  }
}

// 执行数据生成
generateData();