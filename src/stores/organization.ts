import { defineStore } from 'pinia'
import { ref } from 'vue'
import { OrganizationService, type Organization } from '@/lib/database'

export const useOrganizationStore = defineStore('organization', () => {
  const organizations = ref<Organization[]>([])
  const currentOrganization = ref<Organization | null>(null)
  const isLoading = ref(false)

  async function fetchOrganizations(userId: number) {
    isLoading.value = true
    try {
      // 检查userId是否有效
      if (!userId || isNaN(userId)) {
        console.warn('无效的用户ID:', userId)
        organizations.value = []
        return
      }
      
      const data = await OrganizationService.getUserOrganizations(userId.toString())
      organizations.value = data || []
    } catch (error) {
      console.error('Error fetching organizations:', error)
      // 不抛出错误，而是设置空数组
      organizations.value = []
    } finally {
      isLoading.value = false
    }
  }

  async function createOrganization(orgData: { name: string; description?: string; owner_id: number }) {
    try {
      console.log('📝 开始创建组织:', orgData)
      const data = await OrganizationService.createOrganization(orgData)
      console.log('✅ 组织创建成功:', data)
      
      // 将新组织添加到列表开头
      organizations.value.unshift(data)
      return data
    } catch (error) {
      console.error('❌ 创建组织失败:', error)
      throw error
    }
  }

  async function fetchOrganizationById(id: number) {
    isLoading.value = true
    try {
      const data = await OrganizationService.getOrganizationById(id)
      currentOrganization.value = data
      return data
    } catch (error) {
      console.error('Error fetching organization:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  return {
    organizations,
    currentOrganization,
    isLoading,
    fetchOrganizations,
    createOrganization,
    fetchOrganizationById
  }
})