import '@testing-library/jest-dom';
import { beforeEach } from 'vitest';
import { configureBuiltinTools } from '../builtinTools';

// 默认关掉 SDK 内置的全局代调工具 webmcpCallTool。
//
// 既有套件大量断言的是「宿主 registerTool 的精确调用次数」「activeTools 的精确名单」
// 「mock.calls[0][0] 就是刚注册的那个工具」—— 这些都是**用户工具**的契约，与内置工具正交。
// 内置工具默认开启会让它们整体偏移一位（实测 45 条断言变红），而逐条改断言等于把索引位移
// 焊进测试里，日后每加一个内置工具都要再改一遍。
//
// 内置工具与两个注册入口的交互（默认开启、自动注册、幂等、关闭开关）由
// builtinTools.test.ts 专门覆盖，它会在自己的 beforeEach 里显式打开。
//
// 开关是模块级状态、初值为生产默认（开），所以每个文件的第一个用例需要这里关一次；
// 之后的用例由 teardownHost() 维持为关（它在测试中途被调用时同样保持关）。
beforeEach(() => {
  configureBuiltinTools({ callTool: false });
});
