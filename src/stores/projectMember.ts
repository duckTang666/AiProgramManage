import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ProjectMemberService, TaskService, type ProjectMember, type Task } from '@/lib/database'

export interface TaskAssignment {
  taskId: number
  assigneeId: number
  assigneeName: string
}

export const useProjectMemberStore = defineStore('projectMember', () => {
  const members = ref<ProjectMember[]>([])
  const availableUsers = ref<any[]>([])
  const isLoading = ref(false)
  const isAddingMember = ref(false)
  const isAssigningTask = ref(false)

  // 获取项目成员
  async function fetchProjectMembers(projectId: number) {
    isLoading.value = true
    try {
      const data = await ProjectMemberService.getProjectMembers(projectId)
      members.value = data || []
    } catch (error) {
      console.error('Error fetching project members:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 获取可添加到项目的用户
  async function fetchAvailableUsers(organizationId: number, projectId: number) {
    try {
      const data = await ProjectMemberService.getAvailableUsers(organizationId, projectId)
      availableUsers.value = data || []
    } catch (error) {
      console.error('Error fetching available users:', error)
      throw error
    }
  }

  // 添加成员到项目
  async function addMemberToProject(projectId: number, userId: number, role: string = 'member') {
    isAddingMember.value = true
    try {
      const data = await ProjectMemberService.addProjectMember({
        project_id: projectId,
        user_id: userId,
        role: role
      })
      
      // 更新成员列表
      if (data) {
        members.value.unshift(data)
        // 从可用用户列表中移除
        availableUsers.value = availableUsers.value.filter(user => user.id !== userId)
      }
      
      return data
    } catch (error) {
      console.error('Error adding member to project:', error)
      throw error
    } finally {
      isAddingMember.value = false
    }
  }

  // 更新成员角色
  async function updateMemberRole(memberId: number, role: string) {
    try {
      const data = await ProjectMemberService.updateMemberRole(memberId, role)
      
      // 更新本地数据
      const memberIndex = members.value.findIndex(m => m.id === memberId)
      if (memberIndex !== -1) {
        members.value[memberIndex].role = role
      }
      
      return data
    } catch (error) {
      console.error('Error updating member role:', error)
      throw error
    }
  }

  // 从项目中移除成员
  async function removeMemberFromProject(memberId: number) {
    try {
      // 找到要移除的成员
      const removedMember = members.value.find(m => m.id === memberId)
      if (!removedMember) {
        throw new Error('成员不存在')
      }
      
      // 调用数据库服务移除成员
      const result = await ProjectMemberService.removeProjectMember(removedMember.project_id, removedMember.user_id)
      
      // 从成员列表中移除
      members.value = members.value.filter(m => m.id !== memberId)
      
      // 添加到可用用户列表
      if (removedMember.user) {
        availableUsers.value.push(removedMember.user)
      }
      
      return result
    } catch (error) {
      console.error('Error removing member from project:', error)
      throw error
    }
  }

  // 创建任务并分配给成员
  async function createTaskWithAssignment(taskData: {
    title: string
    description?: string
    project_id: number
    assignee_id?: number
    reporter_id: number
    status?: string
    priority?: string
    due_date?: string
  }) {
    isAssigningTask.value = true
    try {
      const data = await TaskService.createTask(taskData)
      return data
    } catch (error) {
      console.error('Error creating task with assignment:', error)
      throw error
    } finally {
      isAssigningTask.value = false
    }
  }

  // 分配任务给成员
  async function assignTaskToMember(taskId: number, assigneeId: number) {
    isAssigningTask.value = true
    try {
      // 使用TaskService的updateTask方法来分配任务
      const data = await TaskService.updateTask(taskId, { assignee_id: assigneeId })
      return data
    } catch (error) {
      console.error('Error assigning task to member:', error)
      throw error
    } finally {
      isAssigningTask.value = false
    }
  }

  // 获取成员任务统计
  async function getMemberTaskStats(projectId: number, memberId: number) {
    try {
      // 由于TaskService中没有getMemberTaskStats方法，我们手动计算
      const tasks = await TaskService.getTasksByProject(projectId)
      const memberTasks = tasks.filter(task => task.assignee_id === memberId)
      
      return {
        total: memberTasks.length,
        todo: memberTasks.filter(t => t.status === 'todo').length,
        inProgress: memberTasks.filter(t => t.status === 'in_progress').length,
        completed: memberTasks.filter(t => t.status === 'done').length
      }
    } catch (error) {
      console.error('Error getting member task stats:', error)
      return { total: 0, todo: 0, inProgress: 0, completed: 0 }
    }
  }

  // 获取成员角色选项
  function getRoleOptions() {
    return [
      { value: 'admin', label: '管理员', description: '可以管理项目设置和成员' },
      { value: 'manager', label: '项目经理', description: '可以管理任务和成员' },
      { value: 'developer', label: '开发人员', description: '可以处理开发任务' },
      { value: 'designer', label: '设计师', description: '可以处理设计任务' },
      { value: 'tester', label: '测试人员', description: '可以处理测试任务' },
      { value: 'member', label: '普通成员', description: '可以查看项目信息' }
    ]
  }

  // 获取角色显示文本
  function getRoleDisplayText(role: string) {
    const roleMap: Record<string, string> = {
      'admin': '管理员',
      'manager': '项目经理',
      'developer': '开发人员',
      'designer': '设计师',
      'tester': '测试人员',
      'member': '普通成员'
    }
    return roleMap[role] || role
  }

  // 生成示例团队成员
  async function generateSampleTeamMembers(organizationId: number, projectId: number) {
    try {
      const data = await ProjectMemberService.generateSampleTeamMembers(organizationId, projectId)
      
      // 重新加载项目成员
      await fetchProjectMembers(projectId)
      
      return data
    } catch (error) {
      console.error('Error generating sample team members:', error)
      throw error
    }
  }

  // 清空数据
  function clearData() {
    members.value = []
    availableUsers.value = []
  }

  return {
    members,
    availableUsers,
    isLoading,
    isAddingMember,
    isAssigningTask,
    fetchProjectMembers,
    fetchAvailableUsers,
    addMemberToProject,
    updateMemberRole,
    removeMemberFromProject,
    createTaskWithAssignment,
    assignTaskToMember,
    getMemberTaskStats,
    getRoleOptions,
    getRoleDisplayText,
    generateSampleTeamMembers,
    clearData
  }
})