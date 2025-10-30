-- AI项目管理平台 - 数据库状态检查脚本
-- 检查数据库表结构和数据状态

-- 1. 检查表是否存在
SELECT 
    table_name,
    CASE WHEN table_name IS NOT NULL THEN '✅ 存在' ELSE '❌ 缺失' END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'organizations', 'projects', 'project_members', 'tasks', 'chat_history', 'documents', 'notifications', 'invitations', 'organization_members');

-- 2. 检查行级安全策略状态
SELECT 
    tablename as table_name,
    CASE WHEN rowsecurity THEN '✅ 启用' ELSE '❌ 禁用' END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'organizations', 'projects', 'project_members', 'tasks', 'chat_history', 'documents', 'notifications', 'invitations', 'organization_members');

-- 3. 检查数据记录数量
SELECT '用户数量:' as info, COUNT(*) as count FROM users;
SELECT '组织数量:' as info, COUNT(*) as count FROM organizations;
SELECT '项目数量:' as info, COUNT(*) as count FROM projects;
SELECT '任务数量:' as info, COUNT(*) as count FROM tasks;
SELECT '文档数量:' as info, COUNT(*) as count FROM documents;

-- 4. 检查RLS策略
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'organizations', 'projects', 'project_members', 'tasks', 'chat_history', 'documents', 'notifications', 'invitations', 'organization_members');

-- 5. 检查默认数据是否存在
SELECT '默认管理员用户:' as info, COUNT(*) as count FROM users WHERE email = 'admin@aiproject.com';
SELECT '默认组织:' as info, COUNT(*) as count FROM organizations WHERE name = '默认组织';
SELECT '示例项目:' as info, COUNT(*) as count FROM projects WHERE name = '示例项目';

-- 6. 检查关联关系
SELECT '组织成员关系:' as info, COUNT(*) as count FROM organization_members;
SELECT '项目成员关系:' as info, COUNT(*) as count FROM project_members;

SELECT '🎉 数据库状态检查完成！' as final_status;