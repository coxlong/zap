import { Plugin, Candidate } from './types';

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
          action: {
            type: 'open-chat',
            payload: trimmed,
          },
        };
      }
    }

    return null;
  },
};
