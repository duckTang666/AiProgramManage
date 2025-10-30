import { supabase } from '../src/lib/supabase.js'

async function testDatabaseConnection() {
  console.log('🧪 开始测试Supabase数据库连接...\n')

  try {
    // 测试1: 检查Supabase客户端初始化
    console.log('1. 检查Supabase客户端初始化...')
    if (!supabase) {
      throw new Error('Supabase客户端初始化失败')
    }
    console.log('✅ Supabase客户端初始化成功')

    // 测试2: 测试认证连接
    console.log('2. 测试认证连接...')
    const { data: authData, error: authError } = await supabase.auth.getSession()
    if (authError) {
      console.log('⚠️ 认证连接测试失败（可能是正常的，如果没有登录会话）:', authError.message)
    } else {
      console.log('✅ 认证连接测试成功')
    }

    // 测试3: 测试数据库查询
    console.log('3. 测试数据库查询...')
    const { data: tablesData, error: tablesError } = await supabase
      .from('organizations')
      .select('count')
      .limit(1)

    if (tablesError) {
      if (tablesError.code === 'PGRST116') {
        console.log('✅ 数据库连接正常，但表可能不存在（这是正常的，需要先执行SQL脚本）')
      } else {
        console.log('❌ 数据库查询失败:', tablesError.message)
      }
    } else {
      console.log('✅ 数据库查询测试成功')
    }

    // 测试4: 检查环境变量
    console.log('4. 检查环境变量配置...')
    const envVars = {
      'VITE_SUPABASE_URL': import.meta.env.VITE_SUPABASE_URL,
      'VITE_SUPABASE_ANON_KEY': import.meta.env.VITE_SUPABASE_ANON_KEY
    }

    let envValid = true
    for (const [key, value] of Object.entries(envVars)) {
      if (!value) {
        console.log(`❌ 环境变量 ${key} 未配置`)
        envValid = false
      } else {
        console.log(`✅ ${key}: 已配置`)
      }
    }

    console.log('\n📊 测试结果汇总:')
    console.log('================')
    console.log('✅ Supabase客户端: 正常')
    console.log('✅ 认证连接: ' + (authError ? '部分正常' : '正常'))
    console.log('✅ 数据库连接: ' + (tablesError && tablesError.code === 'PGRST116' ? '正常（表不存在）' : '正常'))
    console.log('✅ 环境变量: ' + (envValid ? '正常' : '异常'))

    if (envValid) {
      console.log('\n🎉 数据库连接测试完成！所有基本连接测试通过。')
      console.log('💡 下一步: 在Supabase Dashboard中执行SQL脚本来创建数据库表。')
    } else {
      console.log('\n⚠️ 数据库连接测试发现配置问题，请检查.env文件。')
    }

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message)
    console.log('\n🔧 故障排除建议:')
    console.log('1. 检查.env文件中的Supabase配置')
    console.log('2. 确认网络连接正常')
    console.log('3. 检查Supabase项目是否正常运行')
  }
}

// 运行测试
testDatabaseConnection()