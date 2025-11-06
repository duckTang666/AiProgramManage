import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase配置缺失！请检查.env文件中的VITE_SUPABASE_URL和VITE_SUPABASE_ANON_KEY')
  console.log('当前环境变量:', {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? '已设置' : '未设置'
  })
}

export const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase