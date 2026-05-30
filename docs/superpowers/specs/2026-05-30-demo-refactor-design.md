# Demo 重构设计：Canvas 画板 + 简化待办

## 概述

重构 `apps/demo`，将其从一个复杂的 TODO 管理应用简化为两个聚焦的 demo 场景：

1. **Canvas 画板**（默认首页）— 人用优先的绘制工具，同时通过 WebMCP 暴露绘制能力给 AI Agent
2. **待办列表** — 精简版任务管理

核心理念：**现有 Web 应用低成本接入 WebMCP**。demo 首先是给人用的好产品，然后同步暴露 WebMCP 工具给 AI。

## 整体布局

### 导航结构

- 顶部栏：品牌 Logo `◐ Nexus Demo` + Tab 切换 + 调试面板快捷键提示
- Tab 顺序：**画板**（默认激活）| **待办**
- 去掉侧边栏、概览页、项目页、标签页
- DebugPanel 保留，右侧滑出，快捷键 `⌘ + \`

### 路由

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | CanvasPage | 画板（默认首页） |
| `/todos` | TodosPage | 待办列表 |

## Canvas 画板

### 数据模型

画布维护一个**图形对象列表**（`shapes: Shape[]`），每次操作（用户手绘或 Agent 调用）都是往列表添加对象，统一重绘。

```typescript
type ShapeType = 'freehand' | 'line' | 'rect' | 'circle' | 'text';

interface Shape {
  id: string;
  type: ShapeType;
  color: string;      // 描边/文字颜色
  lineWidth: number;  // 线宽
  // 各类型特有属性
  points?: { x: number; y: number }[];  // freehand
  x1?: number; y1?: number; x2?: number; y2?: number;  // line
  x?: number; y?: number; width?: number; height?: number;  // rect
  cx?: number; cy?: number; radius?: number;  // circle
  text?: string; fontSize?: number;  // text
  fill?: string | null;  // 填充色（rect/circle 可选）
}
```

### 用户交互

- **浮动工具栏**：居中悬浮于画布顶部，不占画布面积
- **绘制工具**：画笔 | 直线 | 矩形 | 圆形 | 文字
- **操作按钮**：撤销 | 清空
- **颜色选择**：点击色块弹出预设色板（8-12 色）
- **画布**：白色背景、圆角边框、占满剩余空间
- **工具栏图标**：统一使用 SVG 图标，大小一致、风格统一

### 绘制行为

| 工具 | 操作方式 |
|------|----------|
| 画笔 | mousedown 开始记录点，mousemove 追加点并实时渲染，mouseup 完成 |
| 直线 | mousedown 记录起点，拖拽时实时预览，mouseup 记录终点 |
| 矩形 | mousedown 记录起始角，拖拽时实时预览，mouseup 记录结束角 |
| 圆形 | mousedown 记录圆心，拖拽时实时预览半径，mouseup 完成 |
| 文字 | 点击画布某处，弹出输入框，回车确认 |

### 撤销 / 清空

- 撤销：从 shapes 列表 pop 最后一项，重绘
- 清空：清空 shapes 列表，重绘

### WebMCP 工具

通过 `useWebMcpTools` 注册，与用户操作走完全相同的数据路径。

| 工具名 | 参数 | 返回 | 说明 |
|--------|------|------|------|
| `drawFreehand` | `points: {x,y}[], color?, lineWidth?` | `{ id }` | 画自由线条 |
| `drawLine` | `x1, y1, x2, y2, color?, lineWidth?` | `{ id }` | 画直线 |
| `drawRect` | `x, y, width, height, color?, fill?, lineWidth?` | `{ id }` | 画矩形 |
| `drawCircle` | `cx, cy, radius, color?, fill?, lineWidth?` | `{ id }` | 画圆形 |
| `drawText` | `x, y, text, color?, fontSize?` | `{ id }` | 绘制文字 |
| `undo` | — | `{ success, removedId? }` | 撤销最后一个图形 |
| `clearCanvas` | — | `{ success, clearedCount }` | 清空画布 |
| `getCanvasState` | — | `{ shapes: Shape[] }` | 获取当前所有图形（只读） |

所有绘制工具的坐标基于画布左上角为原点 (0,0)，单位为像素。

### 状态管理

使用 React Context（类似现有 TodoStore 模式）：

- `CanvasStoreProvider` 包裹画板页面
- 内部 `useState` 管理 `shapes` 列表
- 暴露 `addShape` / `removeLastShape` / `clearShapes` / `getShapes` 方法
- 通过 `__publishStoreRef` 模式让全局工具也能访问

## 待办列表

### 数据模型简化

```typescript
type Priority = 'low' | 'medium' | 'high' | 'urgent';
type TodoStatus = 'todo' | 'in_progress' | 'done';

interface Todo {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: TodoStatus;
  dueDate: string | null;  // YYYY-MM-DDTHH:mm
  createdAt: string;
}
```

**删除的字段**：`projectId`、`tagIds`、`assignee`
**删除的状态**：`archived`

### 用户交互

- 任务列表：行式卡片（圆形 checkbox + 标题 + 截止日期含时分 + 优先级标签）
- 已完成项：灰色 + 删除线
- 搜索框：关键词匹配标题和描述
- 新建/编辑弹窗：标题、描述、优先级、状态、截止日期（含时分选择器）
- 点击 checkbox 快速切换完成状态

### WebMCP 工具

保留现有任务操作工具，移除项目/标签相关：

| 保留 | 删除 |
|------|------|
| `createTask` | `moveTaskToProject` |
| `updateTask` | `addTaskTag` / `removeTaskTag` |
| `deleteTask` | `listProjects` / `getProject` |
| `deleteTasks` | `listTags` / `getTag` |
| `setTaskStatus` | `listAssignees` |
| `bulkSetTaskStatus` | `createProject` / `updateProject` / `deleteProject` |
| `setTaskPriority` | `createTag` / `updateTag` / `deleteTag` |
| `setTaskDueDate` | |
| `listTasks` / `getTask` / `searchTasks` | |

`searchTasks` 参数简化：去掉 `projectId`、`tagIds`、`assignee` 过滤项。

## 文件变更清单

### 删除

- `src/pages/DashboardPage.tsx`
- `src/pages/ProjectsPage.tsx`
- `src/pages/ProjectDetailPage.tsx`
- `src/pages/TagsPage.tsx`
- `src/components/FilterPanel.tsx`
- `src/components/Badge.tsx`（如果只在标签页使用）

### 新建

- `src/pages/CanvasPage.tsx` — 画板页面主组件
- `src/store/CanvasStore.tsx` — 画板状态管理（Context + shapes 列表）
- `src/components/canvas/Toolbar.tsx` — 浮动工具栏
- `src/components/canvas/Canvas.tsx` — 画布渲染组件
- `src/components/canvas/ColorPicker.tsx` — 颜色选择器
- `src/tools/canvas.ts` — 画板全局 WebMCP 工具（getCanvasState）

### 修改

- `src/App.tsx` — 路由改为 `/` (Canvas) + `/todos`，去掉侧边栏改为顶部 Tab
- `src/store/TodoStore.tsx` — 简化，移除 Project/Tag 相关
- `src/store/types.ts` — 简化类型定义
- `src/store/mockData.ts` — 简化模拟数据
- `src/pages/TasksPage.tsx` — 重命名为 TodosPage，简化过滤/排序
- `src/components/TaskCard.tsx` — 简化为行式卡片
- `src/components/TaskFormDialog.tsx` — 简化表单字段，截止日期加时分
- `src/components/SearchBar.tsx` — 保留
- `src/tools/queries.ts` — 移除 Project/Tag 查询，简化 searchTasks
- `src/tools/navigation.ts` — 路由路径更新
- `src/main.tsx` — 注册新的 canvas 全局工具
- `src/index.css` — 更新布局样式（顶部 Tab 替代侧边栏）

## 技术决策

1. **Canvas 渲染**：使用原生 Canvas 2D API，每次 shapes 变更后全量重绘（图形数量少，性能不是问题）
2. **状态管理**：沿用现有 React Context 模式，不引入额外状态库
3. **WebMCP 注册**：画板页面级工具通过 `useWebMcpTools` 注册（drawLine 等），全局只读工具（getCanvasState）通过 `registerGlobalTools`
4. **样式**：继续使用纯 CSS（index.css），不引入 CSS-in-JS
5. **工具栏图标**：统一 SVG，风格一致，尺寸统一
