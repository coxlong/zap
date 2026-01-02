import { JSONSchema7 } from 'json-schema';

export type Action =
  | { type: 'copy'; payload: string }
  | { type: 'open-url'; payload: string }
  | {
      type: 'open-window';
      payload: {
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
  title: string;
  description: string;
  action: Action;
  icon?: string;
  priority: number;
  detailedDescription: string;
  rankingField: string;
}

export interface Plugin {
  id: string;
  name: string;
  icon?: string;
  generate(input: string): Candidate | null;
  getConfigSchema?: () => JSONSchema7;
  getUiSchema?: () => Record<string, any>;
  getDefaultConfig?: () => Record<string, unknown>;
}
