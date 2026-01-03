import React from 'react';
import { SettingsPanel } from '@/renderer/SettingsPanel';
import { AppConfig } from '@/types/config';

export function SettingsWindow({
  initialConfig,
}: {
  initialConfig?: AppConfig;
}) {
  const [config, setConfig] = React.useState<AppConfig | null>(
    initialConfig || null,
  );

  React.useEffect(() => {
    // 加载配置
    const loadConfig = async () => {
      try {
        const configData = await window.desktop.getConfig();
        setConfig(configData);
      } catch {
        // Failed to load config
      }
    };

    if (!initialConfig) {
      loadConfig();
    }
  }, [initialConfig]);

  const handleConfigUpdate = async (updates: Partial<AppConfig>) => {
    if (!config) return;

    const newConfig = { ...config, ...updates };
    setConfig(newConfig);

    try {
      await window.desktop.updateConfig(updates);
    } catch {
      // Failed to update config
    }
  };

  const handlePluginConfigUpdate = async (
    pluginId: string,
    pluginConfig: Record<string, unknown>,
  ) => {
    if (!config) return;

    const newConfig = {
      ...config,
      plugins: {
        ...config.plugins,
        [pluginId]: {
          ...config.plugins[pluginId],
          ...pluginConfig,
        },
      },
    };
    setConfig(newConfig);

    try {
      await window.desktop.updatePluginConfig(pluginId, pluginConfig);
    } catch {
      // Failed to update plugin config
    }
  };

  if (!config) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">加载配置中...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background overflow-hidden">
      <SettingsPanel
        config={config}
        onConfigUpdate={handleConfigUpdate}
        onPluginConfigUpdate={handlePluginConfigUpdate}
      />
    </div>
  );
}
