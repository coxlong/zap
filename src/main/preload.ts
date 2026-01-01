// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels =
  | 'ipc-example'
  | 'close-search-window'
  | 'window-data'
  | 'window-reset';

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
    openWindow: (options: {
      data?: Record<string, unknown>;
      config: {
        route: string;
        title?: string;
        width?: number;
        height?: number;
        x?: number;
        y?: number;
        overrides?: Record<string, unknown>;
      };
    }) => void;
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
  openWindow: (options: {
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
};

contextBridge.exposeInMainWorld('electron', electronHandler);
contextBridge.exposeInMainWorld('desktop', desktopHandler);

export type ElectronHandler = typeof electronHandler;
