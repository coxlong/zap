# desktop-assistant Specification

## Purpose
TBD - created by archiving change add-desktop-assistant. Update Purpose after archive.
## Requirements
### Requirement: Global Hotkey Activation
The desktop assistant SHALL provide a global hotkey to show/hide the search window.

#### Scenario: Show search window with hotkey
- **GIVEN** the application is running
- **WHEN** the user presses Cmd/Ctrl+Shift+Space
- **THEN** the search window becomes visible and focused
- **AND** the window is centered on the active screen

#### Scenario: Hide search window with same hotkey
- **GIVEN** the search window is visible
- **WHEN** the user presses Cmd/Ctrl+Shift+Space again
- **THEN** the search window is hidden

#### Scenario: Hide with Escape key
- **GIVEN** the search window is visible
- **WHEN** the user presses the Escape key
- **THEN** the search window is hidden

### Requirement: Search Input Interface
The desktop assistant SHALL provide an input field for users to type queries.

#### Scenario: Auto-focus on window show
- **GIVEN** the search window is shown
- **WHEN** the window is fully rendered
- **THEN** the input field is automatically focused
- **AND** any existing text is selected

#### Scenario: Real-time query processing
- **GIVEN** the user types in the input field
- **WHEN** the user stops typing for 300ms
- **THEN** the system triggers plugin candidate generation

### Requirement: Plugin Candidate Generation
The desktop assistant SHALL generate candidate actions from registered plugins based on user input.

#### Scenario: Parallel plugin processing
- **GIVEN** multiple plugins are registered
- **WHEN** the user types a query
- **THEN** all plugins generate candidates in parallel within 5ms
- **AND** each plugin returns one candidate or null

#### Scenario: Timestamp plugin generates candidate
- **GIVEN** the user enters "1704067200"
- **WHEN** plugin processing completes
- **THEN** the timestamp plugin returns a candidate with local time conversion
- **AND** the description contains the converted time string

#### Scenario: URL plugin handles complete URL
- **GIVEN** the user enters "https://github.com"
- **WHEN** plugin processing completes
- **THEN** the URL plugin returns a candidate for opening the URL
- **AND** the action type is 'open-url'

#### Scenario: URL plugin handles search query
- **GIVEN** the user enters "electron react boilerplate"
- **WHEN** plugin processing completes
- **THEN** the URL plugin returns a candidate for Google search
- **AND** the action payload is a Google search URL

#### Scenario: AI plugin provides candidate
- **GIVEN** the user enters any text (3+ characters)
- **WHEN** plugin processing completes
- **THEN** the AI chat plugin returns a candidate for AI conversation
- **AND** the title previews the user's input

### Requirement: Deterministic Candidate Ranking
桌面助手 SHALL 使用大模型排序作为主要方案，确定性排序作为回退方案。

#### Scenario: 回退到确定性排序
- **GIVEN** 大模型不可用或超时
- **WHEN** 候选结果需要排序
- **THEN** 系统使用确定性排序算法
- **AND** 用户界面显示回退状态

### Requirement: Results Display with Navigation
The desktop assistant SHALL display ranked candidates and support keyboard navigation.

#### Scenario: Display top 5-8 results
- **GIVEN** LLM ranking has completed
- **WHEN** results are displayed
- **THEN** the top 5-8 candidates are shown in a vertical list
- **AND** each item shows icon, title, and description

#### Scenario: Navigate with arrow keys
- **GIVEN** results are displayed with an item selected
- **WHEN** the user presses the Down arrow key
- **THEN** the selection moves to the next item
- **WHEN** the user presses the Up arrow key
- **THEN** the selection moves to the previous item

#### Scenario: Select with Enter key
- **GIVEN** a result item is selected
- **WHEN** the user presses Enter
- **THEN** the associated action is executed
- **AND** the search window is hidden

#### Scenario: Select with mouse click
- **GIVEN** results are displayed
- **WHEN** the user clicks on a result item
- **THEN** the associated action is executed
- **AND** the search window is hidden

### Requirement: Timestamp Conversion Plugin
The desktop assistant SHALL provide a timestamp conversion plugin.

#### Scenario: Match and convert 10-digit timestamp (seconds)
- **GIVEN** the user enters a 10-digit number
- **WHEN** the plugin generate method is called
- **THEN** the plugin returns a candidate with local time conversion
- **AND** the description shows the converted time

#### Scenario: Match and convert 13-digit timestamp (milliseconds)
- **GIVEN** the user enters a 13-digit number
- **WHEN** the plugin generate method is called
- **THEN** the plugin returns a candidate with local time conversion
- **AND** the description shows the converted time

#### Scenario: Copy converted time
- **GIVEN** a timestamp candidate is selected
- **WHEN** the action executes
- **THEN** the converted time string is copied to clipboard

### Requirement: URL Handling Plugin
The desktop assistant SHALL provide a URL handling plugin.

#### Scenario: Match and open complete URL
- **GIVEN** the user enters "https://github.com"
- **WHEN** the URL plugin generate method is called
- **THEN** the plugin returns a candidate for opening the URL in browser
- **AND** the action payload is "https://github.com"

#### Scenario: Match and open domain without protocol
- **GIVEN** the user enters "github.com"
- **WHEN** the URL plugin generate method is called
- **THEN** the plugin returns a candidate for opening the URL in browser
- **AND** the action payload is "https://github.com"

#### Scenario: Search query when not a URL
- **GIVEN** the user enters "electron react boilerplate"
- **WHEN** the URL plugin generate method is called
- **THEN** the plugin returns a candidate for Google search
- **AND** the action payload is "https://www.google.com/search?q=electron+react+boilerplate"

#### Scenario: Open action executes
- **GIVEN** a URL candidate is selected
- **WHEN** the action executes
- **THEN** the URL is opened in the default browser

#### Scenario: Search action executes
- **GIVEN** a Google search candidate is selected
- **WHEN** the action executes
- **THEN** the search results page is opened in the default browser

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

### Requirement: Plugin Registration System
The desktop assistant SHALL provide a static plugin registry.

#### Scenario: Static plugin imports
- **GIVEN** the application is launching
- **WHEN** the plugin module is loaded
- **THEN** all three plugins (timestamp, URL, AI) are statically imported
- **AND** the allPlugins array contains the plugin instances

#### Scenario: Plugin process input independently
- **GIVEN** plugins are registered
- **WHEN** the user types a query
- **THEN** each plugin's generate method is called with the full input
- **AND** each plugin independently decides whether to return a candidate or null

### Requirement: UI Component Library Integration
The desktop assistant SHALL use the shadcn/ui component library.

#### Scenario: Install command component
- **GIVEN** shadcn/ui is initialized
- **WHEN** the command component is added
- **THEN** the component files are created in src/components/ui/

#### Scenario: Use command component for search
- **GIVEN** the search UI is implemented
- **WHEN** the user interacts with the interface
- **THEN** Command, CommandInput, CommandList, and CommandItem components are used
- **AND** keyboard navigation works out of the box

### Requirement: Styling Framework Integration
The desktop assistant SHALL use TailwindCSS for styling.

#### Scenario: Configure TailwindCSS
- **GIVEN** the project setup is complete
- **WHEN** TailwindCSS is configured
- **THEN** postcss and autoprefixer are added to webpack config
- **AND** tailwind.config.js defines the design tokens

#### Scenario: Apply glassmorphism effect
- **GIVEN** the search window is styled
- **WHEN** Tailwind classes are applied
- **THEN** the window has a semi-transparent background with blur effect
- **AND** the window has proper rounded corners and shadow

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

