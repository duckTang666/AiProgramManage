// 检查数据库中的组织数据
import { supabase } from './src/lib/supabase.js';

async function checkOrganizationsData() {
  try {
    console.log('🔍 开始检查数据库中的组织数据...');
    
    // 检查组织表结构
    const { data: orgs, error } = await supabase
      .from('organizations')
      .select('*')
      .limit(10);
    
    if (error) {
      console.error('❌ 查询组织数据失败:', error);
      return;
    }
    
    if (orgs && orgs.length > 0) {
      console.log(`✅ 数据库中已有 ${orgs.length} 条组织数据:`);
      orgs.forEach((org, index) => {
        console.log(`   ${index + 1}. ${org.name} (ID: ${org.id}) - 项目数: ${org.project_count || 0}, 成员数: ${org.member_count || 0}`);
      });
    } else {
      console.log('📊 数据库中暂无组织数据，需要添加示例数据');
      
      // 添加示例组织数据
      await addSampleOrganizations();
    }
  } catch (error) {
    console.error('❌ 检查组织数据时出错:', error);
  }
}

async function addSampleOrganizations() {
  try {
    console.log('➕ 开始添加示例组织数据...');
    
    const sampleOrganizations = [
      {
        name: '技术研发部',
        description: '负责公司所有技术产品的研发工作',
        project_count: 5,
        member_count: 12,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        name: '产品设计部',
        description: '负责产品设计和用户体验优化',
        project_count: 3,
        member_count: 8,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        name: '市场营销部',
        description: '负责市场推广和品牌建设',
        project_count: 2,
        member_count: 6,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    const { data, error } = await supabase
      .from('organizations')
      .insert(sampleOrganizations)
      .select();
    
    if (error) {
      console.error('❌ 添加示例组织数据失败:', error);
      return;
    }
    
    console.log('✅ 成功添加示例组织数据:', data.length, '条');
  } catch (error) {
    console.error('❌ 添加示例数据时出错:', error);
  }
}

// 执行检查
checkOrganizationsData();