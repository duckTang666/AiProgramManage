import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ProjectService } from '@/lib/database'

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

export const useProjectStore = defineStore('project', () => {
  const projects = ref<Project[]>([])
  const currentProject = ref<Project | null>(null)
  const isLoading = ref(false)

  async function fetchProjects(organizationId: number) {
    isLoading.value = true
    try {
      const data = await ProjectService.getOrganizationProjects(organizationId)
      projects.value = data || []
    } catch (error) {
      console.error('Error fetching projects:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function createProject(projectData: { name: string; description?: string; organization_id: number; owner_id: number; status?: string; priority?: string }) {
    try {
      const data = await ProjectService.createProject({
        ...projectData,
        status: projectData.status || 'active',
        priority: projectData.priority || 'medium',
        progress_percentage: 0
      })
      
      // 如果创建成功，添加到项目列表
      if (data) {
        projects.value.unshift(data)
      }
      
      return data
    } catch (error) {
      console.error('Error creating project:', error)
      throw error
    }
  }

  async function fetchProjectById(id: number) {
    isLoading.value = true
    try {
      const data = await ProjectService.getProjectById(id)
      currentProject.value = data
      return data
    } catch (error) {
      console.error('Error fetching project:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function updateProject(id: number, updates: Partial<Project>) {
    try {
      const data = await ProjectService.updateProject(id, updates)
      
      // 更新项目列表
      const index = projects.value.findIndex(p => p.id === id)
      if (index !== -1) {
        projects.value[index] = data
      }
      
      // 更新当前项目
      if (currentProject.value?.id === id) {
        currentProject.value = data
      }
      
      return data
    } catch (error) {
      console.error('Error updating project:', error)
      throw error
    }
  }

  return {
    projects,
    currentProject,
    isLoading,
    fetchProjects,
    createProject,
    fetchProjectById,
    updateProject
  }
})