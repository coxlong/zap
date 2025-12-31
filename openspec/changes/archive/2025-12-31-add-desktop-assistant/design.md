## Context
构建一个 Spotlight 风格的桌面助手，需要支持：
1. 全局快捷键快速唤起
2. 插件系统处理多种输入类型
3. 硬编码排序规则（MVP 版本）
4. 简洁现代的 UI 交互

## Goals / Non-Goals

**Goals**
- 启动后常驻后台，快捷键唤起 < 300ms
- 插件候选项并行生成，总时间 < 5ms
- 硬编码排序时间 < 1ms
- 插件配置化注册（95%配置，5%代码）
- UI 毛玻璃效果，现代美观
- 总代码量 < 1000 行（MVP 阶段）
- 零外部 API 依赖（纯本地）

**Non-Goals**
- LLM 排序（MVP 后用 Ollama 或远程 API）
- 插件热加载（MVP 不做）
- 用户习惯学习（MVP 不做）
- 插件链（MVP 不做）
- 云端同步（MVP 不做）
- 主题切换（MVP 不做）
- 多语言支持（MVP 只做中文）

## Decisions

### 1. 技术栈选择
- **Electron**: 跨平台桌面应用框架，已集成
- **React 19**: UI 框架，已集成
- **TypeScript**: 类型安全，已集成
- **TailwindCSS v4.0**: 原子化 CSS，CSS-first 配置（新增）
- **shadcn/ui v2025+**: 可拷贝组件库，Radix UI 打底，New York 风格（新增，使用 CLI 安装）
- **Lucide React**: 图标库（shadcn/ui New York 风格依赖）
- **无 LLM 依赖**: MVP 使用硬编码排序，后续添加 Ollama

**理由**:
- 现有 Electron-React-Boilerplate 模板已集成 Electron+React+TS
- TailwindCSS v4.0 采用 CSS-first 配置，无需 JS 配置文件，更简洁
- shadcn/ui 提供类型安全、可定制的组件，使用 CLI 安装更方便
- MVP 避免 LLM 依赖，简化部署，降低复杂度

### 2. 插件架构（简化版 - MVP）

**插件接口（极简）**:
```typescript
// @/plugins/types.ts
export interface Plugin {
  id: string;                    // 插件唯一标识
  name: string;                  // 插件名称（展示用）
  icon?: string;                 // 图标（emoji）

  // 核心：输入 → 返回一个候选项或 null（插件内部自己判断）
  generate(input: string): Candidate | null;
}

export interface Candidate {
  pluginId: string;             // 来源插件ID
  title: string;                // 标题
  description: string;          // 描述（动态生成）
  action: Action;               // 执行动作
}

export type Action =
  | { type: 'copy'; payload: string }
  | { type: 'open-url'; payload: string }
  | { type: 'open-chat'; payload?: string };
```

**核心引擎（@/plugins/engine.ts）**:
```typescript
import { timestampPlugin } from './timestamp';
import { urlPlugin } from './url';
import { aiPlugin } from './ai-chat';

// 静态导入所有插件（避免 require 性能问题）
const allPlugins = [timestampPlugin, urlPlugin, aiPlugin];

// 处理输入：并行调用所有插件，然后排序
export function processInput(input: string): Candidate[] {
  // 1. 每个插件自己决定返回什么（null 或一个 Candidate）
  const results = allPlugins
    .map(plugin => {
      try {
        return plugin.generate(input);
      } catch (e) {
        console.error(`插件 ${plugin.id} 出错:`, e);
        return null;
      }
    })
    .filter((c): c is Candidate => c !== null);

  // 2. 硬编码排序（后续可扩展为 LLM）
  return sortCandidates(input, results);
}
```

**排序函数（@/sorter/index.ts）**:
```typescript
// 简单排序：按插件优先级（固定顺序）
const pluginOrder = { 'timestamp': 3, 'url': 2, 'ai-chat': 1 };

export function sortCandidates(input: string, candidates: Candidate[]): Candidate[] {
  return candidates
    .map(c => ({ candidate: c, score: pluginOrder[c.pluginId] || 0 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)  // 最多8个
    .map(s => s.candidate);
}
```

**理由**:
- 插件完全自主：自己判断输入，自己返回候选项（或 null）
- 无 patterns：MVP 不做外部匹配规则（后续可添加）
- 无模板引擎：插件内部自己生成 title/description
- 同步调用：MVP 只做简单逻辑（< 1ms）
- 静态 import：避免 require 性能问题，打包工具可优化

### 3. 硬编码排序策略（极简版）

**排序规则（固定插件优先级）**:
```typescript
// @/sorter/index.ts
// 固定插件顺序：timestamp > url > ai-chat
const pluginOrder = {
  'timestamp': 3,  // 最高优先级
  'url': 2,        // 中等优先级
  'ai-chat': 1     // 最低优先级
};

export function sortCandidates(input: string, candidates: Candidate[]): Candidate[] {
  // 按插件优先级排序，分数高的在前
  return candidates
    .sort((a, b) => {
      const scoreA = pluginOrder[a.pluginId] || 0;
      const scoreB = pluginOrder[b.pluginId] || 0;
      return scoreB - scoreA;  // 降序
    })
    .slice(0, 8);  // 最多显示8个
}
```

**优点**:
- 极简：10行代码
- 确定性：相同输入永远相同输出
- 零延迟：< 0.1ms
- 可理解：顺序固定，一目了然
- 易扩展：后续只需修改 pluginOrder 对象

**缺点**:
- 不够智能：无法动态调整
- 无用户个性化

**后续改进**: V2 集成 LLM 排序，V3 支持用户自定义插件优先级。

### 4. UI 设计（详细）
- **主窗口**:
  - 尺寸: 720 x 420px（宽 x 高）
  - 位置: 屏幕中央
  - 样式: 圆角 16px，毛玻璃背景（bg-white/80 backdrop-blur-md）
  - 边框: 1px 灰色，阴影 xl
  - 动画: 淡入 150ms，scale-95 → scale-100

- **搜索框**（使用 shadcn CommandInput）:
  - 高度: 56px
  - 字体: text-lg（18px）
  - 占位符: "输入时间戳、网址或任何问题..."
  - 聚焦: ring-0，无边框
  - 左侧图标: 🔍

- **结果列表**（使用 shadcn CommandList）:
  - 最大高度: 320px（8项 × 40px）
  - 每项: 40px 高度，flex 布局
  - 图标: 左侧 24px 宽度
  - 标题: font-medium，text-sm
  - 描述: text-xs text-muted-foreground
  - 快捷键: 右侧小字 Enter/⌘+数字

- **空状态**:
  - 图标: 🕵️
  - 文案: "没有找到匹配的操作"
  - 建议: "试试输入时间戳、网址或提问"

- **加载状态**:
  - 骨架屏: 3 个灰色条
  - 时长: < 100ms（通常看不到）

### 5. 性能优化
- **窗口预创建**: 启动时创建，hide/show 而非销毁
- **模型预热**: Ollama 保持常驻，首次调用后不停
- **结果缓存**: 相同输入缓存 1 分钟
- **剪贴板监控**: 可选，检测时间戳格式自动提示

## Risks / Trade-offs

### Risk: Ollama 首次加载慢
**Mitigation**:
- 应用启动时异步加载 Ollama
- 显示 "正在初始化..." 提示
- 提供离线降级（纯正则匹配）

### Risk: LLM 排序不稳定
**Mitigation**:
- temperature=0.1 保证确定性
- 添加置信度阈值（<0.6 的候选项过滤）
- 用户反馈机制（标记不准确排序）

### Risk: 快捷键冲突
**Mitigation**:
- 默认快捷键 ⌘⇧Space（macOS 和 Windows 都可用）
- 失败时尝试备选：⌥Space（Option+Space）
- 提供配置界面（MVP 不做，但是设计时预留）

### Trade-off: 配置化 vs 灵活性
配置化限制复杂插件，但 MVP 足够。后续可添加 `hooks: { beforeMatch, afterExecute }` 扩展。

## Migration Plan

### 实施步骤（顺序）
1. 配置项目（Tailwind, shadcn, Ollama）
2. 实现插件架构（管理器 + 3个插件配置）
3. 实现 LLM 排序服务（Prompt + 解析）
4. 实现 UI（主窗口 + 聊天对话框）
5. 集成到主进程（快捷键、窗口管理）
6. 测试和优化

### 回滚方案
- 所有变更在 `src/` 新增文件，不修改现有模板逻辑
- 出现问题时，只需注释掉 `main.ts` 中唤起窗口的代码
- 删除 `src/plugins/`, `src/llm/`, `src/components/` 目录即可回滚

## Open Questions（MVP 已决定）

1. **排序策略演进**:
   - V1: 硬编码规则（当前 MVP）
   - V2: 集成 Ollama（llama3.2:3b）
   - V3: 支持用户自定义排序权重
   - 是否需要设计排序策略接口？（是的，已实现 calculateScore 函数）

2. **插件动态性**:
   - MVP: 纯配置 + 简单变量替换
   - 后续: 支持 async 动态数据获取
   - 是否预留 hooks 接口？（已在 design 中说明，暂不实现）

3. **UI 主题**:
   - 已决定: 深色主题（shadcn 默认）
   - 后续: 添加浅色主题 + 系统跟随
   - 使用 CSS 变量还是 Tailwind dark: modifier？（后者）

4. **错误处理**:
   - 插件匹配出错（try-catch，返回空数组）
   - 动作执行失败（通知用户，记录日志）
   - 窗口创建失败（降级提示 + 重试）

5. **可扩展性规划**:
   - 插件数量增长后如何管理？（分组、搜索）
   - 插件间依赖？（MVP 不考虑）
   - 插件配置热更新？（MVP 不考虑）
