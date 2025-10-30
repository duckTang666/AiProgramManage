import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pgnjxsvtxrqsuukadlzu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnbmp4c3Z0eHJxc3V1a2FkbHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MTQ5NjYsImV4cCI6MjA3NzE5MDk2Nn0.kw0yn1Wnn4GzkXbPYRUcTjyQr6esb-BED5h-OdFiEMI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseStructure() {
  console.log('🔍 检查数据库表结构...\n');
  
  const tables = ['users', 'organizations', 'projects', 'tasks', 'chat_history'];
  
  for (const table of tables) {
    console.log(`📊 检查表: ${table}`);
    
    try {
      // 获取表结构信息
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`   ❌ 无法访问表: ${error.message}`);
        continue;
      }
      
      if (data && data.length > 0) {
        const sampleRow = data[0];
        console.log(`   ✅ 表存在，示例数据字段:`);
        Object.keys(sampleRow).forEach(key => {
          console.log(`      - ${key}: ${typeof sampleRow[key]}`);
        });
        
        // 检查关键字段是否存在
        const requiredFields = {
          users: ['id', 'email', 'display_name', 'role'],
          organizations: ['id', 'name', 'owner_id'],
          projects: ['id', 'name', 'organization_id', 'status'],
          tasks: ['id', 'title', 'project_id', 'status'],
          chat_history: ['id', 'user_id', 'message', 'message_type']
        };
        
        const missingFields = requiredFields[table]?.filter(field => !(field in sampleRow)) || [];
        
        if (missingFields.length > 0) {
          console.log(`   ⚠️ 缺少字段: ${missingFields.join(', ')}`);
        } else {
          console.log(`   ✅ 所有必需字段都存在`);
        }
      } else {
        console.log(`   ℹ️ 表为空，无示例数据`);
      }
      
    } catch (error) {
      console.log(`   ❌ 检查失败: ${error.message}`);
    }
    
    console.log('');
  }
  
  console.log('📋 数据库结构检查完成！');
}

checkDatabaseStructure();