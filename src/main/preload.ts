// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import type { AppConfig, PluginConfig } from '@/types/config';

export type Channels =
  | 'ipc-example'
  | 'close-search-window'
  | 'window-data'
  | 'window-reset'
  | 'get-config'
  | 'get-plugin-config'
  | 'update-config'
  | 'update-llm-config'
  | 'update-plugin-config'
  | 'update-ranking-config';

export type WindowChannel = 'window-data' | 'window-reset' | 'window-released';

export interface WindowAPI {
  electron: {
    ipcRenderer: {
      sendMessage: (channel: Channels, ...args: unknown[]) => void;
      send: (channel: WindowChannel, ...args: unknown[]) => void;
      on: (channel: Channels, func: (...args: unknown[]) => void) => () => void;
      once: (channel: Channels, func: (...args: unknown[]) => void) => void;
    };
  };
  desktop: {
    quit: () => void;
    copyToClipboard: (text: string) => void;
    openURL: (url: string) => void;
    resizeSearchWindow: (height: number) => void;
    openWindow: (options: {
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
    }) => void;
    getConfig: () => Promise<AppConfig>;
    getPluginConfig: (pluginId: string) => Promise<PluginConfig | null>;
    updateConfig: (config: Partial<AppConfig>) => Promise<void>;
    updatePluginConfig: (
      pluginId: string,
      config: Partial<PluginConfig>,
    ) => Promise<void>;
  };
}

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    send(windowChannel: WindowChannel, ...args: unknown[]) {
      ipcRenderer.send(windowChannel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
};

const desktopHandler = {
  quit: () => ipcRenderer.invoke('quit-app'),
  copyToClipboard: (text: string) =>
    ipcRenderer.invoke('copy-to-clipboard', text),
  openURL: (url: string) => ipcRenderer.invoke('open-url', url),
  resizeSearchWindow: (height: number) =>
    ipcRenderer.send('resize-search-window', height),
  openWindow: (options: {
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
  }) => ipcRenderer.invoke('open-window', options),
  getConfig: () => ipcRenderer.invoke('get-config'),
  getPluginConfig: (pluginId: string) =>
    ipcRenderer.invoke('get-plugin-config', pluginId),
  updateConfig: (config: Partial<AppConfig>) =>
    ipcRenderer.invoke('update-config', config),
  updatePluginConfig: (pluginId: string, config: Partial<PluginConfig>) =>
    ipcRenderer.invoke('update-plugin-config', pluginId, config),
};

contextBridge.exposeInMainWorld('electron', electronHandler);
contextBridge.exposeInMainWorld('desktop', desktopHandler);

export type ElectronHandler = typeof electronHandler;
export type DesktopHandler = typeof desktopHandler;
