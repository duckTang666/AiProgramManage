-- AI项目管理平台 - 模拟数据脚本
-- 在运行 supabase-init.sql 后执行此脚本插入模拟数据

-- 1. 插入模拟用户数据
INSERT INTO users (email, password_hash, display_name, role, avatar_url) VALUES 
('admin@aiproject.com', '$2b$10$examplehash', '系统管理员', 'admin', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'),
('manager1@aiproject.com', '$2b$10$examplehash', '项目经理张三', 'manager', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'),
('manager2@aiproject.com', '$2b$10$examplehash', '项目经理李四', 'manager', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face'),
('developer1@aiproject.com', '$2b$10$examplehash', '开发工程师王五', 'member', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'),
('developer2@aiproject.com', '$2b$10$examplehash', '开发工程师赵六', 'member', 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=150&h=150&fit=crop&crop=face'),
('designer1@aiproject.com', '$2b$10$examplehash', 'UI设计师钱七', 'member', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'),
('tester1@aiproject.com', '$2b$10$examplehash', '测试工程师孙八', 'member', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'),
('product1@aiproject.com', '$2b$10$examplehash', '产品经理周九', 'manager', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face')
ON CONFLICT (email) DO NOTHING;

-- 2. 插入模拟组织数据
INSERT INTO organizations (name, description, owner_id, logo_url) VALUES 
('AI技术研发中心', '专注于人工智能技术研发与创新', 1, 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&h=200&fit=crop'),
('产品创新事业部', '负责产品创新与用户体验优化', 1, 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=200&h=200&fit=crop'),
('数据智能实验室', '大数据分析与智能决策研究', 1, 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&h=200&fit=crop')
ON CONFLICT (id) DO NOTHING;

-- 3. 插入组织成员数据
INSERT INTO organization_members (organization_id, user_id, role) VALUES 
(1, 1, 'owner'), (1, 4, 'admin'), (1, 5, 'member'), (1, 6, 'member'), (1, 7, 'member'),
(2, 1, 'owner'), (2, 4, 'admin'), (2, 5, 'member'), (2, 6, 'member'),
(3, 1, 'owner'), (3, 4, 'admin'), (3, 5, 'member'), (3, 6, 'member')
ON CONFLICT (organization_id, user_id) DO NOTHING;

-- 4. 插入模拟项目数据
INSERT INTO projects (name, description, status, priority, progress_percentage, start_date, end_date, owner_id, organization_id) VALUES 
('智能客服系统开发', '基于AI的智能客服系统，支持自然语言处理和多轮对话', 'active', 'high', 75, '2024-01-15', '2024-06-30', 1, 1),
('数据分析平台重构', '重构现有数据分析平台，提升性能和用户体验', 'active', 'medium', 60, '2024-02-01', '2024-07-15', 1, 2),
('移动端应用开发', '开发新一代移动端应用，支持iOS和Android平台', 'planning', 'high', 20, '2024-03-01', '2024-09-30', 1, 2),
('机器学习模型优化', '优化现有机器学习模型，提升准确率和效率', 'active', 'urgent', 85, '2024-01-10', '2024-05-20', 1, 3),
('UI组件库建设', '建立统一的UI组件库，提升开发效率和一致性', 'completed', 'medium', 100, '2023-11-01', '2024-01-31', 1, 1),
('自动化测试框架', '构建自动化测试框架，提升测试效率和质量', 'active', 'medium', 45, '2024-02-15', '2024-08-31', 1, 1)
ON CONFLICT (id) DO NOTHING;

-- 5. 插入项目成员数据
INSERT INTO project_members (project_id, user_id, role) VALUES 
(1, 1, 'owner'), (1, 4, 'member'), (1, 5, 'member'), (1, 6, 'member'),
(2, 1, 'owner'), (2, 5, 'member'), (2, 6, 'member'), (2, 7, 'member'),
(3, 1, 'owner'), (3, 4, 'member'), (3, 6, 'member'),
(4, 1, 'owner'), (4, 5, 'member'), (4, 6, 'member'),
(5, 1, 'owner'), (5, 4, 'member'), (5, 7, 'member'),
(6, 1, 'owner'), (6, 4, 'member'), (6, 5, 'member')
ON CONFLICT (project_id, user_id) DO NOTHING;

-- 6. 插入模拟任务数据
INSERT INTO tasks (title, description, status, priority, due_date, estimated_hours, actual_hours, project_id, assignee_id, reporter_id) VALUES 
('用户认证模块开发', '实现用户登录、注册、权限验证功能', 'done', 'high', '2024-02-28', 40, 35, 1, 4, 1),
('对话引擎集成', '集成第三方AI对话引擎，实现基础对话功能', 'in_progress', 'high', '2024-04-15', 60, 45, 1, 5, 1),
('UI界面设计', '设计智能客服系统的用户界面', 'in_progress', 'medium', '2024-03-31', 30, 20, 1, 6, 1),
('数据库设计优化', '优化数据分析平台的数据库结构', 'todo', 'medium', '2024-04-30', 25, NULL, 2, 5, 1),
('API接口开发', '开发数据分析平台的后端API接口', 'in_progress', 'high', '2024-05-15', 50, 30, 2, 6, 1),
('性能测试', '对数据分析平台进行性能测试和优化', 'todo', 'medium', '2024-06-30', 20, NULL, 2, 7, 1),
('需求分析文档', '编写移动端应用的需求分析文档', 'done', 'medium', '2024-02-15', 15, 12, 3, 1, 1),
('技术选型评估', '评估移动端开发的技术方案和框架', 'in_progress', 'high', '2024-03-31', 20, 10, 3, 4, 1),
('模型训练数据准备', '准备机器学习模型的训练数据集', 'done', 'urgent', '2024-02-20', 35, 30, 4, 1, 1),
('模型参数调优', '调整模型参数，优化预测准确率', 'in_progress', 'high', '2024-04-30', 45, 25, 4, 5, 1),
('组件库文档编写', '编写UI组件库的使用文档和示例', 'done', 'medium', '2024-01-20', 20, 18, 5, 6, 1),
('测试用例设计', '设计自动化测试框架的测试用例', 'in_progress', 'medium', '2024-05-31', 30, 15, 6, 7, 1),
('测试脚本开发', '开发自动化测试脚本', 'todo', 'medium', '2024-07-15', 40, NULL, 6, 4, 1)
ON CONFLICT (id) DO NOTHING;

-- 7. 插入模拟文档数据
INSERT INTO documents (title, content, file_type, file_size, project_id, organization_id, uploaded_by, is_public) VALUES 
('智能客服系统需求文档', '详细的需求分析文档，包含功能规格和技术要求', 'pdf', 2048, 1, 1, 1, true),
('数据分析平台架构设计', '系统架构设计文档，包含技术选型和模块划分', 'pdf', 3072, 2, 2, 1, true),
('UI组件库设计规范', 'UI组件库的设计规范和样式指南', 'pdf', 1536, 5, 1, 1, true),
('机器学习模型技术方案', '机器学习模型的技术实现方案和算法选择', 'docx', 2560, 4, 3, 1, false),
('项目进度报告Q1', '第一季度项目进度总结和下一阶段计划', 'xlsx', 1024, 1, 1, 1, true),
('测试用例设计文档', '自动化测试框架的测试用例设计文档', 'pdf', 1792, 6, 1, 1, true)
ON CONFLICT (id) DO NOTHING;

-- 8. 插入模拟AI对话历史数据
INSERT INTO chat_history (user_id, project_id, organization_id, ai_level, message_type, user_message, ai_response) VALUES 
(1, 1, 1, 'advanced', 'question', '如何优化智能客服系统的响应速度？', '建议从以下几个方面优化：1. 使用缓存技术减少数据库查询 2. 优化AI模型推理性能 3. 采用异步处理机制 4. 实施负载均衡'),
(1, 2, 2, 'standard', 'analysis', '请分析当前数据分析平台的性能瓶颈', '分析发现主要瓶颈在数据库查询和数据处理环节。建议：1. 优化SQL查询语句 2. 增加索引 3. 使用数据缓存 4. 考虑分库分表'),
(1, 4, 3, 'expert', 'suggestion', '机器学习模型训练过程中出现过拟合怎么办？', '过拟合的解决方案：1. 增加训练数据量 2. 使用正则化技术 3. 采用早停法 4. 使用Dropout 5. 数据增强'),
(1, 5, 1, 'standard', 'question', 'UI组件库应该如何设计才能提高复用性？', '提高UI组件复用性的建议：1. 遵循单一职责原则 2. 提供丰富的配置选项 3. 支持主题定制 4. 完善的文档和示例 5. 版本管理'),
(1, 6, 1, 'advanced', 'command', '生成自动化测试框架的技术选型建议', '推荐技术栈：1. 测试框架：Jest/Cypress 2. 持续集成：GitHub Actions 3. 报告生成：Allure 4. 并行测试：WebDriver'),
(1, 3, 2, 'standard', 'question', '移动端应用开发应该注意哪些性能优化点？', '移动端性能优化要点：1. 图片压缩和懒加载 2. 代码分割和按需加载 3. 减少重绘和回流 4. 使用硬件加速 5. 内存管理优化'),
(1, 1, 1, 'advanced', 'analysis', '分析当前项目进度和风险', '项目进度分析：已完成75%，主要风险：1. 第三方API集成延迟 2. 测试资源不足 3. 需求变更频繁。建议加强沟通和风险管理'),
(1, 2, 2, 'standard', 'suggestion', '如何提高团队协作效率？', '提高团队协作效率的建议：1. 明确分工和责任 2. 定期站会和复盘 3. 使用协作工具 4. 建立知识库 5. 鼓励技术分享')
ON CONFLICT (id) DO NOTHING;

-- 9. 插入模拟通知数据
INSERT INTO notifications (user_id, title, message, type, is_read, related_entity_type, related_entity_id) VALUES 
(1, '新任务分配', '您被分配到任务"对话引擎集成"', 'task_assigned', false, 'task', 2),
(1, '项目更新', '数据分析平台项目进度已更新至60%', 'project_update', false, 'project', 2),
(1, '文档审核', '请审核智能客服系统需求文档', 'system', true, 'document', 1),
(1, '会议提醒', '明天上午10点有技术评审会议', 'system', false, NULL, NULL),
(1, '设计反馈', 'UI界面设计已收到反馈意见', 'project_update', true, 'project', 1),
(1, '测试任务', '新的测试用例需要执行', 'task_assigned', false, 'task', 12),
(1, '需求确认', '移动端应用需求需要确认', 'project_update', false, 'project', 3),
(1, '系统通知', '数据库备份已完成', 'system', true, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- 10. 显示数据插入结果
SELECT '✅ 模拟数据插入完成' as status;
SELECT '用户数量:' as info, COUNT(*) as count FROM users;
SELECT '组织数量:' as info, COUNT(*) as count FROM organizations;
SELECT '项目数量:' as info, COUNT(*) as count FROM projects;
SELECT '任务数量:' as info, COUNT(*) as count FROM tasks;
SELECT '文档数量:' as info, COUNT(*) as count FROM documents;
SELECT 'AI对话记录:' as info, COUNT(*) as count FROM chat_history;
SELECT '通知数量:' as info, COUNT(*) as count FROM notifications;

SELECT '🎉 模拟数据生成完成！现在可以在前端页面查看数据了。' as final_status;