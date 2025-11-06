// 用户类型定义
export interface User {
  id: number
  auth_id?: string
  email: string
  display_name: string
  avatar_url?: string
  role: 'admin' | 'manager' | 'member' | 'guest'
  is_active: boolean
  last_login_at?: string
  created_at: string
  updated_at: string
}

// 组织类型定义
export interface Organization {
  id: number
  name: string
  description?: string
  logo_url?: string
  owner_id: number
  is_active: boolean
  project_count?: number
  member_count?: number
  created_at: string
  updated_at: string
}

// 项目类型定义
export interface Project {
  id: number
  name: string
  description?: string
  status: 'planning' | 'active' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  progress_percentage: number
  start_date?: string
  end_date?: string
  owner_id: number
  organization_id: number
  created_at: string
  updated_at: string
}

// 任务类型定义
export interface Task {
  id: number
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_date?: string
  estimated_hours?: number
  actual_hours?: number
  project_id: number
  assignee_id?: number
  reporter_id: number
  assignee?: User
  reporter?: User
  created_at: string
  updated_at: string
}

// 聊天消息类型定义
export interface ChatMessage {
  id: number
  project_id: number
  sender_id: number
  message: string
  message_type: 'text' | 'file' | 'system'
  created_at: string
}

// 仪表板统计类型定义
export interface DashboardStats {
  total_projects: number
  active_projects: number
  completed_projects: number
  total_tasks: number
  pending_tasks: number
  in_progress_tasks: number
  completed_tasks: number
  total_members: number
}

// 项目成员类型定义
export interface ProjectMember {
  id: number
  project_id: number
  user_id: number
  role: 'owner' | 'admin' | 'manager' | 'member' | 'guest'
  joined_at: string
}

// 组织成员类型定义
export interface OrganizationMember {
  id: number
  organization_id: number
  user_id: number
  role: 'owner' | 'admin' | 'manager' | 'member' | 'guest'
  joined_at: string
}

// AI对话历史类型定义
export interface ChatHistory {
  id: number
  user_id: number
  project_id?: number
  organization_id?: number
  ai_level: 'standard' | 'advanced' | 'expert'
  message_type: 'question' | 'command' | 'analysis' | 'suggestion'
  user_message: string
  ai_response: string
  context_data?: any
  created_at: string
}

// 文档类型定义
export interface Document {
  id: number
  title: string
  content?: string
  file_url?: string
  file_type?: string
  file_size?: number
  project_id?: number
  organization_id?: number
  uploaded_by: number
  is_public: boolean
  created_at: string
  updated_at: string
}

// 通知类型定义
export interface Notification {
  id: number
  user_id: number
  title: string
  message: string
  type: 'invitation' | 'task_assigned' | 'project_update' | 'system'
  is_read: boolean
  related_entity_type?: string
  related_entity_id?: number
  created_at: string
}

// 邀请类型定义
export interface Invitation {
  id: number
  email: string
  token: string
  inviter_id: number
  organization_id?: number
  project_id?: number
  role: 'admin' | 'manager' | 'member' | 'guest'
  status: 'pending' | 'accepted' | 'expired' | 'cancelled'
  expires_at: string
  created_at: string
}