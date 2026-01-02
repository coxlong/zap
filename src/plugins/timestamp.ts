import { Plugin, Candidate } from './types';

export const timestampPlugin: Plugin = {
  id: 'timestamp',
  name: '时间戳转换',
  icon: '🕐',

  generate(input: string): Candidate | null {
    if (/^\d{10}$/.test(input.trim())) {
      const timestamp = parseInt(input.trim(), 10) * 1000;
      const date = new Date(timestamp);
      const formatted = date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      return {
        pluginId: 'timestamp',
        title: `时间戳：${formatted}`,
        description: '按下 Enter 复制到剪贴板',
        icon: '🕐',
        priority: 100,
        detailedDescription: `将10位时间戳"${input.trim()}"转换为本地时间：${formatted}`,
        rankingField: `时间戳转换 ${formatted}`,
        action: {
          type: 'copy',
          payload: formatted,
        },
      };
    }

    if (/^\d{13}$/.test(input.trim())) {
      const timestamp = parseInt(input.trim(), 10);
      const date = new Date(timestamp);
      const formatted = date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      return {
        pluginId: 'timestamp',
        title: `时间戳：${formatted}`,
        description: '按下 Enter 复制到剪贴板',
        icon: '🕐',
        priority: 100,
        detailedDescription: `将13位时间戳"${input.trim()}"转换为本地时间：${formatted}`,
        rankingField: `时间戳转换 ${formatted}`,
        action: {
          type: 'copy',
          payload: formatted,
        },
      };
    }

    return null;
  },
};
