import { useState } from 'react';
import { AppConfig } from '@/types/config';
import { cn } from '@/lib/utils';
import {
  Settings,
  Puzzle,
  ArrowUpDown,
  Plus,
  Trash2,
  Save,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/renderer/components/ui/button';
import { Input } from '@/renderer/components/ui/input';
import { Label } from '@/renderer/components/ui/label';
import { Textarea } from '@/renderer/components/ui/textarea';
import { PluginSettings } from '@/renderer/views/PluginSettings';
import { Separator } from '@/renderer/components/ui/separator';

interface SettingsPanelProps {
  config: AppConfig;
  onConfigUpdate: (updates: Partial<AppConfig>) => void;
  onPluginConfigUpdate: (
    pluginId: string,
    config: Record<string, unknown>,
  ) => void;
}

type SettingsSection = 'llm' | 'plugins' | 'ranking';

export function SettingsPanel({
  config,
  onConfigUpdate,
  onPluginConfigUpdate,
}: SettingsPanelProps) {
  const [localConfig, setLocalConfig] = useState(config);
  const [activeSection, setActiveSection] = useState<SettingsSection>('llm');
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

  const menuItems = [
    { id: 'llm', label: '模型服务', icon: Settings },
    { id: 'plugins', label: '插件扩展', icon: Puzzle },
    { id: 'ranking', label: '排序算法', icon: ArrowUpDown },
  ] as const;

  return (
    <div className="flex h-full bg-background text-foreground">
      {/* Sidebar */}
      <div className="w-64 border-r border-border/40 bg-muted/10 flex flex-col pt-6 pb-4">
        <div className="px-6 mb-8">
          <h1 className="text-xl font-semibold tracking-tight">设置</h1>
          <p className="text-xs text-muted-foreground mt-1">管理您的应用偏好</p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {menuItems.map((item) => (
            <button
              type="button"
              onClick={() => setActiveSection(item.id)}
              className={cn(
                'w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
                activeSection === item.id
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
              )}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="px-6 mt-auto space-y-3">
          <Separator />
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-8 text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="w-3 h-3 mr-1.5" />
              重置
            </Button>
            <Button size="sm" onClick={handleSaveAll} className="h-8 text-xs">
              <Save className="w-3 h-3 mr-1.5" />
              保存
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-10 py-12">
          {activeSection === 'llm' && (
            <div className="space-y-8 animate-in fade-in duration-300 slide-in-from-bottom-2">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight mb-1">
                  模型服务配置
                </h2>
                <p className="text-sm text-muted-foreground">
                  配置和管理您的大语言模型服务提供商
                </p>
              </div>
              <Separator />

              <div className="grid grid-cols-12 gap-8">
                {/* Provider List */}
                <div className="col-span-4 space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                      列表
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={handleAddProvider}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {localConfig.providers.map((provider, index) => (
                      <div
                        key={provider.id}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            setActiveProviderIndex(index);
                          }
                        }}
                        onClick={() => setActiveProviderIndex(index)}
                        className={cn(
                          'group relative flex flex-col p-3 rounded-lg border transition-all duration-200 cursor-pointer',
                          activeProviderIndex === index
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : 'border-transparent hover:bg-muted/50',
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">
                            {provider.name}
                          </span>
                          {localConfig.providers.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveProvider(index);
                              }}
                            >
                              <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                            </Button>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground truncate mt-1">
                          {provider.baseURL || '未设置 URL'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Provider Details */}
                <div className="col-span-8 space-y-6">
                  {localConfig.providers.length > 0 ? (
                    <div className="space-y-6 bg-card rounded-xl border p-6 shadow-sm">
                      <div className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">名称</Label>
                            <Input
                              id="name"
                              value={
                                localConfig.providers[activeProviderIndex].name
                              }
                              onChange={(e) =>
                                handleProviderConfigChange(
                                  'name',
                                  e.target.value,
                                )
                              }
                              className="bg-background/50"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="id">ID</Label>
                            <Input
                              id="id"
                              value={
                                localConfig.providers[activeProviderIndex].id
                              }
                              onChange={(e) =>
                                handleProviderConfigChange('id', e.target.value)
                              }
                              className="bg-background/50 font-mono text-xs"
                              disabled
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="baseURL">Base URL</Label>
                          <Input
                            id="baseURL"
                            value={
                              localConfig.providers[activeProviderIndex].baseURL
                            }
                            onChange={(e) =>
                              handleProviderConfigChange(
                                'baseURL',
                                e.target.value,
                              )
                            }
                            placeholder="例如：http://localhost:11434"
                            className="bg-background/50 font-mono text-sm"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="apiKey">API Key</Label>
                          <Input
                            id="apiKey"
                            type="password"
                            value={
                              localConfig.providers[activeProviderIndex]
                                .apiKey || ''
                            }
                            onChange={(e) =>
                              handleProviderConfigChange(
                                'apiKey',
                                e.target.value,
                              )
                            }
                            className="bg-background/50 font-mono text-sm"
                            placeholder="sk-..."
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="models">可用模型</Label>
                          <Textarea
                            id="models"
                            value={localConfig.providers[
                              activeProviderIndex
                            ].models.join(', ')}
                            onChange={(e) =>
                              handleProviderConfigChange(
                                'models',
                                e.target.value
                                  .split(',')
                                  .map((m) => m.trim())
                                  .filter(Boolean),
                              )
                            }
                            className="min-h-[80px] bg-background/50 font-mono text-sm leading-relaxed"
                            placeholder="gpt-4, gpt-3.5-turbo..."
                          />
                          <p className="text-xs text-muted-foreground">
                            使用逗号分隔多个模型名称
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl">
                      请添加一个提供者
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'plugins' && (
            <div className="animate-in fade-in duration-300 slide-in-from-bottom-2">
              <PluginSettings
                config={localConfig.plugins}
                onSave={onPluginConfigUpdate}
              />
            </div>
          )}

          {activeSection === 'ranking' && (
            <div className="space-y-8 animate-in fade-in duration-300 slide-in-from-bottom-2">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight mb-1">
                  排序算法
                </h2>
                <p className="text-sm text-muted-foreground">
                  调整结果重排序的参数设置
                </p>
              </div>
              <Separator />

              <div className="bg-card rounded-xl border p-6 shadow-sm space-y-6">
                <div className="space-y-2">
                  <Label>排序模型</Label>
                  <Input
                    value={localConfig.ranking.modelName}
                    onChange={(e) =>
                      handleRankingConfigChange('modelName', e.target.value)
                    }
                    className="max-w-md"
                  />
                </div>

                <div className="space-y-2">
                  <Label>系统提示词 (System Prompt)</Label>
                  <Textarea
                    value={localConfig.ranking.systemPrompt}
                    onChange={(e) =>
                      handleRankingConfigChange('systemPrompt', e.target.value)
                    }
                    className="min-h-[120px] font-mono text-sm leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-8 max-w-lg">
                  <div className="space-y-2">
                    <Label>Temperature</Label>
                    <Input
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
                    <Label>超时 (ms)</Label>
                    <Input
                      type="number"
                      min="1000"
                      step="1000"
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
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
