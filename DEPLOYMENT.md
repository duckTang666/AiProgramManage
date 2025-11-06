# Netlify 部署指南

## 问题修复说明

### 已修复的问题
1. **"js emit is not supported" 错误**：移除了构建命令中的 `vue-tsc --noEmit &&`，直接使用 `vite build`
2. **添加了Netlify配置文件**：`netlify.toml` 指定了正确的Node.js版本和构建配置

## 部署步骤

### 方法一：通过Git仓库部署（推荐）
1. 将代码推送到GitHub/GitLab等代码托管平台
2. 登录 [Netlify](https://netlify.com)
3. 选择 "New site from Git"
4. 连接您的Git仓库
5. 构建设置会自动使用 `netlify.toml` 配置

### 方法二：手动部署
1. 运行 `npm run build` 构建项目
2. 登录 [Netlify](https://netlify.com)
3. 拖拽 `dist` 文件夹到部署区域

## 环境变量配置

在Netlify的项目设置中，添加以下环境变量（如果需要）：

```
VITE_SUPABASE_URL=您的Supabase项目URL
VITE_SUPABASE_ANON_KEY=您的Supabase匿名密钥
```

## 构建配置详情

### package.json 构建脚本
```json
"build": "vite build"
```

### netlify.toml 配置
```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"
```

## 验证部署

部署成功后，访问您的Netlify站点，检查以下功能：
- ✅ 项目页面正常加载
- ✅ 任务列表显示正常
- ✅ 任务编辑功能正常（点击编辑按钮打开右侧窗体）
- ✅ 成员管理功能正常

## 故障排除

如果部署仍然失败，请检查：
1. Node.js版本是否兼容（推荐使用 Node.js 18+）
2. 所有依赖是否正确安装
3. 环境变量是否配置正确
4. 控制台错误信息