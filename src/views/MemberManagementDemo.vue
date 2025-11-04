<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 导航栏 -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center space-x-8">
            <RouterLink to="/" class="text-gray-600 hover:text-gray-900">
              ← 返回工作台
            </RouterLink>
            <h1 class="text-xl font-semibold text-gray-900">成员管理功能演示</h1>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主内容 -->
    <main class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <!-- 功能说明 -->
      <div class="card p-6 mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">成员管理功能说明</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-gray-800">已实现的功能</h3>
            <ul class="space-y-2 text-gray-600">
              <li class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                添加成员到项目
              </li>
              <li class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                分配岗位和角色
              </li>
              <li class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                编辑成员角色
              </li>
              <li class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                分配任务给成员
              </li>
            </ul>
          </div>
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-gray-800">使用方式</h3>
            <ol class="space-y-2 text-gray-600 list-decimal list-inside">
              <li>进入项目详情页面</li>
              <li>点击"添加成员"按钮</li>
              <li>选择成员并分配角色</li>
              <li>为成员分配具体任务</li>
              <li>管理成员的角色和任务</li>
            </ol>
          </div>
        </div>
      </div>

      <!-- 角色说明 -->
      <div class="card p-6 mb-8">
        <h2 class="text-xl font-bold text-gray-900 mb-4">角色权限说明</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="border border-gray-200 rounded-lg p-4">
            <h3 class="font-semibold text-red-600 mb-2">管理员</h3>
            <p class="text-sm text-gray-600">可以管理项目设置和所有成员</p>
          </div>
          <div class="border border-gray-200 rounded-lg p-4">
            <h3 class="font-semibold text-purple-600 mb-2">项目经理</h3>
            <p class="text-sm text-gray-600">可以管理任务和团队成员</p>
          </div>
          <div class="border border-gray-200 rounded-lg p-4">
            <h3 class="font-semibold text-blue-600 mb-2">开发人员</h3>
            <p class="text-sm text-gray-600">可以处理开发相关任务</p>
          </div>
          <div class="border border-gray-200 rounded-lg p-4">
            <h3 class="font-semibold text-pink-600 mb-2">设计师</h3>
            <p class="text-sm text-gray-600">可以处理设计相关任务</p>
          </div>
          <div class="border border-gray-200 rounded-lg p-4">
            <h3 class="font-semibold text-orange-600 mb-2">测试人员</h3>
            <p class="text-sm text-gray-600">可以处理测试相关任务</p>
          </div>
          <div class="border border-gray-200 rounded-lg p-4">
            <h3 class="font-semibold text-gray-600 mb-2">普通成员</h3>
            <p class="text-sm text-gray-600">可以查看项目信息</p>
          </div>
        </div>
      </div>

      <!-- 快速操作 -->
      <div class="card p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">快速开始</h2>
        <div class="flex flex-wrap gap-4">
          <RouterLink to="/projects" class="btn btn-primary">
            查看所有项目
          </RouterLink>
          <RouterLink to="/organizations" class="btn btn-secondary">
            管理组织
          </RouterLink>
          <button @click="showDemo" class="btn btn-outline">
            查看功能演示
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function showDemo() {
  // 如果有项目，跳转到第一个项目的详情页面
  // 否则提示用户先创建项目
  alert('请先创建一个项目来体验成员管理功能。您可以在项目管理页面创建新项目。')
  router.push('/projects')
}
</script>