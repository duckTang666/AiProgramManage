import { supabase } from './supabase'
import { DevDatabaseService } from './devDatabase'

// 项目接口
export interface Project {
  id: number
  name: string
  description?: string | null
  status: string
  priority: string
  progress_percentage?: number | null
  start_date?: string | null
  end_date?: string | null
  owner_id: number
  organization_id: number
  created_at: string
  updated_at: string
}

// 用户接口
export interface User {
  id: number
  email: string
  display_name: string
  avatar_url?: string
  role: string
  is_active?: boolean
  last_login_at?: string
  created_at: string
  updated_at: string
}

// 组织接口
export interface Organization {
  id: number
  name: string
  description?: string | null
  logo_url?: string | null
  owner_id: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// 任务接口
export interface Task {
  id: number
  title: string
  description?: string | null
  project_id: number
  status: string
  priority: string
  assignee_id?: number | null
  reporter_id: number
  due_date?: string | null
  created_at: string
  updated_at: string
}

// 项目服务
export class ProjectService {
  static async createProject(projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) {
    // 开发环境使用模拟数据
    if (import.meta.env.DEV) {
      console.log('🔧 开发模式: 使用模拟数据创建项目')
      return await DevDatabaseService.createProject(projectData)
    }
    
    try {
      console.log('📝 开始创建项目到数据库:', projectData)
      
      // 准备完整的项目数据
      const completeProjectData = {
        ...projectData,
        progress_percentage: projectData.progress_percentage || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      console.log('📋 完整项目数据:', completeProjectData)
      
      const { data, error } = await supabase
        .from('projects')
        .insert(completeProjectData)
        .select()
      
      if (error) {
        console.error('❌ 创建项目失败:', error)
        throw error
      }
      
      if (!data || data.length === 0) {
        throw new Error('创建项目成功但未返回数据')
      }
      
      const newProject = data[0]
      console.log('✅ 项目创建成功:', newProject)
      
      return newProject
    } catch (error) {
      console.error('❌ 创建项目异常:', error)
      throw error
    }
  }

  static async getProjectById(id: string) {
    // 开发环境使用模拟数据
    if (import.meta.env.DEV) {
      // 模拟获取项目详情
      const mockProjects = [
        {
          id: 1,
          name: '智能客服系统',
          description: '基于AI的智能客服系统开发项目',
          organization_id: 1,
          status: 'active',
          priority: 'high',
          progress_percentage: 65,
          owner_id: 1,
          created_at: '2024-01-20T00:00:00Z',
          updated_at: '2024-01-20T00:00:00Z'
        }
      ]
      return mockProjects.find(p => p.id.toString() === id) || null
    }
    
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        organization:organizations!projects_organization_id_fkey(id, name),
        owner:users!projects_owner_id_fkey(id, display_name)
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }

  static async getOrganizationProjects(orgId: string) {
    // 开发环境使用模拟数据
    if (import.meta.env.DEV) {
      return await DevDatabaseService.getOrganizationProjects(orgId)
    }
    
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        owner:users!projects_owner_id_fkey(id, display_name)
      `)
      .eq('organization_id', orgId)
    
    if (error) throw error
    return data
  }

  static async updateProject(id: string, updates: Partial<Project>) {
    // 开发环境使用模拟数据
    if (import.meta.env.DEV) {
      // 模拟更新项目
      const mockProject = {
        id: parseInt(id),
        name: updates.name || '项目名称',
        description: updates.description || '',
        organization_id: updates.organization_id || 1,
        status: updates.status || 'active',
        priority: updates.priority || 'medium',
        progress_percentage: updates.progress_percentage || 0,
        owner_id: updates.owner_id || 1,
        created_at: '2024-01-20T00:00:00Z',
        updated_at: new Date().toISOString()
      }
      return mockProject
    }
    
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data?.[0]
  }

  static async getProjectStats(projectId: string) {
    // 开发环境使用模拟数据
    if (import.meta.env.DEV) {
      return [
        { status: 'todo', count: 5 },
        { status: 'in_progress', count: 3 },
        { status: 'completed', count: 12 }
      ]
    }
    
    // 使用正确的Supabase语法进行分组统计
    const { data, error } = await supabase
      .from('tasks')
      .select('status')
      .eq('project_id', projectId)
    
    if (error) throw error
    
    // 手动统计每个状态的数量
    const stats = data?.reduce((acc: any, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1
      return acc
    }, {}) || {}
    
    // 转换为数组格式
    return Object.entries(stats).map(([status, count]) => ({
      status,
      count: count as number
    }))
  }
}

// 用户服务
export class UserService {
  static async getCurrentUser() {
    // 开发环境使用模拟数据
    if (import.meta.env.DEV) {
      return await DevDatabaseService.getCurrentUser()
    }
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    
    // 通过email查找应用程序用户，因为Supabase认证用户ID和应用程序用户ID类型不同
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', user.email)
      .single()
    
    if (error) {
      console.error('获取当前用户失败:', error)
      return null
    }
    return data
  }

  static async getUserById(id: string) {
    // 开发环境使用模拟数据
    if (import.meta.env.DEV) {
      const mockUsers = [
        {
          id: 1,
          email: 'admin@example.com',
          display_name: '系统管理员',
          role: 'admin',
          created_at: '2024-01-01T00:00:00Z'
        }
      ]
      return mockUsers.find(u => u.id.toString() === id) || null
    }
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }

  static async getUserByAuthId(authId: string) {
    // 开发环境使用模拟数据
    if (import.meta.env.DEV) {
      const mockUsers = [
        {
          id: 1,
          email: 'admin@example.com',
          display_name: '系统管理员',
          role: 'admin',
          created_at: '2024-01-01T00:00:00Z'
        }
      ]
      // 在开发环境中，我们假设authId就是email
      return mockUsers.find(u => u.email === authId) || null
    }
    
    // 通过authId获取认证用户信息
    const { data: authUser } = await supabase.auth.admin.getUserById(authId)
    if (!authUser.user) throw new Error('用户未找到')
    
    // 通过email查找应用程序用户
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', authUser.user.email)
      .single()
    
    if (error) throw error
    return data
  }

  static async createUser(userData: { email: string; display_name: string; role: string; is_active?: boolean }) {
    // 开发环境使用模拟数据
    if (import.meta.env.DEV) {
      const mockUser = {
        id: Date.now(),
        email: userData.email,
        display_name: userData.display_name,
        role: userData.role,
        is_active: userData.is_active !== undefined ? userData.is_active : true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      return mockUser
    }
    
    const { data, error } = await supabase
      .from('users')
      .insert({
        email: userData.email,
        display_name: userData.display_name,
        role: userData.role,
        is_active: userData.is_active !== undefined ? userData.is_active : true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
    
    if (error) throw error
    return data?.[0]
  }

  static async updateUser(id: string, updates: Partial<User>) {
    // 开发环境使用模拟数据
    if (import.meta.env.DEV) {
      const mockUser = {
        id,
        email: updates.email || 'user@example.com',
        display_name: updates.display_name || '用户',
        role: updates.role || 'member',
        created_at: '2024-01-01T00:00:00Z'
      }
      return mockUser
    }
    
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data?.[0]
  }
}

// 组织服务
export class OrganizationService {
  static async getUserOrganizations(userId: string) {
    // 开发环境使用模拟数据
    if (import.meta.env.DEV) {
      return await DevDatabaseService.getUserOrganizations(userId)
    }
    
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('获取用户组织失败:', error)
        // 如果表不存在，返回空数组
        if (error.message?.includes('does not exist')) {
          return []
        }
        throw error
      }
      return data || []
    } catch (error) {
      console.error('获取用户组织异常:', error)
      return []
    }
  }

  static async createOrganization(orgData: Omit<Organization, 'id' | 'created_at' | 'updated_at'>) {
    // 开发环境使用模拟数据
    if (import.meta.env.DEV) {
      console.log('🔧 开发模式: 使用模拟数据创建组织')
      return await DevDatabaseService.createOrganization(orgData)
    }
    
    try {
      console.log('📝 开始创建组织到数据库:', orgData)
      
      // 准备完整的组织数据
      const completeOrgData = {
        ...orgData,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      console.log('📋 完整组织数据:', completeOrgData)
      
      const { data, error } = await supabase
        .from('organizations')
        .insert(completeOrgData)
        .select()
      
      if (error) {
        console.error('❌ 创建组织失败:', error)
        throw error
      }
      
      if (!data || data.length === 0) {
        throw new Error('创建组织成功但未返回数据')
      }
      
      const newOrganization = data[0]
      console.log('✅ 组织创建成功:', newOrganization)
      
      // 自动将创建者添加到组织成员表中
      try {
        console.log('👥 开始添加组织成员...')
        await OrganizationService.addOrganizationMember(
          newOrganization.id.toString(),
          orgData.owner_id.toString(),
          'owner'
        )
        console.log('✅ 组织成员添加成功')
      } catch (memberError) {
        console.warn('⚠️ 添加组织成员失败，但组织创建成功:', memberError)
      }
      
      return newOrganization
    } catch (error) {
      console.error('❌ 创建组织异常:', error)
      throw error
    }
  }

  static async updateOrganization(id: string, updates: Partial<Organization>) {
    // 开发环境使用模拟数据
    if (import.meta.env.DEV) {
      const mockOrg = {
        id: parseInt(id),
        name: updates.name || '组织名称',
        description: updates.description || '',
        logo_url: updates.logo_url || '',
        owner_id: updates.owner_id || 1,
        is_active: updates.is_active !== undefined ? updates.is_active : true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: new Date().toISOString()
      }
      return mockOrg
    }
    
    try {
      const { data, error } = await supabase
        .from('organizations')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
      
      if (error) throw error
      return data?.[0]
    } catch (error) {
      console.error('更新组织异常:', error)
      throw error
    }
  }

  static async getOrganizationById(id: string) {
    // 开发环境使用模拟数据
    if (import.meta.env.DEV) {
      const mockOrganizations = [
        {
          id: 1,
          name: '默认组织',
          description: '系统默认组织',
          owner_id: 1,
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ]
      return mockOrganizations.find(o => o.id.toString() === id) || null
    }
    
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('获取组织详情异常:', error)
      throw error
    }
  }

  static async addOrganizationMember(organizationId: string, userId: string, role: string = 'member') {
    try {
      const { data, error } = await supabase
        .from('organization_members')
        .insert({
          organization_id: parseInt(organizationId),
          user_id: parseInt(userId),
          role,
          joined_at: new Date().toISOString()
        })
        .select()
      
      if (error) throw error
      return data?.[0]
    } catch (error) {
      console.error('添加组织成员异常:', error)
      throw error
    }
  }

  static async getOrganizationMembers(organizationId: string) {
    try {
      const { data, error } = await supabase
        .from('organization_members')
        .select(`
          *,
          user:users!organization_members_user_id_fkey(id, display_name, email, avatar_url)
        `)
        .eq('organization_id', organizationId)
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('获取组织成员异常:', error)
      return []
    }
  }
}

// 任务服务
export class TaskService {
  static async createTask(taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) {
    // 开发环境使用模拟数据
    if (import.meta.env.DEV) {
      const mockTask = {
        id: Date.now(),
        title: taskData.title,
        description: taskData.description || '',
        project_id: taskData.project_id,
        status: taskData.status || 'todo',
        priority: taskData.priority || 'medium',
        assignee_id: taskData.assignee_id || null,
        reporter_id: taskData.reporter_id,
        due_date: taskData.due_date || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      return mockTask
    }
    
    const { data, error } = await supabase
      .from('tasks')
      .insert(taskData)
      .select()
    
    if (error) throw error
    return data?.[0]
  }

  static async getTaskById(id: string) {
    // 开发环境使用模拟数据
    if (import.meta.env.DEV) {
      const mockTasks = [
        {
          id: 1,
          title: '设计数据库架构',
          description: '设计智能客服系统的数据库表结构',
          project_id: 1,
          status: 'completed',
          priority: 'high',
          assignee_id: 3,
          reporter_id: 1,
          due_date: '2024-03-01T00:00:00Z',
          created_at: '2024-01-22T00:00:00Z',
          updated_at: '2024-01-22T00:00:00Z'
        }
      ]
      return mockTasks.find(t => t.id.toString() === id) || null
    }
    
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        project:projects!tasks_project_id_fkey(id, name),
        assignee:users!tasks_assignee_id_fkey(id, display_name),
        reporter:users!tasks_reporter_id_fkey(id, display_name)
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }

  static async getProjectTasks(projectId: string) {
    // 开发环境使用模拟数据
    if (import.meta.env.DEV) {
      return await DevDatabaseService.getProjectTasks(projectId)
    }
    
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assignee:users!tasks_assignee_id_fkey(id, display_name),
        reporter:users!tasks_reporter_id_fkey(id, display_name)
      `)
      .eq('project_id', projectId)
    
    if (error) throw error
    return data
  }

  static async updateTask(id: string, updates: Partial<Task>) {
    // 开发环境使用模拟数据
    if (import.meta.env.DEV) {
      const mockTask = {
        id: parseInt(id),
        title: updates.title || '任务标题',
        description: updates.description || '',
        project_id: updates.project_id || 1,
        status: updates.status || 'todo',
        priority: updates.priority || 'medium',
        assignee_id: updates.assignee_id || null,
        reporter_id: updates.reporter_id || 1,
        due_date: updates.due_date || null,
        created_at: '2024-01-22T00:00:00Z',
        updated_at: new Date().toISOString()
      }
      return mockTask
    }
    
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data?.[0]
  }
}

// 项目成员服务
export class ProjectMemberService {
  static async getProjectMembers(projectId: string) {
    // 开发环境使用模拟数据
    if (import.meta.env.DEV) {
      const mockMembers = [
        {
          id: 1,
          project_id: parseInt(projectId),
          user_id: 1,
          role: 'owner',
          joined_at: '2024-01-20T00:00:00Z'
        },
        {
          id: 2,
          project_id: parseInt(projectId),
          user_id: 3,
          role: 'member',
          joined_at: '2024-01-25T00:00:00Z'
        }
      ]
      return mockMembers
    }
    
    const { data, error } = await supabase
      .from('project_members')
      .select(`
        *,
        user:users!project_members_user_id_fkey(id, display_name, email, avatar_url)
      `)
      .eq('project_id', projectId)
    
    if (error) throw error
    return data
  }

  static async addProjectMember(projectId: string, userId: string, role: string = 'member') {
    // 开发环境使用模拟数据
    if (import.meta.env.DEV) {
      const newMember = {
        id: Date.now(),
        project_id: parseInt(projectId),
        user_id: parseInt(userId),
        role,
        joined_at: new Date().toISOString()
      }
      return newMember
    }
    
    const { data, error } = await supabase
      .from('project_members')
      .insert({
        project_id: parseInt(projectId),
        user_id: parseInt(userId),
        role
      })
      .select()
    
    if (error) throw error
    return data?.[0]
  }

  static async removeProjectMember(projectId: string, userId: string) {
    // 开发环境使用模拟数据
    if (import.meta.env.DEV) {
      return { success: true }
    }
    
    const { error } = await supabase
      .from('project_members')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', userId)
    
    if (error) throw error
    return { success: true }
  }
}

// 聊天服务
export class ChatService {
  static async getProjectChats(projectId: string) {
    // 开发环境使用模拟数据
    if (import.meta.env.DEV) {
      const mockChats = [
        {
          id: 1,
          project_id: parseInt(projectId),
          user_id: 1,
          message: '项目启动会议将在明天下午2点举行',
          created_at: '2024-01-20T10:00:00Z'
        },
        {
          id: 2,
          project_id: parseInt(projectId),
          user_id: 3,
          message: '数据库设计已完成，请各位审阅',
          created_at: '2024-01-22T14:30:00Z'
        }
      ]
      return mockChats
    }
    
    const { data, error } = await supabase
      .from('project_chats')
      .select(`
        *,
        user:users!project_chats_user_id_fkey(id, display_name, avatar_url)
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }

  static async sendMessage(projectId: string, userId: string, message: string) {
    // 开发环境使用模拟数据
    if (import.meta.env.DEV) {
      const newMessage = {
        id: Date.now(),
        project_id: parseInt(projectId),
        user_id: parseInt(userId),
        message,
        created_at: new Date().toISOString()
      }
      return newMessage
    }
    
    const { data, error } = await supabase
      .from('project_chats')
      .insert({
        project_id: parseInt(projectId),
        user_id: parseInt(userId),
        message
      })
      .select()
    
    if (error) throw error
    return data?.[0]
  }
}

// 仪表板服务
export class DashboardService {
  static async getDashboardStats(userId: string) {
    // 开发环境使用模拟数据
    if (import.meta.env.DEV) {
      return {
        totalProjects: 5,
        activeProjects: 3,
        completedTasks: 45,
        pendingTasks: 12,
        teamMembers: 8
      }
    }
    
    // 这里可以添加实际的Supabase查询
    return {
      totalProjects: 0,
      activeProjects: 0,
      completedTasks: 0,
      pendingTasks: 0,
      teamMembers: 0
    }
  }
}

// 导出所有服务
export default {
  ProjectService,
  UserService,
  OrganizationService,
  TaskService,
  ProjectMemberService,
  ChatService,
  DashboardService
}