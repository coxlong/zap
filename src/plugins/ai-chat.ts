import { Plugin, Candidate } from './types';
import { AIChatConfig } from './components/AIChatConfig';

export const aiPlugin: Plugin = {
  id: 'ai-chat',
  name: 'AI 对话',
  icon: '🤖',

  generate(input: string): Candidate | null {
    const trimmed = input.trim();

    if (
      /^\d+$/.test(trimmed) &&
      (trimmed.length === 10 || trimmed.length === 13)
    ) {
      return null;
    }

    if (/^https?:\/\/.+/i.test(trimmed)) {
      return null;
    }

    if (/^(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/i.test(trimmed)) {
      return null;
    }

    if (trimmed.length > 2 && trimmed.length <= 200) {
      const hasValidContent = /[\u4e00-\u9fa5a-zA-Z]/.test(trimmed);

      if (hasValidContent) {
        const preview =
          trimmed.length > 30 ? `${trimmed.substring(0, 30)}...` : trimmed;

        return {
          pluginId: 'ai-chat',
          title: `AI 对话：${preview}`,
          description: '点击或 Enter 打开 AI 聊天窗口',
          icon: '🤖',
          priority: 70,
          detailedDescription: `AI对话功能，用于回答用户关于"${trimmed}"的问题`,
          rankingField: `AI对话 ${preview}`,
          action: {
            type: 'open-window',
            payload: {
              data: { initialMessage: trimmed },
              config: {
                component: 'ChatWindow',
                title: `AI 对话：${preview}`,
                width: 800,
                height: 600,
              },
            },
          },
        };
      }
    }

    return null;
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
