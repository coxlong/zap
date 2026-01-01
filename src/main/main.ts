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
} from 'electron';
import {
  convertToModelMessages,
  streamText,
  generateText,
  UIMessage,
} from 'ai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import { windowManager } from './windowManager';

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

const OLLAMA_BASE_URL = 'http://192.168.100.4:11434';
const llmProvider = createOpenAICompatible({
  name: 'ollama',
  baseURL: `${OLLAMA_BASE_URL}/v1`,
});

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;
let searchWindow: BrowserWindow | null = null;
let isQuiting = false;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  log.info(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

function createSearchWindow() {
  const window = new BrowserWindow({
    width: 720,
    height: 420,
    show: false,
    frame: false,
    resizable: false,
    skipTaskbar: true,
    transparent: true,
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  window.loadURL(resolveHtmlPath('index.html'));
  window.setAlwaysOnTop(true, 'floating');
  window.setVisibleOnAllWorkspaces(true);

  window.on('close', (event) => {
    if (!isQuiting) {
      event.preventDefault();
      window.hide();
    }
    return false;
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

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug').default();
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

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
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

ipcMain.on('close-search-window', () => {
  if (searchWindow && searchWindow.isVisible()) {
    searchWindow.hide();
  }
});

ipcMain.handle('quit-app', () => {
  isQuiting = true;
  app.quit();
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

app
  .whenReady()
  .then(() => {
    // Handle IPC protocol requests
    protocol.handle('ipc', async (request) => {
      const url = new URL(request.url);
      log.info(`[IPC] Received request: ${request.method} ${url.pathname}`);

      // POST /api/chat - Custom chat endpoint with AI SDK
      if (url.pathname === '/api/chat' && request.method === 'POST') {
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

          // Handle non-streaming request
          if (!stream) {
            const result = await generateText({
              model: llmProvider(model),
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
            model: llmProvider(model),
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

      // All other requests: passthrough to Ollama
      const targetUrl = `${OLLAMA_BASE_URL}${url.pathname}${url.search}`;
      log.info(`[IPC] Forwarding to: ${targetUrl}`);

      try {
        const response = await fetch(targetUrl, {
          method: request.method,
          headers: request.headers,
          body: request.body,
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
      minIdle: 2,
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
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(log.error);

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
