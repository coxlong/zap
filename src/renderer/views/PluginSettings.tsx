import { useState } from 'react';
// @ts-expect-error: Module import compatibility issue
import { withTheme, IChangeEvent } from '@rjsf/core';
// @ts-expect-error: Module import compatibility issue
import { Theme as ShadcnTheme } from '@rjsf/shadcn';
// @ts-expect-error: Module import compatibility issue
import validator from '@rjsf/validator-ajv8';
import { JSONSchema7 } from 'json-schema';
import { Button } from '@/renderer/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/renderer/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/renderer/components/ui/tabs';
import { allPlugins } from '@/plugins/engine';
import { Plugin } from '@/plugins/types';

const Form = withTheme(ShadcnTheme);

interface PluginConfigTabProps {
  pluginId: string;
  schema: JSONSchema7;
  formData: Record<string, unknown>;
  onSave: (pluginId: string, data: Record<string, unknown>) => void;
}

function PluginConfigTab({
  pluginId,
  schema,
  formData,
  onSave,
}: PluginConfigTabProps) {
  const [localData, setLocalData] = useState(formData);

  const handleSubmit = (event: IChangeEvent) => {
    onSave(pluginId, event.formData);
  };

  // 获取插件的 uiSchema
  const plugin = allPlugins.find((p: Plugin) => p.id === pluginId);
  const uiSchema = plugin?.getUiSchema ? plugin.getUiSchema() : {};

  return (
    <Card>
      <CardHeader>
        <CardTitle>{schema.title || '插件配置'}</CardTitle>
        <CardDescription>{schema.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form
          schema={schema}
          uiSchema={uiSchema}
          formData={localData}
          onChange={(e: IChangeEvent) => setLocalData(e.formData)}
          onSubmit={handleSubmit}
          validator={validator}
        >
          <div className="mt-4 flex justify-end">
            <Button type="submit">保存配置</Button>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}

interface PluginSettingsProps {
  config: Record<string, unknown>;
  onSave: (pluginId: string, data: Record<string, unknown>) => void;
}

export function PluginSettings({ config, onSave }: PluginSettingsProps) {
  const pluginsWithConfig = allPlugins.filter(
    (plugin: Plugin) => plugin.getConfigSchema && plugin.getDefaultConfig,
  );

  if (pluginsWithConfig.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">暂无可配置的插件</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Tabs defaultValue={pluginsWithConfig[0].id} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        {pluginsWithConfig.map((plugin: Plugin) => (
          <TabsTrigger key={plugin.id} value={plugin.id}>
            {plugin.name}
          </TabsTrigger>
        ))}
      </TabsList>

      {pluginsWithConfig.map((plugin: Plugin) => {
        const pluginConfig =
          (config[plugin.id] as Record<string, unknown>) || {};
        const schema = plugin.getConfigSchema!();

        return (
          <TabsContent key={plugin.id} value={plugin.id}>
            <PluginConfigTab
              pluginId={plugin.id}
              schema={schema}
              formData={pluginConfig}
              onSave={onSave}
            />
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
