# 代码规范

## 核心原则
- 代码应简洁、优雅、易读，优先考虑可维护性
- 最小改动原则：修改现有代码时只改必要部分，保持风格一致
- 先让代码正确运行，再考虑优化
- **已提交到 git 的代码或注释，除非用户明确说明，否则不允许修改**

## 设计原则
- 高内聚、低耦合：相关功能聚合在一起，减少组件/模块/函数间依赖
- 单一职责：一个类/函数/组件只做一件事
- DRY：不重复代码
- KISS：保持简单，避免过度设计
- 组合优于继承

## 自动化
- 代码生成后运行 `npm run lint:fix` 自动格式化
- 使用 TypeScript 严格模式，类型必须明确

## 命名
- 组件: PascalCase (UserProfile.tsx)
- 函数/变量: camelCase (handleSubmit)
- 常量: UPPER_SNAKE_CASE (MAX_RETRY)
- 类型/接口: PascalCase，接口加 I 前缀 (IUser)
- 名称要有意义且自解释

## 函数设计
- 单一职责，只做一件事
- 参数不超过 3-4 个，多则用对象封装
- 使用早返回减少嵌套
- 长度不超过 30 行

## 代码结构
- 嵌套深度不超过 3 层
- 提取重复代码为函数
- 用空行分隔逻辑块
- 删除注释掉的代码和无用代码

## 注释
- 只注释"为什么"，不注释"是什么"
- 代码应自解释
- 复杂逻辑、算法、业务规则必须说明

## React 规范
- 优先函数组件 + Hooks
- 组件不超过 200 行，职责单一
- Props 定义类型接口
- 使用 memo/useMemo/useCallback 优化性能
- 避免 props drilling，合理使用 Context

## Electron 规范
- 主进程/渲染进程职责分离
- IPC 通信，避免渲染进程直接访问 Node API
- 敏感操作在主进程执行

## 项目约定
- UI 组件优先使用 shadcn/ui，需要时用 `npx shadcn@latest add [component]` 添加
- 样式使用 Tailwind CSS
- 图标使用 lucide-react

## 错误处理
- 主动处理错误
- 提供有意义的错误信息
- 异步操作必须 try-catch

<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

<env>
locale: zh-cn
</env>
