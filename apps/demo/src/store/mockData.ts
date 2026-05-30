import type { Todo } from './types';

const daysFromNow = (n: number, hour = 18, minute = 0): string => {
  const d = new Date('2026-05-21T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  d.setUTCHours(hour, minute, 0, 0);
  return d.toISOString().slice(0, 16);
};

const at = (offsetMinutes: number): string => {
  const d = new Date('2026-05-15T09:00:00Z');
  d.setUTCMinutes(d.getUTCMinutes() + offsetMinutes);
  return d.toISOString();
};

export const initialTodos: Todo[] = [
  {
    id: 'todo_1',
    title: '修复登录页 SSO 跳转死循环',
    description: '部分企业租户从 IDP 跳回后陷入 302 死循环',
    priority: 'urgent',
    status: 'in_progress',
    dueDate: daysFromNow(1, 10, 30),
    createdAt: at(0),
  },
  {
    id: 'todo_2',
    title: '完成新版定价页 A/B 实验',
    description: '把月付/年付切换默认值改为年付，跑两周看转化',
    priority: 'high',
    status: 'in_progress',
    dueDate: daysFromNow(7, 17, 0),
    createdAt: at(120),
  },
  {
    id: 'todo_3',
    title: '官网首页 hero 视觉重做',
    description: '配合品牌升级，将 hero 区从插画切换为产品截图',
    priority: 'medium',
    status: 'todo',
    dueDate: daysFromNow(14, 14, 0),
    createdAt: at(360),
  },
  {
    id: 'todo_4',
    title: '撰写 WebMCP 入门指南',
    description: '面向新用户写一篇 5 分钟上手指南，含一段 GIF 演示',
    priority: 'medium',
    status: 'todo',
    dueDate: daysFromNow(10, 11, 0),
    createdAt: at(480),
  },
  {
    id: 'todo_5',
    title: '调研竞品的引导流程',
    description: '挑 5 个同类产品截图 onboarding，整理共性与差异',
    priority: 'low',
    status: 'todo',
    dueDate: daysFromNow(21, 16, 30),
    createdAt: at(540),
  },
  {
    id: 'todo_6',
    title: '修复任务列表分页跳页错位',
    description: '点第 3 页后再点搜索，分页器仍停在 3',
    priority: 'high',
    status: 'todo',
    dueDate: daysFromNow(3, 9, 0),
    createdAt: at(600),
  },
  {
    id: 'todo_7',
    title: '梳理 Q3 增长 OKR',
    description: '把 OKR 拆到周维度，确认 owner 与对齐会议节奏',
    priority: 'high',
    status: 'in_progress',
    dueDate: daysFromNow(5, 15, 0),
    createdAt: at(720),
  },
  {
    id: 'todo_8',
    title: '完成上周用户访谈纪要',
    description: '5 个访谈整理为关键洞察清单，分发到产品/设计周会',
    priority: 'medium',
    status: 'done',
    dueDate: daysFromNow(-1, 18, 0),
    createdAt: at(840),
  },
  {
    id: 'todo_9',
    title: '修复 OAuth 回调 state 校验',
    description: '修复回调路径漏校验 state 导致的 CSRF 风险',
    priority: 'urgent',
    status: 'done',
    dueDate: daysFromNow(-2, 8, 30),
    createdAt: at(960),
  },
];
