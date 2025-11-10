// 测试数据库连接和组织数据
import { supabase } from './src/lib/supabase.ts';
import { OrganizationService } from './src/lib/database.ts';

async function testDatabaseConnection() {
  console.log('🔍 测试数据库连接...');
  
  try {
    // 测试基本连接
    const { data, error } = await supabase
      .from('organizations')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ 数据库连接失败:', error);
      return false;
    }
    
    console.log('✅ 数据库连接成功');
    return true;
  } catch (error) {
    console.error('❌ 数据库连接异常:', error);
    return false;
  }
}

async function testOrganizationsData() {
  console.log('🔍 测试组织数据...');
  
  try {
    // 测试获取所有组织
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ 获取组织数据失败:', error);
      return [];
    }
    
    console.log(`✅ 从数据库获取到 ${data?.length || 0} 个组织`);
    
    if (data && data.length > 0) {
      data.forEach((org, index) => {
        console.log(`  ${index + 1}. ${org.name} (ID: ${org.id}) - 活跃: ${org.is_active}`);
      });
    }
    
    return data || [];
  } catch (error) {
    console.error('❌ 获取组织数据异常:', error);
    return [];
  }
}

async function testOrganizationService() {
  console.log('🔍 测试组织服务...');
  
  try {
    const organizations = await OrganizationService.getAllOrganizations();
    console.log(`✅ 组织服务返回 ${organizations.length} 个组织`);
    
    if (organizations.length > 0) {
      organizations.forEach((org, index) => {
        console.log(`  ${index + 1}. ${org.name} - 项目数: ${org.project_count || 0} - 成员数: ${org.member_count || 1}`);
      });
    }
    
    return organizations;
  } catch (error) {
    console.error('❌ 组织服务异常:', error);
    return [];
  }
}

async function main() {
  console.log('🚀 开始测试数据库连接和组织数据...\n');
  
  // 测试数据库连接
  const isConnected = await testDatabaseConnection();
  
  if (!isConnected) {
    console.log('\n❌ 数据库连接失败，请检查配置');
    return;
  }
  
  console.log('');
  
  // 测试直接数据库查询
  const directData = await testOrganizationsData();
  
  console.log('');
  
  // 测试组织服务
  const serviceData = await testOrganizationService();
  
  console.log('\n📊 测试结果总结:');
  console.log(`- 数据库连接: ${isConnected ? '✅ 成功' : '❌ 失败'}`);
  console.log(`- 直接查询组织数: ${directData.length}`);
  console.log(`- 组织服务返回数: ${serviceData.length}`);
  
  if (directData.length === 0) {
    console.log('\n💡 建议: 数据库中可能没有组织数据，可以:');
    console.log('1. 在数据库中手动添加一些组织数据');
    console.log('2. 使用系统提供的创建组织功能');
  }
}

main().catch(console.error);