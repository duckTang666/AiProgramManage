import { supabase } from './supabase'
import { MockDataService, mockUsers, mockOrganizations, mockProjects } from './mock-data'
import type { Task, User, Organization, Project, ProjectMember, ChatMessage } from '@/types'

// 检查是否启用模拟数据模式
const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true'

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

  // 通过用户ID或邮箱来加载用户
  static async getUserByIdentifier(identifier: string | number): Promise<User | null> {
    try {
      console.log('🔍 通过标识符加载用户:', identifier)
      
      // 判断标识符类型
      if (typeof identifier === 'number') {
        // 如果是数字，按ID查询
        return await this.getUserById(identifier)
      } else if (typeof identifier === 'string') {
        // 如果是字符串，检查是否是邮箱格式
        if (identifier.includes('@')) {
          // 包含@符号，按邮箱查询
          return await this.getUserByEmail(identifier)
        } else {
          // 尝试按ID查询（字符串转数字）
          const id = parseInt(identifier)
          if (!isNaN(id)) {
            return await this.getUserById(id)
          }
        }
      }
      
      console.error('❌ 无效的用户标识符:', identifier)
      return null
    } catch (error) {
      console.error('❌ 通过标识符加载用户失败:', error)
      return null
    }
  }

  // 搜索用户（支持模糊匹配）
  static async searchUsers(query: string, limit: number = 10): Promise<User[]> {
    try {
      console.log('🔍 搜索用户，查询条件:', query)
      
      let queryBuilder = supabase
        .from('users')
        .select('*')
        .limit(limit)
      
      // 如果查询条件包含数字，尝试按ID搜索
      if (/\d+/.test(query)) {
        const id = parseInt(query)
        if (!isNaN(id)) {
          queryBuilder = queryBuilder.eq('id', id)
        }
      }
      
      // 如果查询条件包含@符号，尝试按邮箱搜索
      if (query.includes('@')) {
        queryBuilder = queryBuilder.ilike('email', `%${query}%`)
      }
      
      // 按用户名搜索（模糊匹配）
      queryBuilder = queryBuilder.or(`display_name.ilike.%${query}%,email.ilike.%${query}%`)
      
      const { data, error } = await queryBuilder
      
      if (error) {
        console.error('搜索用户失败:', error)
        return []
      }
      
      console.log('✅ 搜索到用户数量:', data?.length || 0)
      return data || []
    } catch (error) {
      console.error('搜索用户时发生错误:', error)
      return []
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
  // 获取用户的所有组织（包含统计信息）
  static async getUserOrganizations(userId: number | string): Promise<Organization[]> {
    try {
      console.log('🔍 查询用户组织，用户ID:', userId)
      
      // 转换为字符串格式进行查询，避免整数溢出问题
      const userIdStr = userId.toString()
      
      // 首先检查用户是否是组织所有者
      const { data: ownedOrgs, error: ownedError } = await supabase
        .from('organizations')
        .select('*')
        .eq('owner_id', userIdStr)
      
      if (ownedError) {
        console.error('查询用户拥有的组织失败:', ownedError)
      }
      
      // 然后检查用户作为成员的组织
      const { data: memberOrgs, error: memberError } = await supabase
        .from('organization_members')
        .select(`
          organization:organizations(*)
        `)
        .eq('user_id', userIdStr)
      
      if (memberError) {
        console.error('查询用户成员组织失败:', memberError)
      }
      
      // 合并结果并去重
      const allOrgs: any[] = []
      
      if (ownedOrgs && ownedOrgs.length > 0) {
        console.log('✅ 查询到用户拥有的组织:', ownedOrgs.length)
        allOrgs.push(...ownedOrgs)
      }
      
      if (memberOrgs && memberOrgs.length > 0) {
        console.log('✅ 查询到用户作为成员的组织:', memberOrgs.length)
        const memberOrgList = memberOrgs
          .filter(item => item.organization)
          .map(item => item.organization)
        allOrgs.push(...memberOrgList)
      }
      
      // 去重（基于组织ID）
      const uniqueOrgs = allOrgs.filter((org, index, self) => 
        index === self.findIndex(o => o.id === org.id)
      )
      
      console.log('✅ 合并去重后的组织数量:', uniqueOrgs.length)
      
      if (uniqueOrgs.length === 0) {
        console.log('⚠️ 未找到任何组织，返回空数组')
        // 如果没有找到组织，返回空数组而不是示例数据
        return []
      }
      
      // 为每个组织获取统计信息
      const orgsWithStats = await Promise.all(
        uniqueOrgs.map(async (org) => {
          try {
            // 获取项目数量
            const { count: projectCount, error: projectError } = await supabase
              .from('projects')
              .select('*', { count: 'exact', head: true })
              .eq('organization_id', org.id)
            
            // 获取成员数量
            const { count: memberCount, error: memberError } = await supabase
              .from('organization_members')
              .select('*', { count: 'exact', head: true })
              .eq('organization_id', org.id)
            
            return {
              ...org,
              project_count: projectError ? 0 : projectCount || 0,
              member_count: memberError ? 1 : (memberCount || 0) + 1 // 包含创建者
            }
          } catch (error) {
            console.error(`获取组织 ${org.id} 统计信息失败:`, error)
            return {
              ...org,
              project_count: 0,
              member_count: 1
            }
          }
        })
      )
      
      console.log('✅ 最终返回的组织数量:', orgsWithStats.length)
      return orgsWithStats
    } catch (error) {
      console.error('Error fetching user organizations:', error)
      // 出错时返回空数组，不使用示例数据
      return []
    }
  }

  // 生成示例组织数据
  static async generateSampleOrganizations(userId: number | string): Promise<Organization[]> {
    console.log('📝 生成示例组织数据...')
    
    const sampleOrganizations = [
      {
        id: 1,
        name: '大数据分析中心',
        description: '专注于大数据技术和分析解决方案',
        owner_id: userId,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        project_count: 3,
        member_count: 12
      },
      {
        id: 2,
        name: '区块链技术团队',
        description: '区块链技术研发和应用探索',
        owner_id: userId,
        is_active: true,
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date().toISOString(),
        project_count: 2,
        member_count: 8
      },
      {
        id: 3,
        name: '人工智能研究院',
        description: 'AI技术研究和产品开发',
        owner_id: userId,
        is_active: true,
        created_at: new Date(Date.now() - 172800000).toISOString(),
        updated_at: new Date().toISOString(),
        project_count: 5,
        member_count: 15
      },
      {
        id: 4,
        name: '后端架构组织',
        description: '系统架构和后端服务开发',
        owner_id: userId,
        is_active: true,
        created_at: new Date(Date.now() - 259200000).toISOString(),
        updated_at: new Date().toISOString(),
        project_count: 4,
        member_count: 10
      },
      {
        id: 5,
        name: '前端开发组织',
        description: '前端技术研究和用户界面开发',
        owner_id: userId,
        is_active: true,
        created_at: new Date(Date.now() - 345600000).toISOString(),
        updated_at: new Date().toISOString(),
        project_count: 6,
        member_count: 18
      },
      {
        id: 6,
        name: '默认组织',
        description: '系统默认组织',
        owner_id: userId,
        is_active: true,
        created_at: new Date(Date.now() - 432000000).toISOString(),
        updated_at: new Date().toISOString(),
        project_count: 1,
        member_count: 3
      },
      {
        id: 7,
        name: '物联网创新实验室',
        description: '物联网技术研究和产品开发',
        owner_id: userId,
        is_active: true,
        created_at: new Date(Date.now() - 518400000).toISOString(),
        updated_at: new Date().toISOString(),
        project_count: 2,
        member_count: 9
      },
      {
        id: 8,
        name: '云计算事业部',
        description: '云服务和基础设施管理',
        owner_id: userId,
        is_active: true,
        created_at: new Date(Date.now() - 604800000).toISOString(),
        updated_at: new Date().toISOString(),
        project_count: 7,
        member_count: 20
      },
      {
        id: 9,
        name: '系统运维组织',
        description: '系统运维和监控管理',
        owner_id: userId,
        is_active: true,
        created_at: new Date(Date.now() - 691200000).toISOString(),
        updated_at: new Date().toISOString(),
        project_count: 2,
        member_count: 6
      },
      {
        id: 10,
        name: '智能开发组织',
        description: '智能化开发工具和流程优化',
        owner_id: userId,
        is_active: true,
        created_at: new Date(Date.now() - 777600000).toISOString(),
        updated_at: new Date().toISOString(),
        project_count: 4,
        member_count: 11
      }
    ]
    
    console.log('✅ 示例组织数据生成完成，数量:', sampleOrganizations.length)
    return sampleOrganizations
  }

  // 创建组织
  static async createOrganization(orgData: {
    name: string
    description?: string
    owner_id: number | string
  }): Promise<Organization> {
    try {
      console.log('📝 开始创建组织:', orgData)
      
      // 创建组织
      const { data: orgDataResult, error: orgError } = await supabase
        .from('organizations')
        .insert([{
          name: orgData.name,
          description: orgData.description || '',
          owner_id: orgData.owner_id
        }])
        .select()
        .single()
      
      if (orgError) throw orgError
      
      console.log('✅ 组织创建成功:', orgDataResult)
      
      // 将创建者自动添加为组织成员
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert([{
          organization_id: orgDataResult.id,
          user_id: orgData.owner_id,
          role: 'owner',
          joined_at: new Date().toISOString()
        }])
      
      if (memberError) {
        console.error('❌ 添加创建者为成员失败:', memberError)
        // 不抛出错误，因为组织已经创建成功
      } else {
        console.log('✅ 创建者已添加为组织成员')
      }
      
      return orgDataResult
    } catch (error) {
      console.error('❌ 创建组织失败:', error)
      throw error
    }
  }

  // 获取组织详情
  static async getOrganizationById(orgId: number): Promise<Organization | null> {
    try {
      console.log('🔍 查询组织详情，组织ID:', orgId)
      
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', orgId)
        .single()
      
      if (error) {
        console.error('❌ 查询组织详情失败:', error)
        
        // 特殊处理组织不存在的情况
        if (error.code === 'PGRST116' || error.message?.includes('Cannot coerce the result to a single JSON object')) {
          console.log('ℹ️ 组织不存在，返回 null')
          return null
        }
        
        throw error
      }
      
      console.log('✅ 组织详情查询成功')
      return data
    } catch (error) {
      console.error('❌ 获取组织详情失败:', error)
      
      // 如果是网络连接错误，记录但不抛出
      if (error.message?.includes('net::ERR_NAME_NOT_RESOLVED') || 
          error.message?.includes('Failed to fetch') ||
          error.message?.includes('网络连接错误')) {
        console.error('⚠️ 网络连接失败，请检查网络或服务器状态')
        return null
      }
      
      return null
    }
  }

  // 获取所有组织（直接从organizations表获取）
  static async getAllOrganizations(): Promise<Organization[]> {
    try {
      console.log('🔍 从数据库获取所有组织数据...')
      
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('❌ 获取所有组织数据失败:', error)
        throw error
      }
      
      console.log('✅ 从数据库获取到组织数据数量:', data?.length || 0)
      
      // 如果没有数据，返回空数组而不是示例数据
      if (!data || data.length === 0) {
        console.log('ℹ️ 数据库中没有组织数据')
        return []
      }
      
      // 为每个组织获取统计信息
      const orgsWithStats = await Promise.all(
        data.map(async (org) => {
          try {
            // 获取项目数量
            const { count: projectCount, error: projectError } = await supabase
              .from('projects')
              .select('*', { count: 'exact', head: true })
              .eq('organization_id', org.id)
            
            // 获取成员数量
            const { count: memberCount, error: memberError } = await supabase
              .from('organization_members')
              .select('*', { count: 'exact', head: true })
              .eq('organization_id', org.id)
            
            return {
              ...org,
              project_count: projectError ? 0 : projectCount || 0,
              member_count: memberError ? 1 : (memberCount || 0) + 1 // 包含创建者
            }
          } catch (error) {
            console.error(`获取组织 ${org.id} 统计信息失败:`, error)
            return {
              ...org,
              project_count: 0,
              member_count: 1
            }
          }
        })
      )
      
      console.log('✅ 最终返回的组织数量:', orgsWithStats.length)
      return orgsWithStats
    } catch (error) {
      console.error('❌ 获取所有组织数据失败:', error)
      // 出错时抛出错误，让调用方处理
      throw error
    }
  }

  // 更新组织
  static async updateOrganization(orgId: number, updateData: { name?: string; description?: string; is_active?: boolean }): Promise<Organization> {
    try {
      console.log('📝 开始更新组织:', orgId, updateData)
      
      const { data, error } = await supabase
        .from('organizations')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', orgId)
        .select()
        .single()
      
      if (error) throw error
      
      console.log('✅ 组织更新成功:', data)
      return data
    } catch (error) {
      console.error('❌ 更新组织失败:', error)
      throw error
    }
  }

  // 删除组织
  static async deleteOrganization(orgId: number): Promise<void> {
    try {
      console.log('🗑️ 开始删除组织:', orgId)
      
      // 首先删除相关的组织成员记录
      const { error: memberError } = await supabase
        .from('organization_members')
        .delete()
        .eq('organization_id', orgId)
      
      if (memberError) {
        console.error('❌ 删除组织成员记录失败:', memberError)
        // 继续删除组织，不抛出错误
      }
      
      // 然后删除组织
      const { error: orgError } = await supabase
        .from('organizations')
        .delete()
        .eq('id', orgId)
      
      if (orgError) throw orgError
      
      console.log('✅ 组织删除成功')
    } catch (error) {
      console.error('❌ 删除组织失败:', error)
      throw error
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

  // 删除项目
  static async deleteProject(projectId: number): Promise<boolean> {
    try {
      // 首先删除项目关联的所有任务
      const { error: tasksError } = await supabase
        .from('tasks')
        .delete()
        .eq('project_id', projectId)
      
      if (tasksError) throw tasksError

      // 然后删除项目成员
      const { error: membersError } = await supabase
        .from('project_members')
        .delete()
        .eq('project_id', projectId)
      
      if (membersError) throw membersError

      // 最后删除项目本身
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
      
      if (error) throw error
      
      console.log('✅ 项目删除成功')
      return true
    } catch (error) {
      console.error('❌ 删除项目失败:', error)
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

  // 获取可添加到项目的用户（组织成员但不在项目中）
  static async getAvailableUsers(organizationId: number, projectId: number): Promise<any[]> {
    try {
      // 获取组织成员
      const { data: orgMembers, error: orgError } = await supabase
        .from('organization_members')
        .select(`
          user:users(id, display_name, email, role)
        `)
        .eq('organization_id', organizationId)
      
      if (orgError) throw orgError
      
      // 获取项目成员
      const { data: projectMembers, error: projectError } = await supabase
        .from('project_members')
        .select('user_id')
        .eq('project_id', projectId)
      
      if (projectError) throw projectError
      
      // 过滤掉已经是项目成员的用户
      const projectMemberIds = new Set(projectMembers?.map(m => m.user_id) || [])
      const availableUsers = orgMembers
        ?.filter(member => member.user && !projectMemberIds.has(member.user.id))
        .map(member => member.user) || []
      
      return availableUsers
    } catch (error) {
      console.error('Error fetching available users:', error)
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

  // 更新成员角色
  static async updateMemberRole(memberId: number, role: string): Promise<ProjectMember> {
    try {
      const { data, error } = await supabase
        .from('project_members')
        .update({ role })
        .eq('id', memberId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating member role:', error)
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

  // 生成示例团队成员
  static async generateSampleTeamMembers(organizationId: number, projectId: number): Promise<any[]> {
    try {
      // 检查是否已经有团队成员
      const existingMembers = await this.getProjectMembers(projectId)
      if (existingMembers.length > 0) {
        throw new Error('项目中已有团队成员，无需生成示例成员')
      }

      // 更丰富的示例团队成员数据
      const sampleMembers = [
        {
          display_name: '张三',
          email: 'zhangsan@example.com',
          role: 'manager',
          project_role: 'manager',
          avatar_color: '#3B82F6',
          skills: ['项目管理', '团队协作', '需求分析'],
          description: '资深项目经理，擅长敏捷开发'
        },
        {
          display_name: '李四',
          email: 'lisi@example.com',
          role: 'developer',
          project_role: 'developer',
          avatar_color: '#10B981',
          skills: ['Vue.js', 'TypeScript', 'Node.js'],
          description: '前端开发专家，热爱新技术'
        },
        {
          display_name: '王五',
          email: 'wangwu@example.com',
          role: 'designer',
          project_role: 'designer',
          avatar_color: '#8B5CF6',
          skills: ['UI设计', '用户体验', '原型设计'],
          description: 'UI/UX设计师，注重细节和用户体验'
        },
        {
          display_name: '赵六',
          email: 'zhaoliu@example.com',
          role: 'tester',
          project_role: 'tester',
          avatar_color: '#F59E0B',
          skills: ['自动化测试', '性能测试', '安全测试'],
          description: '质量保证工程师，确保产品质量'
        },
        {
          display_name: '钱七',
          email: 'qianqi@example.com',
          role: 'developer',
          project_role: 'developer',
          avatar_color: '#EF4444',
          skills: ['Java', 'Spring Boot', '数据库'],
          description: '后端开发工程师，专注系统架构'
        },
        {
          display_name: '孙八',
          email: 'sunba@example.com',
          role: 'developer',
          project_role: 'developer',
          avatar_color: '#06B6D4',
          skills: ['React', '移动端开发', '跨平台'],
          description: '全栈开发工程师，技术全面'
        },
        {
          display_name: '周九',
          email: 'zhoujiu@example.com',
          role: 'tester',
          project_role: 'tester',
          avatar_color: '#F97316',
          skills: ['功能测试', '兼容性测试', '回归测试'],
          description: '测试工程师，细心严谨'
        }
      ]

      const createdUsers = []
      
      // 创建示例用户并添加到项目
      for (const memberData of sampleMembers) {
        try {
          // 检查用户是否已存在
          let user = await UserService.getUserByEmail(memberData.email)
          
          if (!user) {
            // 创建新用户
            user = await UserService.createUser({
              email: memberData.email,
              display_name: memberData.display_name,
              role: memberData.role
            })
          }

          // 确保用户是组织成员
          const { error: orgMemberError } = await supabase
            .from('organization_members')
            .upsert([{
              organization_id: organizationId,
              user_id: user.id,
              role: memberData.role
            }], {
              onConflict: 'organization_id,user_id'
            })

          if (orgMemberError) {
            console.error('Error adding user to organization:', orgMemberError)
            continue
          }

          // 添加用户到项目
          const projectMember = await this.addProjectMember({
            project_id: projectId,
            user_id: user.id,
            role: memberData.project_role
          })

          // 为用户添加更多信息
          if (projectMember) {
            await UserService.updateUser(user.id, {
              description: memberData.description
            })
          }

          createdUsers.push({
            ...user,
            project_role: memberData.project_role,
            avatar_color: memberData.avatar_color,
            skills: memberData.skills,
            description: memberData.description
          })
          
        } catch (error) {
          console.error(`Error creating sample member ${memberData.display_name}:`, error)
          // 继续创建其他成员，不中断整个流程
        }
      }

      // 如果成功创建了成员，自动创建一些示例任务
      if (createdUsers.length > 0) {
        await this.createSampleTasksForTeam(projectId, createdUsers)
      }

      return createdUsers
    } catch (error) {
      console.error('Error generating sample team members:', error)
      throw error
    }
  }

  // 为示例团队创建示例任务
  static async createSampleTasksForTeam(projectId: number, teamMembers: any[]): Promise<void> {
    try {
      const sampleTasks = [
        {
          title: '项目需求分析和规划',
          description: '完成项目的需求分析文档和开发计划',
          priority: 'high',
          status: 'in_progress',
          assignee_role: 'manager'
        },
        {
          title: '设计系统UI组件库',
          description: '设计并建立项目的UI组件库和设计规范',
          priority: 'high',
          status: 'todo',
          assignee_role: 'designer'
        },
        {
          title: '搭建前端项目框架',
          description: '搭建Vue.js项目框架，配置开发环境',
          priority: 'high',
          status: 'todo',
          assignee_role: 'developer'
        },
        {
          title: '设计数据库结构',
          description: '设计项目数据库的表结构和关系',
          priority: 'medium',
          status: 'todo',
          assignee_role: 'developer'
        },
        {
          title: '编写单元测试用例',
          description: '为核心功能编写单元测试用例',
          priority: 'medium',
          status: 'todo',
          assignee_role: 'tester'
        },
        {
          title: '项目文档编写',
          description: '编写项目技术文档和使用说明',
          priority: 'low',
          status: 'todo',
          assignee_role: 'developer'
        }
      ]

      for (const taskData of sampleTasks) {
        // 根据角色分配任务给对应的成员
        const assignee = teamMembers.find(member => member.project_role === taskData.assignee_role)
        
        if (assignee) {
          await TaskService.createTask({
            title: taskData.title,
            description: taskData.description,
            project_id: projectId,
            assignee_id: assignee.id,
            reporter_id: teamMembers.find(m => m.project_role === 'manager')?.id || assignee.id,
            status: taskData.status as any,
            priority: taskData.priority as any,
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 7天后
          })
        }
      }
      
      console.log(`✅ 为示例团队创建了 ${sampleTasks.length} 个示例任务`)
    } catch (error) {
      console.error('Error creating sample tasks:', error)
      // 不抛出错误，因为创建任务是可选功能
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
      // 检查projectId是否为有效数字
      if (!projectId || isNaN(projectId) || !Number.isInteger(projectId)) {
        console.warn('❌ 无效的projectId:', projectId, '，返回默认统计信息')
        return {
          total: 0,
          pending: 0,
          inProgress: 0,
          completed: 0,
          completionRate: 0
        }
      }
      
      console.log('📊 获取任务统计信息，projectId:', projectId)
      
      const { data, error } = await supabase
        .from('tasks')
        .select('status')
        .eq('project_id', projectId)
      
      if (error) {
        console.error('❌ 数据库查询失败:', error)
        throw error
      }
      
      const tasks = data || []
      console.log('✅ 查询到任务数量:', tasks.length)
      
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
      console.error('❌ 获取任务统计信息失败:', error)
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