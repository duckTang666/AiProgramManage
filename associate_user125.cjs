const fs = require('fs');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

// 读取.env文件
const envConfig = dotenv.parse(fs.readFileSync('.env'));

const supabaseUrl = envConfig.VITE_SUPABASE_URL;
const supabaseAnonKey = envConfig.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 缺少Supabase环境变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function associateDataWithUser125() {
  console.log('🔧 开始将数据与用户ID为125的用户相关联...');
  
  try {
    // 1. 将组织所有者改为用户125
    console.log('\\n📋 步骤1: 将组织所有者改为用户125...');
    
    // 获取所有组织
    const { data: allOrgs, error: orgsError } = await supabase
      .from('organizations')
      .select('id, name, owner_id');
    
    if (orgsError) {
      console.log('❌ 获取组织数据失败:', orgsError.message);
      return;
    }
    
    // 更新组织所有者（除了用户125已经拥有的组织）
    const orgsToUpdate = allOrgs.filter(org => org.owner_id !== 125);
    
    for (const org of orgsToUpdate) {
      const { error: updateError } = await supabase
        .from('organizations')
        .update({ owner_id: 125 })
        .eq('id', org.id);
      
      if (updateError) {
        console.log('❌ 更新组织 ' + org.name + ' 失败:', updateError.message);
      } else {
        console.log('✅ 更新组织 ' + org.name + ' 的所有者为用户125');
      }
    }
    
    // 2. 将用户125添加到所有组织的成员中
    console.log('\\n📋 步骤2: 将用户125添加到所有组织的成员中...');
    
    for (const org of allOrgs) {
      // 检查用户125是否已经是该组织的成员
      const { data: existingMember, error: checkError } = await supabase
        .from('organization_members')
        .select('id')
        .eq('user_id', 125)
        .eq('organization_id', org.id)
        .single();
      
      // 如果错误不是"没有找到记录"，则处理错误
      if (checkError && checkError.code !== 'PGRST116') {
        console.log('❌ 检查组织成员关系失败:', checkError.message);
        continue;
      }
      
      if (!existingMember) {
        // 添加用户125到组织成员
        const { error: insertError } = await supabase
          .from('organization_members')
          .insert({
            user_id: 125,
            organization_id: org.id,
            role: org.owner_id === 125 ? 'owner' : 'member'
          });
        
        if (insertError) {
          console.log('❌ 添加用户125到组织 ' + org.name + ' 失败:', insertError.message);
        } else {
          console.log('✅ 添加用户125到组织 ' + org.name + ' 作为 ' + (org.owner_id === 125 ? 'owner' : 'member'));
        }
      }
    }
    
    // 3. 更新项目数据，确保项目属于用户125的组织
    console.log('\\n📋 步骤3: 更新项目数据关联...');
    
    // 获取所有项目
    const { data: allProjects, error: projectsError } = await supabase
      .from('projects')
      .select('id, name, organization_id');
    
    if (projectsError) {
      console.log('❌ 获取项目数据失败:', projectsError.message);
      return;
    }
    
    // 获取用户125拥有的组织
    const { data: user125Orgs, error: userOrgsError } = await supabase
      .from('organizations')
      .select('id')
      .eq('owner_id', 125);
    
    if (userOrgsError) {
      console.log('❌ 获取用户125的组织失败:', userOrgsError.message);
      return;
    }
    
    const user125OrgIds = user125Orgs.map(org => org.id);
    
    // 更新项目，将不属于用户125组织的项目重新分配到用户125的组织
    for (const project of allProjects) {
      if (!user125OrgIds.includes(project.organization_id)) {
        // 随机选择一个用户125的组织
        const randomOrgId = user125OrgIds[Math.floor(Math.random() * user125OrgIds.length)];
        
        const { error: updateError } = await supabase
          .from('projects')
          .update({ organization_id: randomOrgId })
          .eq('id', project.id);
        
        if (updateError) {
          console.log('❌ 更新项目 ' + project.name + ' 失败:', updateError.message);
        } else {
          console.log('✅ 更新项目 ' + project.name + ' 到组织ID: ' + randomOrgId);
        }
      }
    }
    
    console.log('\\n🎉 数据关联完成！');
    
  } catch (error) {
    console.error('数据关联失败:', error);
  }
}

associateDataWithUser125();