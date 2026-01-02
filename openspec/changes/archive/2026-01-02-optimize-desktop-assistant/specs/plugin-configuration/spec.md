## ADDED Requirements
### Requirement: 配置管理系统
系统 SHALL 提供统一的配置管理界面，支持大模型和插件配置的持久化存储。

#### Scenario: 配置界面访问
- **GIVEN** 用户打开桌面助手
- **WHEN** 用户进入设置界面
- **THEN** 显示配置管理选项卡
- **AND** 包含大模型配置和插件配置区域

#### Scenario: 配置持久化
- **GIVEN** 用户修改了配置选项
- **WHEN** 用户关闭应用后重新启动
- **THEN** 配置数据被正确恢复
- **AND** 应用使用保存的配置运行

### Requirement: 大模型配置管理
系统 SHALL 支持配置多种大模型服务，包括本地 Ollama 和远程 API。

#### Scenario: 配置 Ollama 路径
- **GIVEN** 用户在大模型配置界面
- **WHEN** 用户输入 Ollama 可执行文件路径
- **THEN** 系统验证路径有效性
- **AND** 保存配置供排序服务使用

#### Scenario: 配置远程 API
- **GIVEN** 用户选择远程大模型服务
- **WHEN** 用户输入 API baseURL 和 apiKey
- **THEN** 系统验证 API 连接性
- **AND** 主进程转发请求时自动添加认证信息

### Requirement: 插件独立配置
每个插件 SHALL 拥有独立的配置选项卡，支持插件特定的配置选项。

#### Scenario: AI 聊天插件配置
- **GIVEN** 用户在插件配置界面
- **WHEN** 用户选择 AI 聊天插件选项卡
- **THEN** 显示默认模型设置
- **AND** 显示可选模型列表配置

#### Scenario: 插件配置保存
- **GIVEN** 用户修改了插件配置
- **WHEN** 用户保存配置
- **THEN** 插件配置被独立存储
- **AND** 插件使用新配置运行

## MODIFIED Requirements
### Requirement: LLM-based Candidate Ranking
桌面助手 SHALL 使用可配置的大语言模型对插件候选结果进行智能排序，支持自定义排序模型和系统提示词。

#### Scenario: 配置化智能排序
- **GIVEN** 用户配置了排序模型和提示词
- **WHEN** 用户输入查询"如何设置代理"
- **THEN** 系统使用配置的模型进行排序
- **AND** 排序结果基于配置的提示词生成

#### Scenario: 排序字段优化
- **GIVEN** 插件生成候选结果
- **WHEN** 排序服务处理候选结果
- **THEN** 每个候选项的特定字段被拼接到提示词
- **AND** 而不是整个候选项被放入提示词

#### Scenario: 回退到确定性排序
- **GIVEN** 配置的大模型不可用或超时
- **WHEN** 候选结果需要排序
- **THEN** 系统使用确定性排序算法
- **AND** 用户界面显示回退状态

### Requirement: AI Chat Conversation History
AI 聊天插件 SHALL 支持 Markdown 渲染和多轮对话历史记录。

#### Scenario: Markdown 消息渲染
- **GIVEN** AI 模型返回包含 Markdown 的响应
- **WHEN** 消息在聊天窗口显示
- **THEN** Markdown 内容被正确渲染
- **AND** 支持代码块高亮和格式化

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