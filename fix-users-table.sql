-- 修复用户表结构，确保所有必需的表都存在
-- 这个脚本需要在Supabase控制台的SQL编辑器中执行

-- 1. 检查并创建用户表
DO $$
BEGIN
    -- 检查users表是否存在
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'users'
    ) THEN
        -- 创建用户表
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            auth_id UUID UNIQUE,
            email VARCHAR(255) UNIQUE NOT NULL,
            display_name VARCHAR(100) NOT NULL,
            avatar_url TEXT,
            role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'manager', 'member', 'guest')),
            is_active BOOLEAN DEFAULT true,
            last_login_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE '✅ 已成功创建users表';
    ELSE
        RAISE NOTICE 'ℹ️ users表已存在，无需创建';
    END IF;
END $$;

-- 2. 检查并创建其他必需的表
DO $$
BEGIN
    -- 检查organizations表是否存在
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'organizations'
    ) THEN
        CREATE TABLE organizations (
            id SERIAL PRIMARY KEY,
            name VARCHAR(200) NOT NULL,
            description TEXT,
            logo_url TEXT,
            owner_id INTEGER NOT NULL,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE '✅ 已成功创建organizations表';
    ELSE
        RAISE NOTICE 'ℹ️ organizations表已存在，无需创建';
    END IF;
    
    -- 检查projects表是否存在
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'projects'
    ) THEN
        CREATE TABLE projects (
            id SERIAL PRIMARY KEY,
            name VARCHAR(200) NOT NULL,
            description TEXT,
            status VARCHAR(20) DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'cancelled')),
            priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
            progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
            start_date DATE,
            end_date DATE,
            owner_id INTEGER NOT NULL,
            organization_id INTEGER NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE '✅ 已成功创建projects表';
    ELSE
        RAISE NOTICE 'ℹ️ projects表已存在，无需创建';
    END IF;
    
    -- 检查organization_members表是否存在
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'organization_members'
    ) THEN
        CREATE TABLE organization_members (
            id SERIAL PRIMARY KEY,
            organization_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'manager', 'member', 'guest')),
            joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(organization_id, user_id)
        );
        RAISE NOTICE '✅ 已成功创建organization_members表';
    ELSE
        RAISE NOTICE 'ℹ️ organization_members表已存在，无需创建';
    END IF;
    
    -- 检查project_members表是否存在
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'project_members'
    ) THEN
        CREATE TABLE project_members (
            id SERIAL PRIMARY KEY,
            project_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'manager', 'member', 'guest')),
            joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(project_id, user_id)
        );
        RAISE NOTICE '✅ 已成功创建project_members表';
    ELSE
        RAISE NOTICE 'ℹ️ project_members表已存在，无需创建';
    END IF;
    
    -- 检查tasks表是否存在
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'tasks'
    ) THEN
        CREATE TABLE tasks (
            id SERIAL PRIMARY KEY,
            title VARCHAR(200) NOT NULL,
            description TEXT,
            status VARCHAR(20) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done', 'cancelled')),
            priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
            due_date DATE,
            estimated_hours INTEGER,
            actual_hours INTEGER,
            project_id INTEGER NOT NULL,
            assignee_id INTEGER,
            reporter_id INTEGER NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE '✅ 已成功创建tasks表';
    ELSE
        RAISE NOTICE 'ℹ️ tasks表已存在，无需创建';
    END IF;
    
    -- 检查chat_history表是否存在
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'chat_history'
    ) THEN
        CREATE TABLE chat_history (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            project_id INTEGER,
            organization_id INTEGER,
            ai_level VARCHAR(20) DEFAULT 'standard' CHECK (ai_level IN ('standard', 'advanced', 'expert')),
            message_type VARCHAR(20) NOT NULL CHECK (message_type IN ('question', 'command', 'analysis', 'suggestion')),
            user_message TEXT NOT NULL,
            ai_response TEXT NOT NULL,
            context_data JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE '✅ 已成功创建chat_history表';
    ELSE
        RAISE NOTICE 'ℹ️ chat_history表已存在，无需创建';
    END IF;
END $$;

-- 3. 添加外键约束（如果表已存在但缺少外键）
DO $$
BEGIN
    -- 为organizations表添加外键
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_name = 'organizations' AND constraint_name = 'organizations_owner_id_fkey'
    ) THEN
        ALTER TABLE organizations ADD CONSTRAINT organizations_owner_id_fkey 
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE;
        RAISE NOTICE '✅ 已为organizations表添加owner_id外键';
    END IF;
    
    -- 为projects表添加外键
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_name = 'projects' AND constraint_name = 'projects_owner_id_fkey'
    ) THEN
        ALTER TABLE projects ADD CONSTRAINT projects_owner_id_fkey 
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE;
        RAISE NOTICE '✅ 已为projects表添加owner_id外键';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_name = 'projects' AND constraint_name = 'projects_organization_id_fkey'
    ) THEN
        ALTER TABLE projects ADD CONSTRAINT projects_organization_id_fkey 
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;
        RAISE NOTICE '✅ 已为projects表添加organization_id外键';
    END IF;
    
    -- 为organization_members表添加外键
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_name = 'organization_members' AND constraint_name = 'organization_members_organization_id_fkey'
    ) THEN
        ALTER TABLE organization_members ADD CONSTRAINT organization_members_organization_id_fkey 
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;
        RAISE NOTICE '✅ 已为organization_members表添加organization_id外键';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_name = 'organization_members' AND constraint_name = 'organization_members_user_id_fkey'
    ) THEN
        ALTER TABLE organization_members ADD CONSTRAINT organization_members_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
        RAISE NOTICE '✅ 已为organization_members表添加user_id外键';
    END IF;
    
    -- 为tasks表添加外键
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_name = 'tasks' AND constraint_name = 'tasks_project_id_fkey'
    ) THEN
        ALTER TABLE tasks ADD CONSTRAINT tasks_project_id_fkey 
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
        RAISE NOTICE '✅ 已为tasks表添加project_id外键';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_name = 'tasks' AND constraint_name = 'tasks_assignee_id_fkey'
    ) THEN
        ALTER TABLE tasks ADD CONSTRAINT tasks_assignee_id_fkey 
        FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL;
        RAISE NOTICE '✅ 已为tasks表添加assignee_id外键';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_name = 'tasks' AND constraint_name = 'tasks_reporter_id_fkey'
    ) THEN
        ALTER TABLE tasks ADD CONSTRAINT tasks_reporter_id_fkey 
        FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE;
        RAISE NOTICE '✅ 已为tasks表添加reporter_id外键';
    END IF;
    
    -- 为chat_history表添加外键
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_name = 'chat_history' AND constraint_name = 'chat_history_user_id_fkey'
    ) THEN
        ALTER TABLE chat_history ADD CONSTRAINT chat_history_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
        RAISE NOTICE '✅ 已为chat_history表添加user_id外键';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_name = 'chat_history' AND constraint_name = 'chat_history_project_id_fkey'
    ) THEN
        ALTER TABLE chat_history ADD CONSTRAINT chat_history_project_id_fkey 
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;
        RAISE NOTICE '✅ 已为chat_history表添加project_id外键';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_name = 'chat_history' AND constraint_name = 'chat_history_organization_id_fkey'
    ) THEN
        ALTER TABLE chat_history ADD CONSTRAINT chat_history_organization_id_fkey 
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL;
        RAISE NOTICE '✅ 已为chat_history表添加organization_id外键';
    END IF;
END $$;

-- 4. 创建索引以提高查询性能
DO $$
BEGIN
    -- 为用户表创建索引
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'users' AND indexname = 'idx_users_email'
    ) THEN
        CREATE INDEX idx_users_email ON users(email);
        RAISE NOTICE '✅ 已创建idx_users_email索引';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'users' AND indexname = 'idx_users_role'
    ) THEN
        CREATE INDEX idx_users_role ON users(role);
        RAISE NOTICE '✅ 已创建idx_users_role索引';
    END IF;
    
    -- 为组织表创建索引
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'organizations' AND indexname = 'idx_organizations_owner_id'
    ) THEN
        CREATE INDEX idx_organizations_owner_id ON organizations(owner_id);
        RAISE NOTICE '✅ 已创建idx_organizations_owner_id索引';
    END IF;
    
    -- 为项目表创建索引
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'projects' AND indexname = 'idx_projects_organization_id'
    ) THEN
        CREATE INDEX idx_projects_organization_id ON projects(organization_id);
        RAISE NOTICE '✅ 已创建idx_projects_organization_id索引';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'projects' AND indexname = 'idx_projects_status'
    ) THEN
        CREATE INDEX idx_projects_status ON projects(status);
        RAISE NOTICE '✅ 已创建idx_projects_status索引';
    END IF;
    
    -- 为任务表创建索引
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'tasks' AND indexname = 'idx_tasks_project_id'
    ) THEN
        CREATE INDEX idx_tasks_project_id ON tasks(project_id);
        RAISE NOTICE '✅ 已创建idx_tasks_project_id索引';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'tasks' AND indexname = 'idx_tasks_assignee_id'
    ) THEN
        CREATE INDEX idx_tasks_assignee_id ON tasks(assignee_id);
        RAISE NOTICE '✅ 已创建idx_tasks_assignee_id索引';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'tasks' AND indexname = 'idx_tasks_status'
    ) THEN
        CREATE INDEX idx_tasks_status ON tasks(status);
        RAISE NOTICE '✅ 已创建idx_tasks_status索引';
    END IF;
    
    -- 为组织成员表创建索引
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'organization_members' AND indexname = 'idx_organization_members_org_id'
    ) THEN
        CREATE INDEX idx_organization_members_org_id ON organization_members(organization_id);
        RAISE NOTICE '✅ 已创建idx_organization_members_org_id索引';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'organization_members' AND indexname = 'idx_organization_members_user_id'
    ) THEN
        CREATE INDEX idx_organization_members_user_id ON organization_members(user_id);
        RAISE NOTICE '✅ 已创建idx_organization_members_user_id索引';
    END IF;
    
    -- 为聊天历史表创建索引
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'chat_history' AND indexname = 'idx_chat_history_user_id'
    ) THEN
        CREATE INDEX idx_chat_history_user_id ON chat_history(user_id);
        RAISE NOTICE '✅ 已创建idx_chat_history_user_id索引';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'chat_history' AND indexname = 'idx_chat_history_project_id'
    ) THEN
        CREATE INDEX idx_chat_history_project_id ON chat_history(project_id);
        RAISE NOTICE '✅ 已创建idx_chat_history_project_id索引';
    END IF;
END $$;

-- 5. 插入默认数据（如果不存在）
DO $$
BEGIN
    -- 检查默认管理员用户是否存在
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@aiproject.com') THEN
        INSERT INTO users (email, display_name, role) VALUES 
        ('admin@aiproject.com', '系统管理员', 'admin');
        RAISE NOTICE '✅ 已创建默认管理员用户';
    ELSE
        RAISE NOTICE 'ℹ️ 默认管理员用户已存在';
    END IF;
    
    -- 检查默认组织是否存在
    IF NOT EXISTS (SELECT 1 FROM organizations WHERE name = '默认组织') THEN
        INSERT INTO organizations (name, description, owner_id) VALUES 
        ('默认组织', '系统默认组织', 1);
        RAISE NOTICE '✅ 已创建默认组织';
    ELSE
        RAISE NOTICE 'ℹ️ 默认组织已存在';
    END IF;
    
    -- 将管理员添加到默认组织
    IF NOT EXISTS (SELECT 1 FROM organization_members WHERE organization_id = 1 AND user_id = 1) THEN
        INSERT INTO organization_members (organization_id, user_id, role) VALUES 
        (1, 1, 'owner');
        RAISE NOTICE '✅ 已将管理员添加到默认组织';
    ELSE
        RAISE NOTICE 'ℹ️ 管理员已在默认组织中';
    END IF;
    
    -- 检查示例项目是否存在，如果不存在则创建
    IF NOT EXISTS (SELECT 1 FROM projects WHERE name = '示例项目') THEN
        INSERT INTO projects (name, description, status, progress_percentage, owner_id, organization_id) VALUES 
        ('示例项目', '这是一个示例项目，用于演示平台功能', 'active', 75, 1, 1);
        RAISE NOTICE '✅ 已创建示例项目';
    ELSE
        RAISE NOTICE 'ℹ️ 示例项目已存在';
    END IF;
    
    -- 将管理员添加到示例项目（使用正确的项目ID）
    IF NOT EXISTS (SELECT 1 FROM project_members pm 
                   JOIN projects p ON pm.project_id = p.id 
                   WHERE p.name = '示例项目' AND pm.user_id = 1) THEN
        INSERT INTO project_members (project_id, user_id, role) 
        SELECT id, 1, 'owner' FROM projects WHERE name = '示例项目';
        RAISE NOTICE '✅ 已将管理员添加到示例项目';
    ELSE
        RAISE NOTICE 'ℹ️ 管理员已在示例项目中';
    END IF;
    
    -- 检查示例任务是否存在
    IF NOT EXISTS (SELECT 1 FROM tasks WHERE title = '项目初始化') THEN
        INSERT INTO tasks (title, description, status, project_id, assignee_id, reporter_id) 
        SELECT '项目初始化', '完成项目基础设置和配置', 'done', id, 1, 1 FROM projects WHERE name = '示例项目'
        UNION ALL
        SELECT '用户界面设计', '设计项目的主要用户界面', 'in_progress', id, 1, 1 FROM projects WHERE name = '示例项目'
        UNION ALL
        SELECT '数据库设计', '设计并实现项目数据库结构', 'todo', id, 1, 1 FROM projects WHERE name = '示例项目';
        RAISE NOTICE '✅ 已创建示例任务';
    ELSE
        RAISE NOTICE 'ℹ️ 示例任务已存在';
    END IF;
    
    -- 检查示例AI对话是否存在
    IF NOT EXISTS (SELECT 1 FROM chat_history WHERE user_id = 1) THEN
        INSERT INTO chat_history (user_id, project_id, organization_id, message_type, user_message, ai_response) VALUES 
        (1, 1, 1, 'question', '如何开始这个项目？', '建议从项目需求分析和团队组建开始，然后制定详细的项目计划。');
        RAISE NOTICE '✅ 已创建示例AI对话';
    ELSE
        RAISE NOTICE 'ℹ️ 示例AI对话已存在';
    END IF;
END $$;

-- 6. 显示修复结果
SELECT '修复完成状态:' as status;
SELECT 'users表:' as table_name, 
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') 
            THEN '✅ 存在' ELSE '❌ 不存在' END as status;
SELECT 'organizations表:' as table_name, 
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organizations') 
            THEN '✅ 存在' ELSE '❌ 不存在' END as status;
SELECT 'projects表:' as table_name, 
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects') 
            THEN '✅ 存在' ELSE '❌ 不存在' END as status;
SELECT 'organization_members表:' as table_name, 
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organization_members') 
            THEN '✅ 存在' ELSE '❌ 不存在' END as status;
SELECT 'tasks表:' as table_name, 
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tasks') 
            THEN '✅ 存在' ELSE '❌ 不存在' END as status;
SELECT 'chat_history表:' as table_name, 
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_history') 
            THEN '✅ 存在' ELSE '❌ 不存在' END as status;

SELECT '默认数据统计:' as stats;
SELECT '用户数量:' as info, COUNT(*) as count FROM users;
SELECT '组织数量:' as info, COUNT(*) as count FROM organizations;
SELECT '项目数量:' as info, COUNT(*) as count FROM projects;
SELECT '任务数量:' as info, COUNT(*) as count FROM tasks;
SELECT 'AI对话数量:' as info, COUNT(*) as count FROM chat_history;

SELECT '🎉 用户表修复完成！' as final_status;