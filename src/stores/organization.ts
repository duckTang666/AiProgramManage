import { defineStore } from 'pinia'
import { ref } from 'vue'
import { OrganizationService } from '@/lib/database'

export interface Organization {
  id: number
  name: string
  description?: string | null
  logo_url?: string | null
  owner_id: number
  is_active?: boolean | null
  created_at: string
  updated_at: string
}

export const useOrganizationStore = defineStore('organization', () => {
  const organizations = ref<Organization[]>([])
  const currentOrganization = ref<Organization | null>(null)
  const isLoading = ref(false)

  async function fetchOrganizations(userId: number) {
    isLoading.value = true
    try {
      const data = await OrganizationService.getOrganizations(userId)
      organizations.value = data || []
    } catch (error) {
      console.error('Error fetching organizations:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function createOrganization(orgData: { name: string; description?: string; owner_id: number }) {
    try {
      const data = await OrganizationService.createOrganization(orgData)
      organizations.value.unshift(data)
      return data
    } catch (error) {
      console.error('Error creating organization:', error)
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