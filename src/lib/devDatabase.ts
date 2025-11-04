// 开发环境数据库服务，直接使用模拟数据避免Supabase连接问题
import { MockService } from './mockData'

// 开发环境数据库服务
export class DevDatabaseService {
  private static useMockData = true

  static async init() {
    console.log('开发模式: 使用模拟数据')
  }

  // 用户服务
  static async getCurrentUser() {
    return await MockService.getCurrentUser()
  }

  // 组织服务
  static async getUserOrganizations(userId: string) {
    return await MockService.getUserOrganizations(userId)
  }

  // 项目服务
  static async getOrganizationProjects(orgId: string) {
    return await MockService.getOrganizationProjects(orgId)
  }

  // 任务服务
  static async getProjectTasks(projectId: string) {
    return await MockService.getProjectTasks(projectId)
  }

  // 创建项目
  static async createProject(projectData: any) {
    // 模拟创建项目
    const newProject = {
      id: Date.now().toString(),
      name: projectData.name,
      description: projectData.description || '',
      organization_id: projectData.organization_id,
      status: projectData.status || 'active',
      progress_percentage: 0,
      created_at: new Date().toISOString()
    }
    return newProject
  }

  // 创建组织
  static async createOrganization(orgData: any) {
    console.log('🔧 开发模式: 创建模拟组织数据')
    
    // 模拟创建组织
    const newOrg = {
      id: Date.now().toString(),
      name: orgData.name,
      description: orgData.description || '',
      logo_url: orgData.logo_url,
      owner_id: orgData.owner_id,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    console.log('✅ 模拟组织创建成功:', newOrg)
    return newOrg
  }
}

// 初始化开发数据库服务
export async function initDevDatabase() {
  await DevDatabaseService.init()
}

export default DevDatabaseService