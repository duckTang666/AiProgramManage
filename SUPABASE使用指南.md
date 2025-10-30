# Supabase数据库连接使用指南

## 📋 概述

本文档指导如何连接和使用Supabase数据库，包括数据库初始化、连接测试和API使用。

## 🔧 环境配置

### 1. 环境变量
项目根目录下的 `.env` 文件已配置好Supabase连接信息：

```env
VITE_SUPABASE_URL=https://pgnjxsvtxrqsuukadlzu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnbmp4c3Z0eHJxc3V1a2FkbHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MTQ5NjYsImV4cCI6MjA3NzE5MDk2Nn0.kw0yn1Wnn4GzkXbPYRUcTjyQr6esb-BED5h-OdFiEMI
```

### 2. 依赖安装
确保已安装Supabase客户端：
```bash
npm install @supabase/supabase-js
```

## 🗄️ 数据库初始化

### 1. 执行初始化脚本
在Supabase控制台中执行 `supabase-init.sql` 文件：

1. 登录 [Supabase控制台](https://supabase.com/dashboard)
2. 选择项目 `pgnjxsvtxrqsuukadlzu`
3. 进入 SQL Editor
4. 复制 `supabase-init.sql` 内容并执行

### 2. 初始化脚本功能
- 创建10个核心数据表
- 设置索引和约束
- 启用行级安全策略
- 插入示例数据

## 🔗 连接测试

### 1. 运行连接测试
```bash
node test-supabase-connection.js
```

### 2. 测试内容
- 认证连接测试
- 数据库查询测试
- 数据插入测试
- 表结构验证

## 📊 数据库表结构

### 核心数据表

| 表名 | 描述 | 主键 |
|------|------|------|
| `users` | 用户信息 | `id` (SERIAL) |
| `organizations` | 组织信息 | `id` (SERIAL) |
| `projects` | 项目信息 | `id` (SERIAL) |
| `tasks` | 任务信息 | `id` (SERIAL) |
| `chat_history` | AI对话历史 | `id` (SERIAL) |
| `documents` | 知识库文档 | `id` (SERIAL) |
| `notifications` | 系统通知 | `id` (SERIAL) |
| `invitations` | 邀请管理 | `id` (SERIAL) |
| `project_members` | 项目成员 | `id` (SERIAL) |
| `organization_members` | 组织成员 | `id` (SERIAL) |

### 表关系图
```
users (1) ←→ (N) organization_members (N) ←→ (1) organizations
organizations (1) ←→ (N) projects
projects (1) ←→ (N) tasks
projects (1) ←→ (N) project_members (N) ←→ (1) users
users (1) ←→ (N) chat_history
```

## 🔌 API使用

### 1. 导入Supabase客户端
```typescript
import { supabase } from '@/lib/supabase'
import { 
  UserService, 
  OrganizationService, 
  ProjectService,
  TaskService,
  ChatService,
  StatsService 
} from '@/lib/database'
```

### 2. 用户服务示例
```typescript
// 获取当前用户
const user = await UserService.getCurrentUser()

// 创建用户
const newUser = await UserService.createUser({
  email: 'user@example.com',
  password_hash: 'hashed_password',
  display_name: '新用户',
  role: 'member'
})
```

### 3. 组织服务示例
```typescript
// 获取用户组织
const organizations = await OrganizationService.getUserOrganizations(userId)

// 创建组织
const newOrg = await OrganizationService.createOrganization({
  name: '新组织',
  description: '组织描述',
  owner_id: userId
})
```

### 4. 项目服务示例
```typescript
// 获取组织项目
const projects = await ProjectService.getOrganizationProjects(orgId)

// 创建项目
const newProject = await ProjectService.createProject({
  name: '新项目',
  description: '项目描述',
  organization_id: orgId,
  owner_id: userId
})
```

### 5. 任务服务示例
```typescript
// 获取项目任务
const tasks = await TaskService.getProjectTasks(projectId)

// 创建任务
const newTask = await TaskService.createTask({
  title: '新任务',
  description: '任务描述',
  project_id: projectId,
  reporter_id: userId
})
```

### 6. AI聊天服务示例
```typescript
// 获取聊天历史
const chatHistory = await ChatService.getChatHistory(userId, projectId)

// 保存聊天记录
const savedMessage = await ChatService.saveChatMessage({
  user_id: userId,
  project_id: projectId,
  message_type: 'question',
  user_message: '用户问题',
  ai_response: 'AI回答'
})
```

### 7. 统计服务示例
```typescript
// 获取用户统计
const userStats = await StatsService.getUserStats(userId)

// 获取组织统计
const orgStats = await StatsService.getOrganizationStats(orgId)
```

## 🛡️ 安全策略

### 行级安全策略 (RLS)
- 用户只能访问自己的数据
- 组织成员只能访问所属组织的数据
- 项目成员只能访问所属项目的数据

### 认证策略
- 使用Supabase Auth进行用户认证
- JWT令牌管理会话
- 基于角色的访问控制

## 🚀 快速开始

### 1. 初始化数据库
```bash
# 在Supabase控制台执行 supabase-init.sql
```

### 2. 测试连接
```bash
node test-supabase-connection.js
```

### 3. 启动应用
```bash
npm run dev
```

### 4. 访问应用
打开 http://localhost:5173

## 🔧 故障排除

### 常见问题

1. **连接失败**
   - 检查网络连接
   - 验证环境变量配置
   - 确认Supabase项目状态

2. **表不存在**
   - 执行初始化脚本
   - 检查表名拼写
   - 验证权限设置

3. **权限错误**
   - 检查行级安全策略
   - 验证用户认证状态
   - 确认API密钥权限

### 调试工具
- 使用 `test-supabase-connection.js` 进行连接测试
- 查看浏览器开发者工具网络请求
- 使用Supabase控制台的日志功能

## 📈 性能优化

### 查询优化
- 使用索引加速查询
- 限制返回字段数量
- 使用分页查询大数据集

### 缓存策略
- 实现客户端数据缓存
- 使用Supabase实时订阅
- 批量处理相关查询

## 📚 相关文件

- `src/lib/supabase.ts` - Supabase客户端配置
- `src/lib/database.ts` - 数据库服务封装
- `supabase-init.sql` - 数据库初始化脚本
- `test-supabase-connection.js` - 连接测试脚本

## 🆘 技术支持

如遇问题，请检查：
1. Supabase项目状态
2. 网络连接情况
3. 环境变量配置
4. 数据库表结构

---

**文档版本**: v1.0  
**最后更新**: 2025-10-29  
**维护者**: AI助手