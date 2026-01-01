## ADDED Requirements
### Requirement: LLM-based Candidate Ranking
桌面助手 SHALL 使用 qwen2.5:1.5b 大语言模型对插件候选结果进行智能排序。

#### Scenario: 智能排序查询结果
- **GIVEN** 用户输入查询 "如何设置代理"
- **WHEN** 插件生成多个候选结果
- **THEN** 大模型根据查询相关性对候选结果进行排序
- **AND** 最相关的候选结果出现在列表顶部

#### Scenario: 处理模型推理延迟
- **GIVEN** 大模型推理需要 100-500ms
- **WHEN** 用户输入查询后 300ms 内模型未返回结果
- **THEN** 系统使用确定性排序作为回退方案
- **AND** 用户界面显示加载状态

#### Scenario: 模型加载失败处理
- **GIVEN** qwen2.5:1.5b 模型加载失败
- **WHEN** 用户进行查询
- **THEN** 系统自动回退到确定性排序算法
- **AND** 用户界面显示警告信息

### Requirement: AI Chat Conversation History
AI 聊天插件 SHALL 支持多轮对话历史记录。

#### Scenario: 保存对话上下文
- **GIVEN** 用户在 AI 聊天窗口进行多轮对话
- **WHEN** 用户发送新消息
- **THEN** 系统保存完整的对话历史
- **AND** 大模型能够基于历史上下文进行回复

#### Scenario: 清除对话历史
- **GIVEN** 对话历史已存在
- **WHEN** 用户点击清除按钮
- **THEN** 所有对话历史被清空
- **AND** 开始新的对话会话

## MODIFIED Requirements
### Requirement: AI Chat Plugin
AI 聊天插件 SHALL 使用 qwen2.5:1.5b 模型进行智能对话。

#### Scenario: 智能对话响应
- **GIVEN** 用户输入自然语言问题
- **WHEN** AI 聊天插件处理请求
- **THEN** 使用 qwen2.5:1.5b 模型生成响应
- **AND** 响应内容相关且连贯

#### Scenario: 流式响应显示
- **GIVEN** 用户发送消息
- **WHEN** 大模型生成响应
- **THEN** 响应内容以流式方式逐步显示
- **AND** 用户可以看到实时生成过程

### Requirement: Deterministic Candidate Ranking
桌面助手 SHALL 使用大模型排序作为主要方案，确定性排序作为回退方案。

#### Scenario: 回退到确定性排序
- **GIVEN** 大模型不可用或超时
- **WHEN** 候选结果需要排序
- **THEN** 系统使用确定性排序算法
- **AND** 用户界面显示回退状态