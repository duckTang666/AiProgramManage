// 简化的组织数据验证脚本
import { createClient } from '@supabase/supabase-js';

// 从环境变量获取Supabase配置
const supabaseUrl = 'https://yfxxrmjijxegfqgjclrd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmeHhybWppanhleGdxZ2pjbHJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA5NTQ4MjEsImV4cCI6MjA0NjUzMDgyMX0.ZJ4n-yc7W8z5q8k3w8qJh3Yz0nI8t3m6oH3n7iJ3qJ8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyOrganizations() {
  try {
    console.log('🔍 验证数据库中的组织数据...');
    
    // 直接查询组织表
    const { data: orgs, error } = await supabase
      .from('organizations')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('❌ 数据库连接失败:', error);
      return;
    }
    
    if (orgs && orgs.length > 0) {
      console.log(`✅ 数据库连接成功，找到 ${orgs.length} 条组织数据:`);
      orgs.forEach((org, index) => {
        console.log(`   ${index + 1}. ${org.name} (ID: ${org.id})`);
      });
      
      console.log('\n📊 组织管理页面现在应该能够正常显示数据了！');
      console.log('🌐 请访问: http://localhost:3000/organizations');
    } else {
      console.log('📊 数据库中暂无组织数据');
      console.log('💡 建议: 请登录后访问组织管理页面，系统会自动尝试加载数据');
      console.log('🌐 访问地址: http://localhost:3000/organizations');
    }
  } catch (error) {
    console.error('❌ 验证过程中出错:', error);
  }
}

// 执行验证
verifyOrganizations();