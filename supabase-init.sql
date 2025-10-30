-- AI项目管理平台 - Supabase数据库初始化脚本
-- 根据新的表结构设计，主键id从1开始

-- 1. 用户表 (users)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'manager', 'member', 'guest')),
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 组织表 (organizations)
CREATE TABLE IF NOT EXISTS organizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    logo_url TEXT,
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 项目表 (projects)
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'cancelled')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    start_date DATE,
    end_date DATE,
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 项目成员关联表 (project_members)
CREATE TABLE IF NOT EXISTS project_members (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'manager', 'member', 'guest')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

-- 5. 任务表 (tasks)
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done', 'cancelled')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    due_date DATE,
    estimated_hours INTEGER,
    actual_hours INTEGER,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    assignee_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    reporter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. AI对话历史表 (chat_history)
CREATE TABLE IF NOT EXISTS chat_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
    ai_level VARCHAR(20) DEFAULT 'standard' CHECK (ai_level IN ('standard', 'advanced', 'expert')),
    message_type VARCHAR(20) NOT NULL CHECK (message_type IN ('question', 'command', 'analysis', 'suggestion')),
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    context_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. 知识库文档表 (documents)
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    file_url TEXT,
    file_type VARCHAR(50),
    file_size INTEGER,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    uploaded_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. 系统通知表 (notifications)
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('invitation', 'task_assigned', 'project_update', 'system')),
    is_read BOOLEAN DEFAULT false,
    related_entity_type VARCHAR(50),
    related_entity_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. 邀请管理表 (invitations)
CREATE TABLE IF NOT EXISTS invitations (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(100) UNIQUE NOT NULL,
    inviter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'manager', 'member', 'guest')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. 组织成员关联表 (organization_members)
CREATE TABLE IF NOT EXISTS organization_members (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'manager', 'member', 'guest')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_organizations_owner_id ON organizations(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_organization_id ON projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_project_id ON chat_history(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_project_id ON documents(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_organization_id ON documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);
CREATE INDEX IF NOT EXISTS idx_organization_members_org_id ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_user_id ON organization_members(user_id);

-- 启用行级安全策略
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- 创建简单的行级安全策略
-- 用户表策略：用户只能查看和修改自己的数据
-- 注意：由于我们使用整数ID，暂时禁用行级安全策略或使用其他方式
-- CREATE POLICY "用户数据策略" ON users FOR ALL USING (auth.uid()::text = id::text);

-- 组织表策略：用户可以查看自己所属的组织
-- CREATE POLICY "组织查看策略" ON organizations FOR SELECT USING (
--     EXISTS (SELECT 1 FROM organization_members WHERE organization_id = organizations.id AND user_id = auth.uid()::integer)
-- );

-- 项目表策略：用户可以查看自己所属组织的项目
-- CREATE POLICY "项目查看策略" ON projects FOR SELECT USING (
--     EXISTS (SELECT 1 FROM organization_members WHERE organization_id = projects.organization_id AND user_id = auth.uid()::integer)
-- );

-- 插入默认数据
-- 创建默认管理员用户（密码：Admin123!）
INSERT INTO users (email, password_hash, display_name, role) VALUES 
('admin@aiproject.com', '$2b$10$examplehash', '系统管理员', 'admin')
ON CONFLICT (email) DO NOTHING;

-- 创建默认组织
INSERT INTO organizations (name, description, owner_id) VALUES 
('默认组织', '系统默认组织', 1)
ON CONFLICT (id) DO NOTHING;

-- 将管理员添加到默认组织
INSERT INTO organization_members (organization_id, user_id, role) VALUES 
(1, 1, 'owner')
ON CONFLICT (organization_id, user_id) DO NOTHING;

-- 创建示例项目
INSERT INTO projects (name, description, status, progress_percentage, owner_id, organization_id) VALUES 
('示例项目', '这是一个示例项目，用于演示平台功能', 'active', 75, 1, 1)
ON CONFLICT (id) DO NOTHING;

-- 将管理员添加到示例项目
INSERT INTO project_members (project_id, user_id, role) VALUES 
(1, 1, 'owner')
ON CONFLICT (project_id, user_id) DO NOTHING;

-- 创建示例任务
INSERT INTO tasks (title, description, status, project_id, assignee_id, reporter_id) VALUES 
('项目初始化', '完成项目基础设置和配置', 'done', 1, 1, 1),
('用户界面设计', '设计项目的主要用户界面', 'in_progress', 1, 1, 1),
('数据库设计', '设计并实现项目数据库结构', 'todo', 1, 1, 1)
ON CONFLICT (id) DO NOTHING;

-- 创建示例文档
INSERT INTO documents (title, content, project_id, organization_id, uploaded_by) VALUES 
('项目需求文档', '详细的项目需求说明文档', 1, 1, 1),
('技术架构设计', '项目的技术架构和系统设计', 1, 1, 1)
ON CONFLICT (id) DO NOTHING;

-- 创建示例AI对话记录
INSERT INTO chat_history (user_id, project_id, organization_id, message_type, user_message, ai_response) VALUES 
(1, 1, 1, 'question', '如何开始这个项目？', '建议从项目需求分析和团队组建开始，然后制定详细的项目计划。')
ON CONFLICT (id) DO NOTHING;

-- 显示创建结果
SELECT '✅ 数据库表创建完成' as status;
SELECT '用户数量:' as info, COUNT(*) as count FROM users;
SELECT '组织数量:' as info, COUNT(*) as count FROM organizations;
SELECT '项目数量:' as info, COUNT(*) as count FROM projects;
SELECT '任务数量:' as info, COUNT(*) as count FROM tasks;
SELECT '文档数量:' as info, COUNT(*) as count FROM documents;

SELECT '🎉 AI项目管理平台数据库初始化完成！' as final_status;