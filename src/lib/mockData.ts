// 模拟数据，用于开发和测试

export interface MockUser {
  id: string
  email: string
  display_name: string
  avatar_url?: string
  role: 'admin' | 'manager' | 'member' | 'guest'
}

export interface MockOrganization {
  id: string
  name: string
  description: string
  logo_url?: string
  owner_id: string
  is_active: boolean
  created_at: string
}

export interface MockProject {
  id: string
  name: string
  description: string
  organization_id: string
  status: 'active' | 'completed' | 'paused' | 'archived'
  progress_percentage: number
  created_at: string
}

export interface MockTask {
  id: string
  title: string
  description: string
  project_id: string
  status: 'todo' | 'in_progress' | 'completed' | 'blocked'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignee_id?: string
  reporter_id: string
  due_date?: string
  created_at: string
}

// 模拟用户数据
export const mockUsers: MockUser[] = [
  {
    id: '1',
    email: 'admin@example.com',
    display_name: '系统管理员',
    avatar_url: '/avatars/admin.png',
    role: 'admin'
  },
  {
    id: '2',
    email: 'manager@example.com',
    display_name: '项目经理',
    avatar_url: '/avatars/manager.png',
    role: 'manager'
  },
  {
    id: '3',
    email: 'developer@example.com',
    display_name: '开发人员',
    avatar_url: '/avatars/developer.png',
    role: 'member'
  }
]

// 模拟组织数据
export const mockOrganizations: MockOrganization[] = [
  {
    id: '1',
    name: 'AI技术研发部',
    description: '专注于人工智能技术的研究与开发',
    logo_url: '/logos/ai-department.png',
    owner_id: '1',
    is_active: true,
    created_at: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    name: '产品创新中心',
    description: '负责产品创新和用户体验优化',
    logo_url: '/logos/product-center.png',
    owner_id: '2',
    is_active: true,
    created_at: '2024-02-01T00:00:00Z'
  }
]

// 模拟项目数据
export const mockProjects: MockProject[] = [
  {
    id: '1',
    name: '智能客服系统',
    description: '基于AI的智能客服系统开发项目',
    organization_id: '1',
    status: 'active',
    progress_percentage: 65,
    created_at: '2024-01-20T00:00:00Z'
  },
  {
    id: '2',
    name: '数据分析平台',
    description: '大数据分析和可视化平台',
    organization_id: '1',
    status: 'active',
    progress_percentage: 30,
    created_at: '2024-02-10T00:00:00Z'
  },
  {
    id: '3',
    name: '移动应用重构',
    description: '现有移动应用的技术重构和性能优化',
    organization_id: '2',
    status: 'paused',
    progress_percentage: 15,
    created_at: '2024-01-25T00:00:00Z'
  }
]

// 模拟任务数据
export const mockTasks: MockTask[] = [
  {
    id: '1',
    title: '设计数据库架构',
    description: '设计智能客服系统的数据库表结构',
    project_id: '1',
    status: 'completed',
    priority: 'high',
    assignee_id: '3',
    reporter_id: '1',
    due_date: '2024-03-01T00:00:00Z',
    created_at: '2024-01-22T00:00:00Z'
  },
  {
    id: '2',
    title: '开发用户认证模块',
    description: '实现用户登录、注册和权限管理功能',
    project_id: '1',
    status: 'in_progress',
    priority: 'high',
    assignee_id: '3',
    reporter_id: '2',
    due_date: '2024-03-15T00:00:00Z',
    created_at: '2024-02-01T00:00:00Z'
  },
  {
    id: '3',
    title: '数据采集接口开发',
    description: '开发数据采集和预处理接口',
    project_id: '2',
    status: 'todo',
    priority: 'medium',
    assignee_id: '3',
    reporter_id: '1',
    due_date: '2024-03-20T00:00:00Z',
    created_at: '2024-02-15T00:00:00Z'
  }
]

// 模拟服务函数
export class MockService {
  static async getUserOrganizations(userId: string): Promise<MockOrganization[]> {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 返回用户所属的组织
    return mockOrganizations.filter(org => org.owner_id === userId)
  }

  static async getOrganizationProjects(orgId: string): Promise<MockProject[]> {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockProjects.filter(project => project.organization_id === orgId)
  }

  static async getProjectTasks(projectId: string): Promise<MockTask[]> {
    await new Promise(resolve => setTimeout(resolve, 200))
    return mockTasks.filter(task => task.project_id === projectId)
  }

  static async getCurrentUser(): Promise<MockUser | null> {
    await new Promise(resolve => setTimeout(resolve, 100))
    return mockUsers[0] // 返回第一个用户作为当前用户
  }
}

export default MockService