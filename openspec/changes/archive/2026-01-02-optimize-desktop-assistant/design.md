# Design: 桌面助手优化技术方案

## Context
当前桌面助手已具备基本功能，但配置管理和用户体验需要进一步优化。现有架构基于 Electron + React + TypeScript，使用插件系统实现功能扩展。

## Goals / Non-Goals

### Goals
- 提供统一的配置管理界面
- 支持多种大模型配置和切换
- 优化 AI 聊天的 Markdown 渲染体验
- 实现配置数据的持久化存储
- 保持现有视觉设计风格

### Non-Goals
- 重构现有插件架构
- 修改核心搜索功能
- 添加新的插件类型
- 改变现有 IPC 通信机制

## Decisions

### 配置存储方案
- **Decision**: 使用 Electron 的 app.getPath('userData') 存储配置到 JSON 文件
- **Rationale**: 简单可靠，无需额外依赖，适合桌面应用配置存储
- **Alternatives considered**:
  - SQLite: 过于复杂，配置数据量小
  - LocalStorage: 不适合主进程配置存储

### 配置管理架构
- **Decision**: 主进程管理配置，渲染进程通过 IPC 读写
- **Rationale**: 符合 Electron 安全模型，避免渲染进程直接访问文件系统
- **Alternatives considered**:
  - 渲染进程直接存储: 违反安全最佳实践

### Markdown 渲染库
- **Decision**: 使用 react-markdown + rehype-highlight 实现 Markdown 渲染
- **Rationale**: 轻量级，支持代码高亮，与 React 生态兼容
- **Alternatives considered**:
  - marked: 需要额外 DOM 操作
  - showdown: 功能相对简单

## Risks / Trade-offs
- **配置同步风险**: 主进程和渲染进程配置可能不一致
- **迁移风险**: 需要处理旧配置格式兼容性
- **性能影响**: 配置界面可能增加应用启动时间

## Migration Plan
1. 实现配置系统，保持向后兼容
2. 逐步迁移现有硬编码配置
3. 提供配置重置功能

## Open Questions
- 是否需要配置导入导出功能？
- 如何处理配置冲突？