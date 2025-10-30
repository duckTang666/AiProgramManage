<template>
  <!-- AI聊天助手浮动按钮 -->
  <div class="fixed bottom-6 right-6 z-50">
    <!-- 聊天窗口 -->
    <div v-if="isOpen" class="absolute bottom-16 right-0 w-80 h-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col">
      <!-- 聊天头部 -->
      <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <div class="flex items-center">
          <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 class="font-semibold">AI助手</h3>
            <p class="text-xs opacity-80">随时为您提供帮助</p>
          </div>
        </div>
        <button @click="isOpen = false" class="text-white/80 hover:text-white">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- 聊天内容 -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4">
        <!-- 欢迎消息 -->
        <div class="flex justify-start">
          <div class="bg-blue-50 rounded-lg p-3 max-w-[80%]">
            <p class="text-sm text-gray-700">您好！我是AI助手，可以帮您：</p>
            <ul class="text-xs text-gray-600 mt-2 space-y-1">
              <li>• 查询项目进度</li>
              <li>• 管理任务状态</li>
              <li>• 分析数据统计</li>
              <li>• 解答技术问题</li>
            </ul>
          </div>
        </div>

        <!-- 用户消息 -->
        <div v-for="(message, index) in messages" :key="index" 
             :class="['flex', message.isUser ? 'justify-end' : 'justify-start']">
          <div :class="[
            'rounded-lg p-3 max-w-[80%]',
            message.isUser 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700'
          ]">
            <p class="text-sm">{{ message.text }}</p>
            <span class="text-xs opacity-70 mt-1 block">{{ message.time }}</span>
          </div>
        </div>
      </div>

      <!-- 输入框 -->
      <div class="p-4 border-t border-gray-200">
        <div class="flex space-x-2">
          <input 
            v-model="inputMessage"
            @keyup.enter="sendMessage"
            placeholder="输入您的问题..."
            class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            @click="sendMessage"
            :disabled="!inputMessage.trim()"
            class="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            发送
          </button>
        </div>
      </div>
    </div>

    <!-- 浮动按钮 -->
    <button 
      @click="toggleChat"
      class="w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 flex items-center justify-center"
    >
      <svg v-if="!isOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isOpen = ref(false)
const inputMessage = ref('')
const messages = ref([
  {
    text: '您好！我是AI助手，可以帮您查询项目进度、管理任务状态、分析数据统计等。有什么可以帮您的吗？',
    isUser: false,
    time: '刚刚'
  }
])

function toggleChat() {
  isOpen.value = !isOpen.value
}

function sendMessage() {
  if (!inputMessage.value.trim()) return

  // 添加用户消息
  messages.value.push({
    text: inputMessage.value,
    isUser: true,
    time: '刚刚'
  })

  const userMessage = inputMessage.value.toLowerCase()
  inputMessage.value = ''

  // 模拟AI回复
  setTimeout(() => {
    let response = ''
    
    if (userMessage.includes('项目') || userMessage.includes('project')) {
      response = '目前您有3个活跃项目，2个项目正在进行中，1个项目已完成。需要查看具体项目详情吗？'
    } else if (userMessage.includes('任务') || userMessage.includes('task')) {
      response = '您当前有5个待办任务，其中2个高优先级任务需要尽快处理。需要我帮您安排任务优先级吗？'
    } else if (userMessage.includes('数据') || userMessage.includes('统计')) {
      response = '本月项目完成率85%，任务完成率92%，团队协作效率良好。需要详细的数据分析报告吗？'
    } else if (userMessage.includes('帮助') || userMessage.includes('help')) {
      response = '我可以帮您：1. 查询项目信息 2. 管理任务状态 3. 分析统计数据 4. 解答技术问题。请告诉我您需要什么帮助？'
    } else {
      response = '我理解您的问题了。作为AI助手，我主要专注于项目管理相关的查询和分析。如果您有具体的项目、任务或数据方面的问题，我很乐意为您提供帮助！'
    }

    messages.value.push({
      text: response,
      isUser: false,
      time: '刚刚'
    })
  }, 1000)
}
</script>

<style scoped>
/* 自定义滚动条 */
.chat-container::-webkit-scrollbar {
  width: 4px;
}

.chat-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.chat-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 10px;
}

.chat-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>