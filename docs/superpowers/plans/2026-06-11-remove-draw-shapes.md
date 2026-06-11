# 移除 drawShapes 批量绘制工具

## Context

上一次迭代为画板新增了 `drawShapes` 批量绘制工具，意在让 Agent 一次调用画多个图形。
用户复盘后认为：希望 Agent **一步一步**地调用单图元工具（`drawLine` / `drawRect` 等），
以保留每一步的可观测性、可撤销性，以及 Agent 推理过程的透明度。
因此需要把上次添加的批量工具及其辅助类型完整撤回，**保留** `getCanvasSnapshot`。

## 改动文件

仅一处：[CanvasPage.tsx](file:///Users/chaobin/opensource/webmcp-nexus/apps/demo/src/pages/CanvasPage.tsx)

## 改动内容

1. **删除 `BatchShapeSpec` interface**（约 41 行，文件顶部）
2. **删除 `drawShapes` 的 `useCallback` 定义**（约 50 行，紧邻 `getCanvasSnapshot` 之后）
3. **从 `useWebMcpTools({...})` 注册对象中移除 `drawShapes` 这一行**
4. **回退 import**：把 `import type { Shape, ShapeType } from '../store/types'` 改回 `import type { ShapeType } from '../store/types'`（`Shape` 仅被 drawShapes 用到，删除后 `Shape` 不再需要）

`getCanvasSnapshot` 工具及其注册保持不变。

## 验证

1. **类型检查**：
   ```bash
   cd apps/demo && pnpm exec tsc -p tsconfig.app.json --noEmit
   ```
   应无新增报错（特别是验证 `Shape` 没有未使用 import 警告）。

2. **构建产物 schema 检查**（可选）：
   ```bash
   cd apps/demo && pnpm build
   grep -o "drawShapes" dist/assets/*.js || echo "drawShapes 已彻底移除"
   grep -o "getCanvasSnapshot" dist/assets/*.js   # 应仍存在
   ```

3. **运行时验证**：`pnpm dev` 打开画板页，Agent 工具列表里不应再出现 `drawShapes`，但 `getCanvasSnapshot` 仍可调用。

## 后续记忆维护

执行完成后需更新一条记忆：
- `WebMCP新增工具能力`（关键词含 `drawShapes`）→ 改为只描述 `getCanvasSnapshot`，去除 `drawShapes` 相关内容。
