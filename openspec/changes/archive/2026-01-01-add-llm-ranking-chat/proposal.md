# Change: Add LLM-based ranking and chat functionality

## 为什么
当前桌面助手使用确定性评分函数对候选结果进行排序，缺乏大语言模型提供的智能化和上下文理解能力。集成 qwen2.5:1.5b 模型将能够更智能地对插件候选结果进行排序，并通过适当的对话功能增强 AI 聊天功能。

## 变更内容
- **添加** 基于大模型的候选结果排序系统，替代确定性评分
- **添加** 使用 ai 库集成 qwen2.5:1.5b 模型
- **添加** 增强的 AI 聊天界面，包含对话历史
- **修改** 候选结果生成以包含大模型评分
- **添加** 模型加载和推理能力
- **添加** 模型推理失败的错误处理

## 实际实现情况
- ✅ LLM 排序服务已实现：`src/services/llmRankingService.ts`
- ✅ AI 聊天插件已实现：`src/plugins/ai-chat.ts`
- ✅ 使用 IPC 代理模式连接本地模型服务
- ✅ 实现了降级机制，LLM 失败时回退到优先级排序
- ❌ 对话历史功能尚未实现（当前只支持单次对话）
- ❌ 模型加载状态管理尚未实现

## 影响
- 受影响规范：desktop-assistant
- 受影响代码：src/plugins/ai-chat.ts, src/plugins/types.ts, src/renderer/components/DesktopAssistant.tsx, src/services/llmRankingService.ts
- 新依赖：ai 库（用于 qwen2.5:1.5b 模型集成）、zod（用于数据验证）
- 性能：模型推理可能为候选结果排序增加 100-500ms 延迟