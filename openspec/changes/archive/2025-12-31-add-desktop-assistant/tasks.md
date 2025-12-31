## 1. 项目配置与依赖
- [x] 1.1 配置 TailwindCSS v4.0（@tailwindcss/postcss, postcss, postcss-loader）
  - 安装依赖：`tailwindcss @tailwindcss/postcss postcss postcss-loader`
  - 创建 `postcss.config.mjs`
  - 修改 Webpack 配置（dev 和 prod）添加 postcss-loader
  - 在 App.css 中添加 `@import "tailwindcss"`
- [x] 1.2 配置路径别名 @/* → src/*（tsconfig.json, webpack）
  - 更新 tsconfig.json 添加 baseUrl 和 paths
  - Webpack 已使用 TsconfigPathsPlugins 自动读取
- [x] 1.3 初始化 shadcn/ui（手动配置 + CLI 添加组件）
  - 手动创建 components.json（New York 风格，中性色，CSS variables）
  - 安装核心依赖：`class-variance-authority clsx tailwind-merge lucide-react tw-animate-css`
  - 在 App.css 添加 CSS variables 主题配置
  - 创建 utils.ts（cn 函数）
- [x] 1.4 使用 shadcn CLI 安装组件：command, input, dialog
  - 运行命令：`npx shadcn@latest add input command dialog --yes`
- [x] 1.5 移除 Ollama SDK（MVP 不需要）
  - 检查并确认项目中无 Ollama 相关依赖

## 2. 核心架构实现
- [x] 2.1 定义插件接口（@/plugins/types.ts）
  - [x] 2.1.1 Plugin 接口（id, name, icon, generate 方法）
  - [x] 2.1.2 Candidate 接口（pluginId, title, description, action）
  - [x] 2.1.3 Action 接口（type, payload）
- [x] 2.2 实现核心引擎（@/plugins/engine.ts）
  - [x] 2.2.1 静态导入所有插件
  - [x] 2.2.2 实现 processInput 函数（调用所有插件 generate 方法）
  - [x] 2.2.3 错误处理（try-catch，返回空数组）
- [x] 2.3 实现硬编码排序（@/sorter/index.ts）
  - [x] 2.3.1 定义 pluginOrder 常量
  - [x] 2.3.2 实现 sortCandidates 函数（固定顺序排序）
- [x] 2.4 实现主进程/渲染进程通信（IPC channels）

## 3. 插件实现
- [x] 3.1 开发时间戳插件（@/plugins/timestamp.ts）
  - [x] 3.1.1 实现 generate 方法（判断时间戳格式）
  - [x] 3.1.2 转换时间戳为本地时间
  - [x] 3.1.3 返回 Candidate（type='copy'）

- [x] 3.2 开发 URL 插件（@/plugins/url.ts）
  - [x] 3.2.1 检测完整 URL（带协议）
  - [x] 3.2.2 检测域名（补全 https://）
  - [x] 3.2.3 非 URL 时生成 Google 搜索链接
  - [x] 3.2.4 返回 Candidate（type='open-url'）

- [x] 3.3 开发 AI 对话插件（@/plugins/ai-chat.ts）
  - [x] 3.3.1 实现 generate 方法（判断输入长度）
  - [x] 3.3.2 生成预览文本（截断过长输入）
  - [x] 3.3.3 返回 Candidate（type='open-chat'）

- [x] 3.4 创建插件索引（@/plugins/index.ts）
  - [x] 3.4.1 导入三个插件
  - [x] 3.4.2 导出 allPlugins 数组

## 4. UI 实现
- [x] 4.1 实现主搜索窗口（Command 组件）
- [x] 4.2 实现 AI 聊天对话框（Dialog 组件）
- [x] 4.3 实现结果列表（CommandList, CommandItem）
- [x] 4.4 实现快捷键绑定（Cmd/Ctrl+Shift+Space）
- [x] 4.5 实现窗口管理（show/hide/focus/center）
- [x] 4.6 实现结果选择交互（上下箭头、Enter、鼠标点击）

## 5. 系统集成与测试
- [x] 5.1 集成所有模块（main.ts 入口）
- [ ] 5.2 测试快捷键唤起功能
- [ ] 5.3 测试时间戳转换精度
- [ ] 5.4 测试 URL 打开功能
- [ ] 5.5 测试 AI 对话窗口打开
- [ ] 5.6 优化性能和启动速度
