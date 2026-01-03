import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/renderer/components/ui/tabs';
import { allPlugins } from '@/plugins/engine';
import { Plugin } from '@/plugins/types';

interface PluginSettingsProps {
  config: Record<string, unknown>;
  onSave: (pluginId: string, data: Record<string, unknown>) => void;
}

export function PluginSettings({ config, onSave }: PluginSettingsProps) {
  const pluginsWithConfig = allPlugins.filter(
    (plugin: Plugin) => plugin.getConfigComponent && plugin.getDefaultConfig,
  );

  if (pluginsWithConfig.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl">
        暂无可配置的插件
      </div>
    );
  }

  return (
    <Tabs defaultValue={pluginsWithConfig[0].id} className="w-full">
      <TabsList className="mb-6 w-full justify-start rounded-none border-b bg-transparent p-0">
        {pluginsWithConfig.map((plugin: Plugin) => (
          <TabsTrigger
            key={plugin.id}
            value={plugin.id}
            className="relative rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
          >
            {plugin.name}
          </TabsTrigger>
        ))}
      </TabsList>

      {pluginsWithConfig.map((plugin: Plugin) => {
        const pluginConfig =
          (config[plugin.id] as Record<string, unknown>) || {};
        const ConfigComponent = plugin.getConfigComponent!();

        return (
          <TabsContent key={plugin.id} value={plugin.id} className="mt-0">
            <ConfigComponent
              config={pluginConfig}
              onSave={(data) => onSave(plugin.id, data)}
            />
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
