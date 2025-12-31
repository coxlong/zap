export type Action =
  | { type: 'copy'; payload: string }
  | { type: 'open-url'; payload: string }
  | { type: 'open-chat'; payload?: string };

export interface Candidate {
  pluginId: string;
  title: string;
  description: string;
  action: Action;
  icon?: string;
}

export interface Plugin {
  id: string;
  name: string;
  icon?: string;
  generate(input: string): Candidate | null;
}
