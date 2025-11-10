// 本地模拟数据 - 用于开发和演示

// 模拟用户数据
export const mockUsers = [
  {
    id: 125,
    email: 'demo@example.com',
    username: 'demo_user',
    full_name: '演示用户',
    avatar_url: null,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z'
  }
]

// 模拟组织数据
export const mockOrganizations = [
  {
    id: 1,
    name: 'AI研发团队',
    description: '专注于人工智能项目开发的团队',
    logo_url: null,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    owner_id: 125,
    is_active: true,
    project_count: 2,
    member_count: 1
  },
  {
    id: 2,
    name: 'Web开发组',
    description: '负责前端和后端Web应用开发',
    logo_url: null,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    owner_id: 125,
    is_active: true,
    project_count: 1,
    member_count: 1
  },
  {
    id: 3,
    name: '测试团队',
    description: '负责系统测试和质量保证',
    logo_url: null,
    created_at: '2024-02-01T00:00:00.000Z',
    updated_at: '2024-02-01T00:00:00.000Z',
    owner_id: 125,
    is_active: false,
    project_count: 0,
    member_count: 1
  },
  {
    id: 4,
    name: '大数据分析中心',
    description: '专注于大数据技术和分析解决方案',
    logo_url: null,
    created_at: '2024-01-15T00:00:00.000Z',
    updated_at: '2024-01-15T00:00:00.000Z',
    owner_id: 125,
    is_active: true,
    project_count: 3,
    member_count: 5
  },
  {
    id: 5,
    name: '区块链技术团队',
    description: '区块链技术研发和应用探索',
    logo_url: null,
    created_at: '2024-02-01T00:00:00.000Z',
    updated_at: '2024-02-01T00:00:00.000Z',
    owner_id: 125,
    is_active: true,
    project_count: 2,
    member_count: 4
  },
  {
    id: 6,
    name: '人工智能研究院',
    description: 'AI技术研究和产品开发',
    logo_url: null,
    created_at: '2024-02-15T00:00:00.000Z',
    updated_at: '2024-02-15T00:00:00.000Z',
    owner_id: 125,
    is_active: true,
    project_count: 5,
    member_count: 8
  },
  {
    id: 7,
    name: '后端架构组织',
    description: '系统架构和后端服务开发',
    logo_url: null,
    created_at: '2024-03-01T00:00:00.000Z',
    updated_at: '2024-03-01T00:00:00.000Z',
    owner_id: 125,
    is_active: true,
    project_count: 4,
    member_count: 6
  },
  {
    id: 8,
    name: '云计算事业部',
    description: '云服务和基础设施管理',
    logo_url: null,
    created_at: '2024-03-15T00:00:00.000Z',
    updated_at: '2024-03-15T00:00:00.000Z',
    owner_id: 125,
    is_active: true,
    project_count: 7,
    member_count: 12
  },
  {
    id: 9,
    name: '前端开发组织',
    description: '前端技术研究和用户界面开发',
    logo_url: null,
    created_at: '2024-04-01T00:00:00.000Z',
    updated_at: '2024-04-01T00:00:00.000Z',
    owner_id: 125,
    is_active: true,
    project_count: 6,
    member_count: 10
  },
  {
    id: 10,
    name: '物联网创新实验室',
    description: '物联网技术研究和产品开发',
    logo_url: null,
    created_at: '2024-04-15T00:00:00.000Z',
    updated_at: '2024-04-15T00:00:00.000Z',
    owner_id: 125,
    is_active: true,
    project_count: 2,
    member_count: 5
  }
]

// 模拟项目数据
export const mockProjects = [
  {
    id: 1,
    name: 'AI助手平台',
    description: '基于AI的智能助手开发平台',
    status: 'active',
    priority: 'high',
    progress: 75,
    start_date: '2024-01-15',
    end_date: '2024-06-30',
    created_at: '2024-01-15T00:00:00.000Z',
    updated_at: '2024-03-01T00:00:00.000Z',
    organization_id: 1
  },
  {
    id: 2,
    name: '项目管理工具',
    description: '现代化的项目管理Web应用',
    status: 'active',
    priority: 'medium',
    progress: 45,
    start_date: '2024-02-01',
    end_date: '2024-08-31',
    created_at: '2024-02-01T00:00:00.000Z',
    updated_at: '2024-03-01T00:00:00.000Z',
    organization_id: 1
  },
  {
    id: 3,
    name: '响应式网站',
    description: '企业响应式官方网站开发',
    status: 'completed',
    priority: 'low',
    progress: 100,
    start_date: '2024-01-01',
    end_date: '2024-03-01',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-03-01T00:00:00.000Z',
    organization_id: 2
  }
]

// 模拟团队成员数据
export const mockMembers = [
  {
    id: 1,
    user_id: 125,
    organization_id: 1,
    role: 'owner',
    joined_at: '2024-01-01T00:00:00.000Z',
    created_at: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 2,
    user_id: 125,
    organization_id: 2,
    role: 'owner',
    joined_at: '2024-01-01T00:00:00.000Z',
    created_at: '2024-01-01T00:00:00.000Z'
  }
]

// 模拟服务类
export class MockDataService {
  static async getUserById(id: number) {
    return mockUsers.find(user => user.id === id) || null
  }

  static async getUserByEmail(email: string) {
    return mockUsers.find(user => user.email === email) || null
  }

  static async getOrganizationById(id: number) {
    return mockOrganizations.find(org => org.id === id) || null
  }

  static async getOrganizationsByUserId(userId: number) {
    const memberOrgs = mockMembers
      .filter(member => member.user_id === userId)
      .map(member => member.organization_id)
    
    return mockOrganizations.filter(org => 
      memberOrgs.includes(org.id)
    )
  }

  static async getProjectsByOrganizationId(orgId: number) {
    return mockProjects.filter(project => project.organization_id === orgId)
  }

  // 生成示例项目数据
  static async generateSampleProjects(orgId: number) {
    const sampleProjects = [
      {
        id: orgId * 100 + 1,
        name: `项目 ${orgId}-1`,
        description: `这是组织 ${orgId} 的第一个示例项目`,
        status: 'active',
        priority: 'high',
        progress: 60,
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
        organization_id: orgId,
        owner_id: 125
      },
      {
        id: orgId * 100 + 2,
        name: `项目 ${orgId}-2`,
        description: `这是组织 ${orgId} 的第二个示例项目`,
        status: 'planning',
        priority: 'medium',
        progress: 25,
        start_date: '2024-02-01',
        end_date: '2024-11-30',
        created_at: '2024-02-01T00:00:00.000Z',
        updated_at: '2024-02-01T00:00:00.000Z',
        organization_id: orgId,
        owner_id: 125
      }
    ]
    
    // 模拟延迟
    await this.delay(200)
    return sampleProjects
  }

  // 生成示例组织数据
  static async generateSampleOrganizations(userId: number) {
    const sampleOrgs = [
      {
        id: 1,
        name: 'AI研发团队',
        description: '专注于人工智能项目开发的团队',
        logo_url: null,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
        owner_id: userId,
        is_active: true,
        project_count: 2,
        member_count: 1
      },
      {
        id: 2,
        name: 'Web开发组',
        description: '负责前端和后端Web应用开发',
        logo_url: null,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
        owner_id: userId,
        is_active: true,
        project_count: 1,
        member_count: 1
      },
      {
        id: 3,
        name: '测试团队',
        description: '负责系统测试和质量保证',
        logo_url: null,
        created_at: '2024-02-01T00:00:00.000Z',
        updated_at: '2024-02-01T00:00:00.000Z',
        owner_id: userId,
        is_active: false,
        project_count: 0,
        member_count: 1
      }
    ]
    
    // 模拟延迟
    await this.delay(300)
    return sampleOrgs
  }

  // 模拟延迟
  static delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // 增强功能：自动生成缺失的组织数据
  static async generateOrganizationIfMissing(orgId: number) {
    // 首先检查是否已经有该组织
    const existingOrg = await this.getOrganizationById(orgId)
    if (existingOrg) {
      return existingOrg
    }
    
    // 生成新的组织数据
    const newOrg = {
      id: orgId,
      name: `组织 ${orgId}`,
      description: `这是自动生成的组织 ${orgId} 的示例数据`,
      logo_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      owner_id: 125,
      is_active: true,
      project_count: Math.floor(Math.random() * 5) + 1,
      member_count: Math.floor(Math.random() * 10) + 1
    }
    
    // 将新组织添加到模拟数据中
    mockOrganizations.push(newOrg)
    
    await this.delay(100)
    return newOrg
  }
}

// 模拟数据库连接状态
export const mockDatabaseStatus = {
  isConnected: true,
  lastCheck: new Date().toISOString(),
  isMock: true
}