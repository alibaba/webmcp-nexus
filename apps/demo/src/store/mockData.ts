import type { Project, Tag, Task } from './types';

export const ASSIGNEES = ['刺秦', '文典', '苏婉', '周野', '叶舟'];

export const initialProjects: Project[] = [
  {
    id: 'p_inbox',
    name: '收件箱',
    color: '#94a3b8',
    description: '默认项目，临时任务先放这里',
  },
  {
    id: 'p_growth',
    name: '增长实验',
    color: '#2f6f5e',
    description: '本季度 AARRR 全链路实验',
  },
  {
    id: 'p_platform',
    name: '平台基建',
    color: '#c2410c',
    description: '内部工具与基础设施',
  },
  {
    id: 'p_brand',
    name: '品牌升级',
    color: '#7c3aed',
    description: '品牌识别与官网刷新',
  },
];

export const initialTags: Tag[] = [
  { id: 't_bug', name: 'bug', color: '#dc2626' },
  { id: 't_feature', name: 'feature', color: '#0ea5e9' },
  { id: 't_research', name: 'research', color: '#9333ea' },
  { id: 't_design', name: 'design', color: '#db2777' },
  { id: 't_urgent', name: 'urgent', color: '#f97316' },
  { id: 't_docs', name: 'docs', color: '#64748b' },
];

const daysFromNow = (n: number, hour = 18, minute = 0): string => {
  const d = new Date('2026-05-21T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  d.setUTCHours(hour, minute, 0, 0);
  // 'YYYY-MM-DDTHH:mm' — matches <input type="datetime-local"> value
  return d.toISOString().slice(0, 16);
};

const at = (offsetMinutes: number): string => {
  const d = new Date('2026-05-15T09:00:00Z');
  d.setUTCMinutes(d.getUTCMinutes() + offsetMinutes);
  return d.toISOString();
};

export const initialTasks: Task[] = [
  {
    id: 'task_1',
    title: '修复登录页 SSO 跳转死循环',
    description: '部分企业租户从 IDP 跳回后陷入 302 死循环，影响周一上班高峰登录',
    projectId: 'p_platform',
    tagIds: ['t_bug', 't_urgent'],
    priority: 'urgent',
    status: 'in_progress',
    dueDate: daysFromNow(1, 10, 30),
    assignee: '刺秦',
    createdAt: at(0),
  },
  {
    id: 'task_2',
    title: '完成新版定价页 A/B 实验',
    description: '把月付/年付切换默认值改为年付，跑两周看转化',
    projectId: 'p_growth',
    tagIds: ['t_feature', 't_research'],
    priority: 'high',
    status: 'in_progress',
    dueDate: daysFromNow(7, 17, 0),
    assignee: '文典',
    createdAt: at(120),
  },
  {
    id: 'task_3',
    title: '官网首页 hero 视觉重做',
    description: '配合品牌升级，将 hero 区从插画切换为产品截图 + 极简标题',
    projectId: 'p_brand',
    tagIds: ['t_design', 't_feature'],
    priority: 'medium',
    status: 'todo',
    dueDate: daysFromNow(14, 14, 0),
    assignee: '苏婉',
    createdAt: at(360),
  },
  {
    id: 'task_4',
    title: '撰写 WebMCP 入门指南',
    description: '面向新用户写一篇 5 分钟上手指南，含一段 GIF 演示',
    projectId: 'p_platform',
    tagIds: ['t_docs'],
    priority: 'medium',
    status: 'todo',
    dueDate: daysFromNow(10, 11, 0),
    assignee: '周野',
    createdAt: at(480),
  },
  {
    id: 'task_5',
    title: '调研竞品的引导流程',
    description: '挑 5 个同类产品截图 onboarding，整理共性与差异',
    projectId: 'p_growth',
    tagIds: ['t_research'],
    priority: 'low',
    status: 'todo',
    dueDate: daysFromNow(21, 16, 30),
    assignee: '叶舟',
    createdAt: at(540),
  },
  {
    id: 'task_6',
    title: '修复任务列表分页跳页错位',
    description: '点第 3 页后再点搜索，分页器仍停在 3，结果集已过滤但视觉错位',
    projectId: 'p_platform',
    tagIds: ['t_bug'],
    priority: 'high',
    status: 'todo',
    dueDate: daysFromNow(3, 9, 0),
    assignee: '刺秦',
    createdAt: at(600),
  },
  {
    id: 'task_7',
    title: '设计任务卡片 hover 微动效',
    description: '加一个 120ms 的轻微上浮 + 阴影变化，提升可点性',
    projectId: 'p_brand',
    tagIds: ['t_design'],
    priority: 'low',
    status: 'todo',
    dueDate: daysFromNow(9, 19, 0),
    assignee: '苏婉',
    createdAt: at(660),
  },
  {
    id: 'task_8',
    title: '梳理 Q3 增长 OKR',
    description: '把 OKR 拆到周维度，确认 owner 与对齐会议节奏',
    projectId: 'p_growth',
    tagIds: ['t_research', 't_docs'],
    priority: 'high',
    status: 'in_progress',
    dueDate: daysFromNow(5, 15, 0),
    assignee: '文典',
    createdAt: at(720),
  },
  {
    id: 'task_9',
    title: 'CI 缓存命中率优化',
    description: '把 pnpm store / turbo cache 落到云端，目标命中率 > 80%',
    projectId: 'p_platform',
    tagIds: ['t_feature'],
    priority: 'medium',
    status: 'todo',
    dueDate: daysFromNow(12, 12, 0),
    assignee: '周野',
    createdAt: at(780),
  },
  {
    id: 'task_10',
    title: '完成上周用户访谈纪要',
    description: '5 个访谈整理为关键洞察清单，分发到产品/设计周会',
    projectId: 'p_growth',
    tagIds: ['t_research', 't_docs'],
    priority: 'medium',
    status: 'done',
    dueDate: daysFromNow(-1, 18, 0),
    assignee: '叶舟',
    createdAt: at(840),
  },
  {
    id: 'task_11',
    title: '更新品牌字体到 Fraunces',
    description: '官网 + 文档站标题统一使用 Fraunces 衬线体',
    projectId: 'p_brand',
    tagIds: ['t_design'],
    priority: 'medium',
    status: 'done',
    dueDate: daysFromNow(-3, 17, 0),
    assignee: '苏婉',
    createdAt: at(900),
  },
  {
    id: 'task_12',
    title: '修复 OAuth 回调 state 校验',
    description: '修复回调路径漏校验 state 导致的 CSRF 风险',
    projectId: 'p_platform',
    tagIds: ['t_bug', 't_urgent'],
    priority: 'urgent',
    status: 'done',
    dueDate: daysFromNow(-2, 8, 30),
    assignee: '刺秦',
    createdAt: at(960),
  },
  {
    id: 'task_13',
    title: '清理过期 mock 数据脚本',
    description: '把 staging 上残留的演示数据下线，避免误导',
    projectId: 'p_inbox',
    tagIds: ['t_docs'],
    priority: 'low',
    status: 'archived',
    dueDate: null,
    assignee: '周野',
    createdAt: at(1020),
  },
  {
    id: 'task_14',
    title: '探索 webmcp 调试面板雏形',
    description: '让用户在页面侧边栏直观看到当前可用的 MCP 工具',
    projectId: 'p_platform',
    tagIds: ['t_feature', 't_research'],
    priority: 'high',
    status: 'in_progress',
    dueDate: daysFromNow(4, 16, 0),
    assignee: '文典',
    createdAt: at(1080),
  },
];
