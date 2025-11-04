import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pgnjxsvtxrqsuukadlzu.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnbm14c3Z0eHJxc3V1a2FkbHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDM2NjY0NjUsImV4cCI6MjAxOTI0MjQ2NX0.7v8pJ7v8pJ7v8pJ7v8pJ7v8pJ7v8pJ7v8pJ7v8pJ7v8'

export const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase