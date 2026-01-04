import { ComponentType } from 'react';

export type Action =
  | { type: 'copy'; payload: string }
  | { type: 'open-url'; payload: string }
  | {
      type: 'open-window';
      payload: {
        pluginId: string;
        data?: Record<string, unknown>;
        config: {
          component: string;
          title?: string;
          width?: number;
          height?: number;
          x?: number;
          y?: number;
          overrides?: Record<string, unknown>;
        };
      };
    };

export interface Candidate {
  pluginId: string;
  index: number;
  action: Action;
  icon: string;
  priority: number;
  detailedDescription: string;
  rankingField: string;
  content?:
    | {
        type: 'standard';
        title: string;
        description?: string;
      }
    | {
        type: 'component';
        component: ComponentType<any>;
        props?: Record<string, unknown>;
      };
}

export interface PluginConfigProps {
  config: Record<string, unknown>;
  onSave: (config: Record<string, unknown>) => void;
}

export interface Plugin {
  id: string;
  name: string;
  icon?: string;
  generate(input: string): Promise<Candidate[]>;
  getConfigComponent?: () => ComponentType<PluginConfigProps>;
  getDefaultConfig?: () => Record<string, unknown>;
}
