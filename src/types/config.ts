export interface LLMProvider {
  id: string;
  name: string;
  baseURL: string;
  apiKey?: string;
  models: string[];
}

export interface PluginConfig {
  enabled: boolean;
  [key: string]: unknown;
}

export interface PluginsConfig {
  [pluginId: string]: PluginConfig;
}

export interface AIChatPluginConfig extends PluginConfig {
  availableModels: string[];
}

export interface RankingConfig {
  modelName: string;
  systemPrompt: string;
  temperature: number;
  timeout: number;
}

export interface AppConfig {
  providers: LLMProvider[];
  plugins: PluginsConfig;
  ranking: RankingConfig;
  version: string;
}

export const DEFAULT_CONFIG: AppConfig = {
  providers: [
    {
      id: 'ollama',
      name: 'Ollama',
      baseURL: 'http://localhost:11434/v1',
      apiKey: '',
      models: ['qwen2.5:1.5b'],
    },
  ],
  plugins: {
    'ai-chat': {
      enabled: true,
      availableModels: ['qwen2.5:1.5b'],
    },
    timestamp: {
      enabled: true,
    },
    url: {
      enabled: true,
    },
  },
  ranking: {
    modelName: 'qwen2.5:1.5b',
    systemPrompt:
      '你是一个智能排序助手，负责根据用户查询对功能选项进行相关性排序。请仔细分析每个候选功能的功能描述，返回最符合用户需求的排序结果。',
    temperature: 0.1,
    timeout: 5000,
  },
  version: '1.0.0',
};
