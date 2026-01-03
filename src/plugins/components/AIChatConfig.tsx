import { useState } from 'react';
import { Plus, GripVertical, Trash2 } from 'lucide-react';
import { Button } from '@/renderer/components/ui/button';
import { Input } from '@/renderer/components/ui/input';
import { Label } from '@/renderer/components/ui/label';
import { toast } from 'sonner';
import { PluginConfigProps } from '../types';

export function AIChatConfig({ config, onSave }: PluginConfigProps) {
  const [models, setModels] = useState<string[]>(
    (config.availableModels as string[]) || ['qwen2.5:1.5b'],
  );
  const [newModel, setNewModel] = useState('');

  const handleAddModel = () => {
    if (newModel.trim() && !models.includes(newModel.trim())) {
      const updated = [...models, newModel.trim()];
      setModels(updated);
      setNewModel('');
      toast.success('模型添加成功');
    } else if (!newModel.trim()) {
      toast.error('请输入模型名称');
    } else {
      toast.error('该模型已存在');
    }
  };

  const handleRemoveModel = (index: number) => {
    if (models.length > 1) {
      const updated = models.filter((_, i) => i !== index);
      setModels(updated);
      toast.success('模型删除成功');
    } else {
      toast.error('至少需要保留一个模型');
    }
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      const updated = [...models];
      [updated[index], updated[index - 1]] = [
        updated[index - 1],
        updated[index],
      ];
      setModels(updated);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < models.length - 1) {
      const updated = [...models];
      [updated[index + 1], updated[index]] = [
        updated[index],
        updated[index + 1],
      ];
      setModels(updated);
    }
  };

  const handleSave = () => {
    onSave({ availableModels: models });
    toast.success('AI 聊天配置保存成功');
  };

  return (
    <div className="bg-card rounded-xl border p-6 shadow-sm space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>可选模型</Label>
          <p className="text-xs text-muted-foreground">
            第一个模型为默认模型，支持拖拽排序
          </p>
        </div>

        <div className="space-y-2">
          {models.map((model, index) => (
            <div
              key={model}
              className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border"
            >
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <GripVertical className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveDown(index)}
                  disabled={index === models.length - 1}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <GripVertical className="h-3 w-3" />
                </button>
              </div>
              <div className="flex-1 font-mono text-sm">{model}</div>
              {index === 0 && (
                <span className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary font-medium">
                  默认
                </span>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleRemoveModel(index)}
                disabled={models.length === 1}
              >
                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            value={newModel}
            onChange={(e) => setNewModel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddModel();
              }
            }}
            placeholder="例如: qwen2.5:1.5b 或 gpt-4"
            className="font-mono text-sm"
          />
          <Button onClick={handleAddModel} variant="outline" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={handleSave}>保存配置</Button>
      </div>
    </div>
  );
}
