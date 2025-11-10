import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// 读取.env文件内容
const envContent = readFileSync('.env', 'utf8')
const envVars = {}

// 解析.env文件
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.+)$/)
  if (match) {
    envVars[match[1]] = match[2]
  }
})

const supabaseUrl = envVars.VITE_SUPABASE_URL
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase配置缺失！请检查.env文件')
  console.log('当前.env文件内容:', envContent)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testOrganizations() {
  console.log('🔍 开始查询组织数据...')
  
  try {
    // 查询组织数据
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ 查询组织数据失败:', error)
      return
    }
    
    console.log(`✅ 查询到 ${data?.length || 0} 条组织数据`)
    
    if (data && data.length > 0) {
      console.log('\n📋 组织数据详情:')
      data.forEach((org, index) => {
        console.log(`\n--- 组织 ${index + 1} ---`)
        console.log('ID:', org.id)
        console.log('名称:', org.name)
        console.log('描述:', org.description)
        console.log('创建时间:', org.created_at, '(原始值)')
        console.log('更新时间:', org.updated_at, '(原始值)')
        console.log('是否活跃:', org.is_active)
        console.log('项目数:', org.project_count)
        console.log('成员数:', org.member_count)
        
        // 测试日期格式化
        try {
          const createdDate = new Date(org.created_at)
          console.log('创建时间(格式化):', isNaN(createdDate.getTime()) ? 'Invalid Date' : createdDate.toLocaleDateString('zh-CN'))
        } catch (e) {
          console.log('创建时间格式化错误:', e.message)
        }
      })
    } else {
      console.log('📊 数据库中暂无组织数据')
    }
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error)
  }
}

testOrganizations()