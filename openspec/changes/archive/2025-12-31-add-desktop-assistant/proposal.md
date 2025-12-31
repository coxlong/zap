# Change: 添加桌面助手功能

## Why
当前项目是一个基础的 Electron + React 模板，没有实际功能。用户需要一个类似 Spotlight 的桌面助手，通过快捷键唤出，输入内容后智能识别意图并执行相应操作，提升桌面操作效率。

## What Changes
- **ADDED**: 全局快捷键支持（Cmd/Ctrl+Shift+Space）
- **ADDED**: 搜索窗口 UI（半透明、无边框、居中）
- **ADDED**: 插件系统架构（配置化注册 + 硬编码排序）
- **ADDED**: 插件候选项并行生成机制
- **ADDED**: 硬编码排序函数（MVP 版本，后续替换为 LLM）
- **ADDED**: 时间戳转换插件（秒级/毫秒级）
- **ADDED**: AI 对话插件（弹出对话框）
- **ADDED**: URL 打开插件（浏览器打开网址）
- **ADDED**: shadcn/ui 组件库集成（New York 风格，使用 CLI 安装）
- **ADDED**: TailwindCSS v4.0 样式框架（CSS-first 配置）
- **ADDED**: 路径别名 @/* → src/*（TypeScript + Webpack）

## Impact
- **新增 specs**: `desktop-assistant`
- **核心文件**: `src/main/main.ts`, `src/renderer/App.tsx`, `src/renderer/App.css`
- **新增目录**: `src/plugins/`, `src/sorter/`, `src/renderer/components/ui/`, `src/lib/`, `src/hooks/`
- **依赖**:
  - TailwindCSS v4.0: `tailwindcss @tailwindcss/postcss postcss postcss-loader`
  - shadcn/ui: `class-variance-authority clsx tailwind-merge lucide-react tw-animate-css`
  - 组件: `cmdk @radix-ui/react-dialog`（通过 CLI 自动安装）
- **配置文件**: `postcss.config.mjs`, `components.json`, `tsconfig.json`（修改）
- **非破坏性变更**: 新增功能，不影响现有代码

## Note
MVP 版本使用硬编码排序规则，后续迭代将集成 Ollama 或远程 LLM API。
