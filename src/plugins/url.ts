import { Plugin, Candidate } from './types';

export const urlPlugin: Plugin = {
  id: 'url',
  name: 'URL 处理',
  icon: '🔗',

  generate(input: string): Candidate | null {
    const trimmed = input.trim();

    if (/^https?:\/\/.+/i.test(trimmed)) {
      return {
        pluginId: 'url',
        title: `打开链接：${trimmed}`,
        description: '在浏览器中打开链接',
        icon: '🔗',
        priority: 80,
        detailedDescription: `打开网页链接：${trimmed}`,
        rankingField: `URL链接 ${trimmed}`,
        action: {
          type: 'open-url',
          payload: trimmed,
        },
      };
    }

    const domainPattern = /^(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/i;
    if (domainPattern.test(trimmed)) {
      const url = `https://${trimmed}`;
      return {
        pluginId: 'url',
        title: `访问网站：${trimmed}`,
        description: '在浏览器中打开',
        icon: '🔗',
        priority: 80,
        detailedDescription: `访问网站域名：${trimmed}`,
        rankingField: `网站域名 ${trimmed}`,
        action: {
          type: 'open-url',
          payload: url,
        },
      };
    }

    if (trimmed.length > 2) {
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`;
      return {
        pluginId: 'url',
        title: `搜索：${trimmed}`,
        description: '在 Google 中搜索',
        icon: '🔗',
        priority: 60,
        detailedDescription: `在Google搜索：${trimmed}`,
        rankingField: `搜索 ${trimmed}`,
        action: {
          type: 'open-url',
          payload: searchUrl,
        },
      };
    }

    return null;
  },
};
