# Change: 优化桌面助手功能

## Why
当前桌面助手功能需要增强用户体验和配置灵活性。现有实现存在以下问题：
- AI 聊天插件的 Markdown 渲染支持不足
- 缺乏统一的配置管理系统
- 大模型排序功能配置不够灵活
- 插件无法独立配置
- 配置数据未持久化存储

## What Changes
- **对话插件优化**：增强 AI 聊天插件的 Markdown 渲染能力
- **配置系统**：添加统一的配置管理，支持大模型和插件配置
- **排序算法优化**：改进候选结果排序逻辑，支持配置化排序模型和提示词
- **插件配置界面**：为每个插件提供独立的配置选项卡
- **持久化存储**：实现配置数据的本地持久化

## Impact
- **Affected specs**: desktop-assistant, plugin-system, configuration-management
- **Affected code**:
  - `src/plugins/ai-chat.ts` - Markdown 渲染支持
  - `src/services/llmRankingService.ts` - 配置化排序
  - `src/renderer/ChatWindow.tsx` - 配置界面集成
  - `src/main/main.ts` - 配置持久化
  - `src/renderer/components/ui/` - 新增配置组件