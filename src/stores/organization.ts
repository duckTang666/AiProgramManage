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
      
      const data = await OrganizationService.getUserOrganizations(userId)
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

  async function updateOrganization(id: number, updateData: { name?: string; description?: string; is_active?: boolean }) {
    try {
      console.log('📝 开始更新组织:', id, updateData)
      const data = await OrganizationService.updateOrganization(id, updateData)
      console.log('✅ 组织更新成功:', data)
      
      // 更新组织列表中的对应组织
      const index = organizations.value.findIndex(org => org.id === id)
      if (index !== -1) {
        organizations.value[index] = { ...organizations.value[index], ...updateData }
      }
      
      // 如果当前组织被更新，也更新当前组织
      if (currentOrganization.value?.id === id) {
        currentOrganization.value = { ...currentOrganization.value, ...updateData }
      }
      
      return data
    } catch (error) {
      console.error('❌ 更新组织失败:', error)
      throw error
    }
  }

  async function deleteOrganization(id: number) {
    try {
      console.log('🗑️ 开始删除组织:', id)
      await OrganizationService.deleteOrganization(id)
      console.log('✅ 组织删除成功')
      
      // 从组织列表中移除
      organizations.value = organizations.value.filter(org => org.id !== id)
      
      // 如果当前组织被删除，清空当前组织
      if (currentOrganization.value?.id === id) {
        currentOrganization.value = null
      }
    } catch (error) {
      console.error('❌ 删除组织失败:', error)
      throw error
    }
  }

  return {
    organizations,
    currentOrganization,
    isLoading,
    fetchOrganizations,
    createOrganization,
    fetchOrganizationById,
    updateOrganization,
    deleteOrganization
  }
})