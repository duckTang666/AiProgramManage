-- AI项目管理平台 - 额外组织和项目数据生成脚本
-- 在现有模拟数据基础上添加更多测试数据

-- 1. 插入额外的组织数据
INSERT INTO organizations (name, description, owner_id, logo_url) VALUES 
('云计算创新中心', '专注于云计算技术研究和应用创新', 1, 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=200&h=200&fit=crop'),
('区块链技术实验室', '区块链技术研发与应用探索', 1, 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=200&h=200&fit=crop'),
('物联网事业部', '物联网设备连接与数据采集解决方案', 1, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop'),
('前端技术中心', '前端技术架构与用户体验优化', 1, 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=200&h=200&fit=crop'),
('后端架构组', '后端系统架构设计与性能优化', 1, 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=200&h=200&fit=crop'),
('移动开发团队', '移动端应用开发与优化', 1, 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=200&h=200&fit=crop'),
('数据科学部门', '数据分析和机器学习研究', 1, 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&h=200&fit=crop'),
('DevOps工程组', '持续集成和自动化运维', 1, 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=200&h=200&fit=crop')
ON CONFLICT (name) DO NOTHING;

-- 2. 为新增组织添加成员
INSERT INTO organization_members (organization_id, user_id, role) VALUES 
(4, 1, 'owner'), (4, 2, 'admin'), (4, 3, 'member'),
(5, 1, 'owner'), (5, 4, 'admin'), (5, 5, 'member'),
(6, 1, 'owner'), (6, 6, 'admin'), (6, 7, 'member'),
(7, 1, 'owner'), (7, 2, 'admin'), (7, 4, 'member'),
(8, 1, 'owner'), (8, 3, 'admin'), (8, 5, 'member'),
(9, 1, 'owner'), (9, 6, 'admin'), (9, 7, 'member'),
(10, 1, 'owner'), (10, 2, 'admin'), (10, 4, 'member'),
(11, 1, 'owner'), (11, 3, 'admin'), (11, 6, 'member')
ON CONFLICT (organization_id, user_id) DO NOTHING;

-- 3. 插入额外的项目数据
INSERT INTO projects (name, description, status, priority, progress_percentage, start_date, end_date, owner_id, organization_id) VALUES 
('云原生应用平台', '基于Kubernetes的云原生应用部署和管理平台', 'active', 'high', 40, '2024-03-01', '2024-09-30', 1, 4),
('智能合约开发框架', '区块链智能合约开发工具和框架', 'planning', 'medium', 15, '2024-04-01', '2024-10-31', 1, 5),
('物联网设备管理平台', '物联网设备连接、监控和管理平台', 'active', 'high', 55, '2024-02-15', '2024-07-31', 1, 6),
('微前端架构升级', '现有前端系统向微前端架构迁移', 'active', 'medium', 70, '2024-01-20', '2024-05-15', 1, 7),
('高并发API网关', '支持高并发访问的API网关系统', 'active', 'urgent', 85, '2024-01-10', '2024-04-30', 1, 8),
('数据可视化大屏', '企业级数据可视化展示大屏', 'active', 'medium', 60, '2024-02-01', '2024-06-30', 1, 9),
('移动端性能优化', '移动端应用性能监控和优化工具', 'planning', 'low', 10, '2024-05-01', '2024-11-30', 1, 10),
('AI代码助手', '基于AI的代码自动生成和优化工具', 'active', 'high', 35, '2024-03-15', '2024-08-31', 1, 11),
('智能客服系统V2', '新一代智能客服系统，支持多模态交互', 'planning', 'high', 5, '2024-06-01', '2024-12-31', 1, 1),
('数据分析平台优化', '现有数据分析平台的性能优化', 'active', 'medium', 45, '2024-03-10', '2024-08-15', 1, 2),
('机器学习模型部署', '机器学习模型的部署和监控系统', 'active', 'high', 65, '2024-02-20', '2024-07-20', 1, 3),
('自动化测试框架V2', '新一代自动化测试框架开发', 'planning', 'medium', 20, '2024-05-15', '2024-11-30', 1, 1)
ON CONFLICT (name) DO NOTHING;

-- 4. 为新增项目添加成员
INSERT INTO project_members (project_id, user_id, role) VALUES 
(7, 1, 'owner'), (7, 2, 'member'), (7, 4, 'member'),
(8, 1, 'owner'), (8, 3, 'member'), (8, 5, 'member'),
(9, 1, 'owner'), (9, 6, 'member'), (9, 7, 'member'),
(10, 1, 'owner'), (10, 2, 'member'), (10, 4, 'member'),
(11, 1, 'owner'), (11, 3, 'member'), (11, 5, 'member'),
(12, 1, 'owner'), (12, 6, 'member'), (12, 7, 'member'),
(13, 1, 'owner'), (13, 2, 'member'), (13, 4, 'member'),
(14, 1, 'owner'), (14, 3, 'member'), (14, 6, 'member'),
(15, 1, 'owner'), (15, 4, 'member'), (15, 5, 'member'),
(16, 1, 'owner'), (16, 2, 'member'), (16, 7, 'member'),
(17, 1, 'owner'), (17, 3, 'member'), (17, 6, 'member'),
(18, 1, 'owner'), (18, 4, 'member'), (18, 5, 'member')
ON CONFLICT (project_id, user_id) DO NOTHING;

-- 5. 插入额外的任务数据
INSERT INTO tasks (title, description, status, priority, due_date, estimated_hours, actual_hours, project_id, assignee_id, reporter_id) VALUES 
('Kubernetes集群部署', '部署生产环境的Kubernetes集群', 'todo', 'high', '2024-04-30', 40, NULL, 7, 2, 1),
('Docker镜像构建', '构建应用Docker镜像并推送到仓库', 'in_progress', 'medium', '2024-04-15', 25, 15, 7, 4, 1),
('智能合约安全审计', '对智能合约代码进行安全审计', 'todo', 'urgent', '2024-05-20', 35, NULL, 8, 3, 1),
('设备连接协议开发', '开发物联网设备连接通信协议', 'in_progress', 'high', '2024-05-31', 50, 30, 9, 6, 1),
('微前端路由设计', '设计微前端架构的路由方案', 'done', 'medium', '2024-03-15', 30, 28, 10, 2, 1),
('API限流算法实现', '实现API网关的限流算法', 'in_progress', 'high', '2024-04-20', 45, 25, 11, 3, 1),
('数据图表组件开发', '开发可复用的数据图表组件', 'todo', 'medium', '2024-05-10', 35, NULL, 12, 6, 1),
('性能监控SDK集成', '集成移动端性能监控SDK', 'planning', 'low', '2024-06-15', 20, NULL, 13, 7, 1),
('AI模型训练', '训练代码生成AI模型', 'in_progress', 'high', '2024-06-30', 60, 35, 14, 2, 1),
('代码质量检查', '实施代码质量检查和规范', 'todo', 'medium', '2024-04-25', 25, NULL, 15, 4, 1),
('需求分析文档', '编写智能客服系统V2的需求文档', 'in_progress', 'high', '2024-05-05', 20, 10, 16, 2, 1),
('技术架构设计', '设计数据分析平台的技术架构', 'done', 'medium', '2024-03-20', 30, 28, 17, 3, 1),
('模型部署脚本', '编写机器学习模型部署脚本', 'todo', 'high', '2024-05-25', 25, NULL, 18, 5, 1),
('测试用例设计', '设计自动化测试框架的测试用例', 'in_progress', 'medium', '2024-05-31', 30, 15, 18, 6, 1)
ON CONFLICT (title, project_id) DO NOTHING;

-- 6. 插入额外的文档数据
INSERT INTO documents (title, content, file_type, file_size, project_id, organization_id, uploaded_by, is_public) VALUES 
('云原生平台架构设计', '云原生应用平台的系统架构设计文档', 'pdf', 2560, 7, 4, 1, true),
('区块链技术白皮书', '区块链技术研究和应用白皮书', 'pdf', 3072, 8, 5, 1, true),
('物联网设备协议规范', '物联网设备通信协议技术规范', 'docx', 2048, 9, 6, 1, false),
('微前端架构指南', '微前端架构设计和实施指南', 'pdf', 1792, 10, 7, 1, true),
('API网关性能测试报告', 'API网关性能测试和分析报告', 'pdf', 1536, 11, 8, 1, true),
('数据可视化需求文档', '数据可视化大屏的需求分析文档', 'docx', 2304, 12, 9, 1, false),
('移动端性能优化方案', '移动端应用性能优化技术方案', 'pdf', 2048, 13, 10, 1, true),
('AI代码助手技术架构', 'AI代码助手的技术架构设计文档', 'pdf', 2560, 14, 11, 1, true)
ON CONFLICT (title, project_id) DO NOTHING;

-- 7. 插入额外的AI对话记录
INSERT INTO chat_history (user_id, project_id, organization_id, ai_level, message_type, user_message, ai_response) VALUES 
(1, 7, 4, 'advanced', 'question', '云原生平台的最佳实践有哪些？', '云原生最佳实践包括：1. 容器化应用 2. 微服务架构 3. 声明式API 4. 不可变基础设施 5. 服务网格 6. DevOps文化'),
(1, 8, 5, 'standard', 'analysis', '区块链项目的技术风险分析', '主要技术风险：1. 智能合约安全漏洞 2. 共识算法性能瓶颈 3. 跨链技术不成熟 4. 监管政策不确定性 5. 技术标准不统一'),
(1, 9, 6, 'expert', 'suggestion', '物联网设备数据安全如何保障？', '物联网数据安全保障：1. 端到端加密 2. 设备身份认证 3. 安全固件更新 4. 数据脱敏处理 5. 访问权限控制 6. 安全审计日志'),
(1, 10, 7, 'advanced', 'question', '微前端架构的优缺点是什么？', '优点：1. 技术栈独立 2. 团队自治 3. 渐进式升级 4. 更好的可维护性。缺点：1. 复杂度增加 2. 性能开销 3. 调试困难 4. 版本管理复杂'),
(1, 11, 8, 'standard', 'analysis', 'API网关的性能优化策略', '性能优化策略：1. 缓存响应结果 2. 连接池管理 3. 负载均衡 4. 限流熔断 5. 异步处理 6. 监控告警'),
(1, 12, 9, 'expert', 'suggestion', '数据可视化大屏的设计原则', '设计原则：1. 信息层次清晰 2. 色彩搭配合理 3. 交互简单直观 4. 响应式设计 5. 性能优化 6. 可访问性考虑'),
(1, 13, 10, 'advanced', 'question', '移动端性能优化的关键指标', '关键性能指标：1. 启动时间 2. 内存使用 3. CPU占用 4. 网络请求 5. 电池消耗 6. 帧率稳定性 7. 崩溃率'),
(1, 14, 11, 'standard', 'analysis', 'AI代码助手的技术实现方案', '技术实现方案：1. 代码理解模型 2. 代码生成算法 3. 上下文感知 4. 错误检测 5. 代码优化建议 6. 个性化学习')
ON CONFLICT (user_message, project_id) DO NOTHING;

-- 8. 显示数据插入结果
SELECT '✅ 额外数据插入完成' as status;
SELECT '新增组织数量:' as info, COUNT(*) as count FROM organizations WHERE id > 3;
SELECT '新增项目数量:' as info, COUNT(*) as count FROM projects WHERE id > 6;
SELECT '新增任务数量:' as info, COUNT(*) as count FROM tasks WHERE id > 13;
SELECT '新增文档数量:' as info, COUNT(*) as count FROM documents WHERE id > 6;
SELECT '新增AI对话记录:' as info, COUNT(*) as count FROM chat_history WHERE id > 8;

SELECT '🎉 额外数据生成完成！现在可以在前端页面查看所有数据了。' as final_status;