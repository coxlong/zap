import { Plugin, Candidate } from './types';
import { AIChatConfig } from './components/AIChatConfig';

export const aiPlugin: Plugin = {
  id: 'ai-chat',
  name: 'AI 对话',
  icon: '🤖',

  async generate(input: string): Promise<Candidate[]> {
    const trimmed = input.trim();
    const results: Candidate[] = [];

    const isAskCommand = trimmed.startsWith('/ask');
    const initialMessage = isAskCommand ? trimmed.substring(4).trim() : trimmed;

    let availableModels: string[] = [];
    try {
      const config = await window.desktop.getPluginConfig('ai-chat');
      if (config && config.availableModels) {
        availableModels = config.availableModels as string[];
      }
    } catch {
      // 如果获取配置失败，使用默认模型
    }

    const modelsToUse = isAskCommand ? availableModels : [availableModels[0]];

    modelsToUse.forEach((model) => {
      const preview =
        initialMessage.length > 30
          ? `${initialMessage.substring(0, 30)}...`
          : initialMessage;

      results.push({
        pluginId: 'ai-chat',
        title: `AI 对话：${preview}`,
        description: '点击或 Enter 打开 AI 聊天窗口',
        icon: '🤖',
        priority: 70,
        detailedDescription: `AI对话功能，用于回答用户关于"${initialMessage}"的问题`,
        rankingField: `AI对话 ${preview}`,
        action: {
          type: 'open-window',
          payload: {
            data: {
              initialMessage: isAskCommand ? initialMessage : '',
              model,
            },
            config: {
              component: 'ChatWindow',
              title: `AI 对话：${preview}`,
              width: 800,
              height: 600,
            },
          },
        },
      });
    });

    return results;
  },

  getConfigComponent() {
    return AIChatConfig;
  },

  getDefaultConfig() {
    return {
      availableModels: ['qwen2.5:1.5b'],
    };
  },
};
