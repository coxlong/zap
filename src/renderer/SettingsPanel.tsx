import { useState } from 'react';
import { AppConfig } from '@/types/config';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/renderer/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/renderer/components/ui/card';
import { Button } from '@/renderer/components/ui/button';
import { Input } from '@/renderer/components/ui/input';
import { Label } from '@/renderer/components/ui/label';
import { Textarea } from '@/renderer/components/ui/textarea';
import { PluginSettings } from '@/renderer/views/PluginSettings';

interface SettingsPanelProps {
  config: AppConfig;
  onConfigUpdate: (updates: Partial<AppConfig>) => void;
  onPluginConfigUpdate: (
    pluginId: string,
    config: Record<string, unknown>,
  ) => void;
}

export function SettingsPanel({
  config,
  onConfigUpdate,
  onPluginConfigUpdate,
}: SettingsPanelProps) {
  const [localConfig, setLocalConfig] = useState(config);
  const [activeProviderIndex, setActiveProviderIndex] = useState(0);

  const handleAddProvider = () => {
    setLocalConfig((prev) => ({
      ...prev,
      providers: [
        ...prev.providers,
        {
          id: `provider-${Date.now()}`,
          name: '新提供者',
          baseURL: '',
          apiKey: '',
          models: [],
        },
      ],
    }));
    setActiveProviderIndex(localConfig.providers.length);
  };

  const handleRemoveProvider = (index: number) => {
    setLocalConfig((prev) => ({
      ...prev,
      providers: prev.providers.filter((_, i) => i !== index),
    }));
    if (activeProviderIndex >= index) {
      setActiveProviderIndex(Math.max(0, activeProviderIndex - 1));
    }
  };

  const handleProviderConfigChange = (key: string, value: any) => {
    setLocalConfig((prev) => {
      const newProviders = [...prev.providers];
      newProviders[activeProviderIndex] = {
        ...newProviders[activeProviderIndex],
        [key]: value,
      };
      return {
        ...prev,
        providers: newProviders,
      };
    });
  };

  const handleRankingConfigChange = (
    key: keyof AppConfig['ranking'],
    value: any,
  ) => {
    setLocalConfig((prev) => ({
      ...prev,
      ranking: {
        ...prev.ranking,
        [key]: value,
      },
    }));
  };

  const handleSaveAll = () => {
    onConfigUpdate(localConfig);
  };

  const handleReset = () => {
    setLocalConfig(config);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">设置</h1>
        <div className="space-x-2">
          <Button variant="outline" onClick={handleReset}>
            重置
          </Button>
          <Button onClick={handleSaveAll}>保存所有设置</Button>
        </div>
      </div>

      <Tabs defaultValue="llm" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="llm">大模型配置</TabsTrigger>
          <TabsTrigger value="plugins">插件配置</TabsTrigger>
          <TabsTrigger value="ranking">排序配置</TabsTrigger>
        </TabsList>

        {/* 大模型配置 */}
        <TabsContent value="llm">
          <Card>
            <CardHeader>
              <CardTitle>LLM 提供者配置</CardTitle>
              <CardDescription>管理多个 LLM 服务提供者</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 提供者列表 */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">提供者列表</h3>
                  <Button onClick={() => handleAddProvider()} size="sm">
                    添加提供者
                  </Button>
                </div>

                {localConfig.providers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>暂无配置的提供者</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {localConfig.providers.map((provider, index) => (
                      <div
                        key={provider.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          activeProviderIndex === index
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setActiveProviderIndex(index)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            setActiveProviderIndex(index);
                          }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-label={`选择提供者 ${provider.name}`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{provider.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {provider.baseURL}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveProvider(index);
                              }}
                            >
                              删除
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 当前提供者配置 */}
              {localConfig.providers.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">
                    配置 {localConfig.providers[activeProviderIndex].name}
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="provider-name">名称</Label>
                      <Input
                        id="provider-name"
                        value={localConfig.providers[activeProviderIndex].name}
                        onChange={(e) =>
                          handleProviderConfigChange('name', e.target.value)
                        }
                        placeholder="提供者名称"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="provider-id">ID</Label>
                      <Input
                        id="provider-id"
                        value={localConfig.providers[activeProviderIndex].id}
                        onChange={(e) =>
                          handleProviderConfigChange('id', e.target.value)
                        }
                        placeholder="唯一标识"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="provider-baseURL">Base URL</Label>
                    <Input
                      id="provider-baseURL"
                      value={localConfig.providers[activeProviderIndex].baseURL}
                      onChange={(e) =>
                        handleProviderConfigChange('baseURL', e.target.value)
                      }
                      placeholder="http://localhost:11434"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="provider-apiKey">API 密钥</Label>
                    <Input
                      id="provider-apiKey"
                      type="password"
                      value={
                        localConfig.providers[activeProviderIndex].apiKey || ''
                      }
                      onChange={(e) =>
                        handleProviderConfigChange('apiKey', e.target.value)
                      }
                      placeholder="API 密钥（可选）"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="provider-models">支持的模型</Label>
                    <Textarea
                      id="provider-models"
                      value={localConfig.providers[
                        activeProviderIndex
                      ].models.join(', ')}
                      onChange={(e) =>
                        handleProviderConfigChange(
                          'models',
                          e.target.value
                            .split(',')
                            .map((m) => m.trim())
                            .filter((m) => m),
                        )
                      }
                      placeholder="qwen2.5:1.5b, gpt-3.5-turbo, gpt-4"
                      rows={3}
                    />
                    <p className="text-sm text-muted-foreground">
                      用逗号分隔多个模型名称
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 插件配置 */}
        <TabsContent value="plugins">
          <PluginSettings
            config={localConfig.plugins}
            onSave={onPluginConfigUpdate}
          />
        </TabsContent>

        {/* 排序配置 */}
        <TabsContent value="ranking">
          <Card>
            <CardHeader>
              <CardTitle>排序算法配置</CardTitle>
              <CardDescription>配置候选结果的排序算法参数</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rankingModel">排序模型</Label>
                <Input
                  id="rankingModel"
                  value={localConfig.ranking.modelName}
                  onChange={(e) =>
                    handleRankingConfigChange('modelName', e.target.value)
                  }
                  placeholder="qwen2.5:1.5b"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="systemPrompt">系统提示词</Label>
                <textarea
                  id="systemPrompt"
                  value={localConfig.ranking.systemPrompt}
                  onChange={(e) =>
                    handleRankingConfigChange('systemPrompt', e.target.value)
                  }
                  className="w-full min-h-[100px] p-2 border rounded-md"
                  placeholder="输入排序算法的系统提示词"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="temperature">温度参数</Label>
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    min="0"
                    max="2"
                    value={localConfig.ranking.temperature}
                    onChange={(e) =>
                      handleRankingConfigChange(
                        'temperature',
                        parseFloat(e.target.value),
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeout">超时时间 (ms)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    min="1000"
                    max="30000"
                    value={localConfig.ranking.timeout}
                    onChange={(e) =>
                      handleRankingConfigChange(
                        'timeout',
                        parseInt(e.target.value, 10),
                      )
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
