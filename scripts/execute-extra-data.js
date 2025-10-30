// AI项目管理平台 - 执行额外数据插入脚本
// 用于将额外的组织和项目数据添加到数据库

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// 初始化Supabase客户端
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 请检查.env文件中的Supabase配置');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeExtraData() {
  console.log('🚀 开始执行额外数据插入脚本...\n');

  try {
    // 读取SQL文件
    const sqlFilePath = path.join(__dirname, 'generate-extra-data.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // 分割SQL语句（简单的分割，实际应该使用SQL解析器）
    const sqlStatements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📋 找到 ${sqlStatements.length} 条SQL语句需要执行\n`);

    let successCount = 0;
    let errorCount = 0;

    // 逐条执行SQL语句
    for (let i = 0; i < sqlStatements.length; i++) {
      const sql = sqlStatements[i] + ';'; // 重新添加分号
      
      try {
        // 对于SELECT语句，使用select方法
        if (sql.trim().toUpperCase().startsWith('SELECT')) {
          const { data, error } = await supabase
            .from('dummy') // 使用虚拟表名，实际会执行原始SQL
            .select('*', { 
              head: true, 
              count: 'exact',
              query: sql 
            });
          
          if (error) {
            // 对于非SELECT语句，使用rpc方法
            const { error: rpcError } = await supabase.rpc('exec_sql', { sql_query: sql });
            
            if (rpcError) {
              console.log(`   ⚠️  语句 ${i + 1} 执行失败:`, rpcError.message);
              errorCount++;
            } else {
              console.log(`   ✅ 语句 ${i + 1} 执行成功`);
              successCount++;
            }
          } else {
            console.log(`   ✅ 语句 ${i + 1} 执行成功`);
            successCount++;
          }
        } else {
          // 对于INSERT/UPDATE/DELETE语句，使用rpc方法
          const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
          
          if (error) {
            console.log(`   ⚠️  语句 ${i + 1} 执行失败:`, error.message);
            errorCount++;
          } else {
            console.log(`   ✅ 语句 ${i + 1} 执行成功`);
            successCount++;
          }
        }
      } catch (error) {
        console.log(`   ⚠️  语句 ${i + 1} 执行异常:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n📊 执行结果统计:`);
    console.log(`   成功: ${successCount} 条`);
    console.log(`   失败: ${errorCount} 条`);
    console.log(`   总计: ${sqlStatements.length} 条`);

    if (errorCount === 0) {
      console.log('\n🎉 额外数据插入完成！');
      console.log('💡 现在可以在前端页面查看新生成的组织和项目数据了。');
    } else {
      console.log('\n⚠️  部分数据插入失败，请检查数据库连接和权限。');
    }

  } catch (error) {
    console.error('❌ 执行过程中出现错误:', error);
  }
}

// 执行数据插入
if (require.main === module) {
  executeExtraData();
}

module.exports = { executeExtraData };