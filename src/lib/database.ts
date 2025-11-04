import { supabase } from './supabase'
import type { Task, User, Organization, Project, ProjectMember, ChatMessage } from '@/types'

// 用户服务
export class UserService {
  // 获取用户信息
  static async getUserById(userId: number): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching user:', error)
      return null
    }
  }

  // 通过邮箱获取用户
  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching user by email:', error)
      return null
    }
  }

  // 通过auth_id获取用户
  static async getUserByAuthId(authId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', authId)
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching user by auth_id:', error)
      return null
    }
  }

  // 创建用户
  static async createUser(userData: {
    auth_id?: string
    email: string
    display_name: string
    role?: string
    is_active?: boolean
  }): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          auth_id: userData.auth_id,
          email: userData.email,
          display_name: userData.display_name,
          role: userData.role || 'member',
          is_active: userData.is_active ?? true
        }])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  }

  // 更新用户信息
  static async updateUser(userId: number, updates: Partial<User>): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  }
}

// 组织服务
export class OrganizationService {
  // 获取用户的所有组织
  static async getUserOrganizations(userId: number): Promise<Organization[]> {
    try {
      const { data, error } = await supabase
        .from('organization_members')
        .select(`
          organization:organizations(*)
        `)
        .eq('user_id', userId)
      
      if (error) throw error
      return data?.map(item => item.organization) || []
    } catch (error) {
      console.error('Error fetching user organizations:', error)
      return []
    }
  }

  // 创建组织
  static async createOrganization(orgData: {
    name: string
    description?: string
    owner_id: number
  }): Promise<Organization> {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .insert([{
          name: orgData.name,
          description: orgData.description || '',
          owner_id: orgData.owner_id
        }])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating organization:', error)
      throw error
    }
  }

  // 获取组织详情
  static async getOrganizationById(orgId: number): Promise<Organization | null> {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', orgId)
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching organization:', error)
      return null
    }
  }
}

// 项目服务
export class ProjectService {
  // 获取组织的所有项目
  static async getProjectsByOrganization(orgId: number): Promise<Project[]> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching projects:', error)
      return []
    }
  }

  // 创建项目
  static async createProject(projectData: {
    name: string
    description?: string
    organization_id: number
    owner_id: number
    status?: string
    priority?: string
  }): Promise<Project> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          name: projectData.name,
          description: projectData.description || '',
          organization_id: projectData.organization_id,
          owner_id: projectData.owner_id,
          status: projectData.status || 'active',
          priority: projectData.priority || 'medium',
          progress_percentage: 0
        }])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating project:', error)
      throw error
    }
  }

  // 获取项目详情
  static async getProjectById(projectId: number): Promise<Project | null> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching project:', error)
      return null
    }
  }

  // 更新项目
  static async updateProject(projectId: number, updates: Partial<Project>): Promise<Project> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating project:', error)
      throw error
    }
  }
}

// 项目成员服务
export class ProjectMemberService {
  // 获取项目的所有成员
  static async getProjectMembers(projectId: number): Promise<ProjectMember[]> {
    try {
      const { data, error } = await supabase
        .from('project_members')
        .select(`
          *,
          user:users(display_name, email, role)
        `)
        .eq('project_id', projectId)
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching project members:', error)
      return []
    }
  }

  // 添加项目成员
  static async addProjectMember(memberData: {
    project_id: number
    user_id: number
    role: string
  }): Promise<ProjectMember> {
    try {
      const { data, error } = await supabase
        .from('project_members')
        .insert([{
          project_id: memberData.project_id,
          user_id: memberData.user_id,
          role: memberData.role
        }])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error adding project member:', error)
      throw error
    }
  }

  // 移除项目成员
  static async removeProjectMember(projectId: number, userId: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', userId)
      
      if (error) throw error
    } catch (error) {
      console.error('Error removing project member:', error)
      throw error
    }
  }
}

// 聊天服务
export class ChatService {
  // 获取项目聊天消息
  static async getProjectMessages(projectId: number): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          user:users(display_name, email)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: true })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching chat messages:', error)
      return []
    }
  }

  // 发送消息
  static async sendMessage(messageData: {
    project_id: number
    user_id: number
    content: string
    message_type?: string
  }): Promise<ChatMessage> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert([{
          project_id: messageData.project_id,
          user_id: messageData.user_id,
          content: messageData.content,
          message_type: messageData.message_type || 'text'
        }])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }
}

export class TaskService {
  // 获取项目的所有任务
  static async getTasksByProject(projectId: number): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assignee:users!tasks_assignee_id_fkey(display_name, email),
          reporter:users!tasks_reporter_id_fkey(display_name, email)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching tasks:', error)
      return []
    }
  }

  // 创建新任务
  static async createTask(taskData: {
    title: string
    description?: string
    project_id: number
    assignee_id?: number
    reporter_id: number
    status?: 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled'
    priority?: 'low' | 'medium' | 'high' | 'urgent'
    due_date?: string
    estimated_hours?: number
  }): Promise<Task> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          title: taskData.title,
          description: taskData.description || '',
          project_id: taskData.project_id,
          assignee_id: taskData.assignee_id || null,
          reporter_id: taskData.reporter_id,
          status: taskData.status || 'todo',
          priority: taskData.priority || 'medium',
          due_date: taskData.due_date || null,
          estimated_hours: taskData.estimated_hours || null
        }])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating task:', error)
      throw error
    }
  }

  // 更新任务
  static async updateTask(taskId: number, updates: Partial<Task>): Promise<Task> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating task:', error)
      throw error
    }
  }

  // 删除任务
  static async deleteTask(taskId: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
      
      if (error) throw error
    } catch (error) {
      console.error('Error deleting task:', error)
      throw error
    }
  }

  // 获取用户的任务
  static async getUserTasks(userId: number): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assignee:users!tasks_assignee_id_fkey(display_name, email),
          reporter:users!tasks_reporter_id_fkey(display_name, email),
          project:projects!tasks_project_id_fkey(name, status)
        `)
        .or(`assignee_id.eq.${userId},reporter_id.eq.${userId}`)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching user tasks:', error)
      return []
    }
  }

  // 获取任务统计信息
  static async getTaskStats(projectId: number): Promise<{
    total: number
    pending: number
    inProgress: number
    completed: number
    completionRate: number
  }> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('status')
        .eq('project_id', projectId)
      
      if (error) throw error
      
      const tasks = data || []
      const total = tasks.length
      const pending = tasks.filter(t => t.status === 'todo').length
      const inProgress = tasks.filter(t => t.status === 'in_progress').length
      const completed = tasks.filter(t => t.status === 'done').length
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0
      
      return {
        total,
        pending,
        inProgress,
        completed,
        completionRate
      }
    } catch (error) {
      console.error('Error fetching task stats:', error)
      return {
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        completionRate: 0
      }
    }
  }
}