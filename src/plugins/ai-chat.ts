import { Plugin, Candidate } from './types';
import { AIChatConfig } from './components/AIChatConfig';
import { AIChatCandidate } from './components/AIChatCandidate';

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

    modelsToUse.forEach((model, index) => {
      const isDefault = index === 0;

      results.push({
        pluginId: 'ai-chat',
        index: results.length,
        icon: '🤖',
        priority: 70,
        detailedDescription: `AI对话功能，使用模型 ${model}`,
        rankingField: `AI对话 ${model}`,
        action: {
          type: 'open-window',
          payload: {
            pluginId: 'ai-chat',
            data: {
              initialMessage,
              model,
            },
            config: {
              component: 'ChatWindow',
              title: `AI 对话：${model}`,
              width: 800,
              height: 600,
            },
          },
        },
        content: {
          type: 'component',
          component: AIChatCandidate,
          props: {
            model,
            isDefault,
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
