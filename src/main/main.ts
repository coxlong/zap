/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  globalShortcut,
  clipboard,
  protocol,
  Tray,
  Menu,
  nativeImage,
} from 'electron';
import {
  convertToModelMessages,
  streamText,
  generateText,
  UIMessage,
} from 'ai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log/main';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import { windowManager } from './windowManager';
import { configManager } from './configManager';

log.initialize();

// Register IPC protocol as privileged (must be called before app.ready)
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'ipc',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      bypassCSP: true,
    },
  },
]);

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;
let searchWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuiting = false;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  log.info(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

function createSearchWindow() {
  const window = new BrowserWindow({
    width: 680,
    height: 64,
    show: false,
    frame: false,
    resizable: false,
    skipTaskbar: true,
    transparent: true,
    vibrancy: 'hud',
    roundedCorners: true,
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  window.loadURL(`${resolveHtmlPath('index.html')}#/search`);
  window.setAlwaysOnTop(true, 'pop-up-menu');
  window.setVisibleOnAllWorkspaces(true);

  window.on('close', (event) => {
    if (!isQuiting) {
      event.preventDefault();
      window.hide();
    } else if (
      process.platform === 'darwin' &&
      (!mainWindow || mainWindow.isDestroyed())
    ) {
      app.quit();
    }
  });

  return window;
}

function centerSearchWindow() {
  if (searchWindow) {
    const { screen } = require('electron');
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;
    const windowBounds = searchWindow.getBounds();

    searchWindow.setBounds({
      x: Math.round((width - windowBounds.width) / 2),
      y: Math.round((height - windowBounds.height) / 3),
      width: windowBounds.width,
      height: windowBounds.height,
    });
  }
}

function toggleSearchWindow() {
  if (!searchWindow) {
    searchWindow = createSearchWindow();
  }

  if (searchWindow.isVisible()) {
    searchWindow.hide();
  } else {
    centerSearchWindow();
    searchWindow.show();
    searchWindow.focus();
  }
}

function createTrayIcon() {
  const size = 16;
  const buffer = Buffer.alloc(size * size * 4);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const offset = (y * size + x) * 4;
      const isEdge = x < 2 || x >= size - 2 || y < 2 || y >= size - 2;

      buffer[offset] = isEdge ? 0 : 0x4a; // R
      buffer[offset + 1] = isEdge ? 0 : 0x90; // G
      buffer[offset + 2] = isEdge ? 0 : 0xe2; // B
      buffer[offset + 3] = isEdge ? 0 : 0xff; // A
    }
  }

  return nativeImage.createFromBuffer(buffer, { width: size, height: size });
}

function createTray() {
  if (tray) return;

  try {
    tray = new Tray(createTrayIcon());

    tray.setContextMenu(
      Menu.buildFromTemplate([
        {
          label: '搜索',
          accelerator: 'Cmd+Shift+Space',
          click: toggleSearchWindow,
        },
        {
          label: '设置',
          click: () => {
            mainWindow?.show();
            mainWindow?.focus();
          },
        },
        { type: 'separator' },
        {
          label: '退出',
          accelerator: 'Cmd+Q',
          click: () => {
            isQuiting = true;
            app.quit();
          },
        },
      ]),
    );

    tray.setToolTip('Zap 助手');
    tray.on('click', toggleSearchWindow);
  } catch (error) {
    log.error('[TRAY] Failed to create tray:', error);
  }
}

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug').default({
    showDevTools: true,
    devToolsMode: 'detach',
  });
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(`${resolveHtmlPath('index.html')}#/settings`);

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) throw new Error('"mainWindow" is not defined');
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (
      isQuiting &&
      process.platform === 'darwin' &&
      (!searchWindow || searchWindow.isDestroyed())
    ) {
      app.quit();
    }
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (!isQuiting) {
    isQuiting = true;

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.close();
    }
    if (searchWindow && !searchWindow.isDestroyed()) {
      searchWindow.close();
    }

    if (windowManager) {
      windowManager.destroy();
    }
  }
});

ipcMain.on('close-search-window', () => {
  if (searchWindow && searchWindow.isVisible()) {
    searchWindow.hide();
  }
});

ipcMain.handle('quit-app', () => {
  isQuiting = true;
  app.quit();
});

ipcMain.on('resize-search-window', (_, height: number) => {
  if (searchWindow && !searchWindow.isDestroyed()) {
    const MAX_HEIGHT = 500;
    const MIN_HEIGHT = 64;
    const newHeight = Math.max(MIN_HEIGHT, Math.min(height, MAX_HEIGHT));
    const bounds = searchWindow.getBounds();
    searchWindow.setSize(bounds.width, newHeight, true);
  }
});

ipcMain.handle('copy-to-clipboard', (_, text: string) => {
  clipboard.writeText(text);
});

ipcMain.handle('open-url', (_, url: string) => {
  shell.openExternal(url);
});

ipcMain.handle(
  'open-window',
  (
    _,
    options: {
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
    },
  ) => {
    windowManager.openWindow(options);
  },
);

ipcMain.handle('get-config', async () => {
  return configManager.getConfig();
});

ipcMain.handle('get-plugin-config', async (_, pluginId: string) => {
  try {
    const config = configManager.getConfig();
    return config.plugins[pluginId] || null;
  } catch (error) {
    log.error('[IPC] get-plugin-config error:', error);
    return null;
  }
});

ipcMain.handle('update-config', async (_, config: unknown) => {
  await configManager.updateConfig(config as any);
  return { success: true };
});

ipcMain.handle(
  'update-plugin-config',
  async (_, pluginId: string, config: unknown) => {
    await configManager.updatePluginConfig(pluginId, config as any);
    return { success: true };
  },
);

app
  .whenReady()
  .then(async () => {
    await configManager.initialize();
    protocol.handle('ipc', async (request) => {
      const url = new URL(request.url);
      log.info(`[IPC] Received request: ${request.method} ${url.pathname}`);

      const config = configManager.getConfig();

      // 根据模型名找到对应的提供者
      const findProviderForModel = (modelName: string) => {
        return config.providers.find((provider) =>
          provider.models.includes(modelName),
        );
      };

      if (url.pathname === '/api/chat') {
        try {
          const body = await request.json();
          const {
            messages,
            model = 'qwen2.5:1.5b',
            stream = true,
          }: { messages: UIMessage[]; model?: string; stream?: boolean } = body;
          log.info(
            `[IPC] Processing chat request for model: ${model}, messages count: ${messages?.length}, stream: ${stream}`,
          );

          const provider = findProviderForModel(model);
          if (!provider) {
            log.error(`[IPC] No provider found for model: ${model}`);
            return new Response(
              JSON.stringify({
                error: `No provider found for model: ${model}. Please check your configuration.`,
              }),
              { status: 500, headers: { 'Content-Type': 'application/json' } },
            );
          }

          // 创建动态的 LLM provider
          const dynamicLLMProvider = createOpenAICompatible({
            name: provider.id,
            baseURL: provider.baseURL,
            apiKey: provider.apiKey || '',
            supportsStructuredOutputs: true,
          });

          // Handle non-streaming request
          if (!stream) {
            const result = await generateText({
              model: dynamicLLMProvider(model),
              messages: await convertToModelMessages(messages),
            });

            return new Response(
              JSON.stringify({
                model,
                created_at: new Date().toISOString(),
                message: {
                  role: 'assistant',
                  content: result.text,
                },
                done: true,
                total_duration: 0,
                load_duration: 0,
                prompt_eval_count: result.usage?.inputTokens ?? 0,
                eval_count: result.usage?.outputTokens ?? 0,
              }),
              {
                headers: { 'Content-Type': 'application/json' },
              },
            );
          }

          const result = streamText({
            model: dynamicLLMProvider(model),
            messages: await convertToModelMessages(messages),
          });

          return result.toUIMessageStreamResponse();
        } catch (error) {
          log.error('[IPC] Chat protocol error:', error);
          return new Response(
            JSON.stringify({
              error: error instanceof Error ? error.message : 'Unknown error',
            }),
            { status: 500 },
          );
        }
      }

      if (url.pathname === '/chat/completions') {
        try {
          const requestBody = await request.arrayBuffer();
          const bodyText = new TextDecoder().decode(requestBody);
          const body = JSON.parse(bodyText);
          const { model }: { model?: string } = body;

          log.info(`[IPC] BODY: ${JSON.stringify(body)}`);

          if (!model) {
            log.error('[IPC] Missing model in request body');
            return new Response(
              JSON.stringify({
                error: 'Model parameter is required',
              }),
              { status: 400, headers: { 'Content-Type': 'application/json' } },
            );
          }

          const provider = findProviderForModel(model);
          if (!provider) {
            log.error(`[IPC] No provider found for model: ${model}`);
            return new Response(
              JSON.stringify({
                error: `No provider found for model: ${model}. Please check your configuration.`,
              }),
              { status: 500, headers: { 'Content-Type': 'application/json' } },
            );
          }

          const targetBaseURL = provider.baseURL;
          const targetUrl = `${targetBaseURL}${url.pathname}${url.search}`;
          log.info(`[IPC] Forwarding to: ${targetUrl}`);

          const headers = new Headers(request.headers);

          if (provider.apiKey) {
            headers.set('Authorization', `Bearer ${provider.apiKey}`);
          }

          const response = await fetch(targetUrl, {
            method: request.method,
            headers,
            body: requestBody,
            // @ts-ignore - duplex is needed for streaming request body
            duplex: 'half',
          });

          return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
          });
        } catch (error) {
          log.error('[IPC] Proxy error:', error);
          return new Response(
            JSON.stringify({
              error: error instanceof Error ? error.message : 'Unknown error',
            }),
            { status: 502, headers: { 'Content-Type': 'application/json' } },
          );
        }
      }

      log.warn(`[IPC] Rejected request: ${request.method} ${url.pathname}`);
      return new Response(
        JSON.stringify({
          error:
            'This endpoint is not supported. Only /api/chat and /v1/chat/completions are allowed.',
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } },
      );
    });

    globalShortcut.register('CommandOrControl+Shift+Space', () => {
      toggleSearchWindow();
    });

    if (!globalShortcut.isRegistered('CommandOrControl+Shift+Space')) {
      globalShortcut.register('Alt+Space', () => {
        toggleSearchWindow();
      });
    }

    // Initialize window manager
    windowManager.initialize({
      minIdle: 1,
      maxTotal: 10,
      ttl: 5 * 60 * 1000,
      defaultSize: {
        width: 800,
        height: 600,
      },
      maxSize: {
        width: 2000,
        height: 1500,
      },
    });

    createWindow();

    // Create tray icon
    setTimeout(() => {
      if (process.platform === 'darwin') {
        createTray();
        log.info('[TRAY] Tray 已创建');
      }
    }, 500);

    app.on('activate', () => {
      if (!searchWindow) createSearchWindow();
      toggleSearchWindow();

      if (process.platform === 'darwin' && !tray) createTray();
    });
  })
  .catch((error) => {
    log.error('[APP] Failed to initialize app:', error);
    app.quit();
  });

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  tray?.destroy();
});
