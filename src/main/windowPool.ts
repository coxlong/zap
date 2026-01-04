import { BrowserWindow, app } from 'electron';
import * as path from 'path';
import log from 'electron-log/main';
import type {
  OpenWindowOptions,
  WindowPoolConfig,
  WindowDataEvent,
  WindowPoolState,
} from '../types/window';

interface IdleWindow {
  window: BrowserWindow;
  createdAt: number;
  lastUsedAt: number;
  useCount: number;
}

interface ActiveWindow {
  window: BrowserWindow;
  acquiredAt: number;
}

/**
 * 清理窗口状态，确保窗口可以安全复用
 * 避免状态污染导致不同会话间的数据混乱
 */
function cleanupWindow(window: BrowserWindow): void {
  try {
    const contents = window.webContents;
    if (!contents || contents.isDestroyed()) {
      return;
    }

    contents.navigationHistory.clear();
    contents.removeAllListeners();
    contents.session.clearStorageData();
  } catch (error) {
    log.error('Window cleanup failed:', error);
  }
}

/**
 * 获取预加载脚本路径
 * 根据打包状态返回正确的预加载脚本路径
 */
function getPreloadPath(): string {
  // 打包时使用 dist 目录下的预加载脚本
  // 开发时使用 .erb/dll 目录
  return app.isPackaged
    ? path.join(__dirname, 'preload.js')
    : path.join(__dirname, '../../.erb/dll/preload.js');
}

/**
 * 获取应用页面URL
 * 用于窗口加载时的页面URL
 */
function getAppPageUrl(options: { component: string }): string {
  // 打包时使用 file:// 协议加载本地文件
  // 开发时使用 localhost 开发服务器
  const base = app.isPackaged
    ? `file://${path.join(__dirname, '../renderer/index.html')}`
    : `http://localhost:${process.env.PORT || 1212}`;

  // 如果有组件参数，使用 /plugin 路由
  if (options?.component) {
    return `${base}#/plugin?component=${options.component}`;
  }

  // 默认使用 /main 路由
  return `${base}#/main`;
}

/**
 * 窗口池管理器
 * 管理一组可复用的窗口实例，提高窗口创建性能
 * 通过复用窗口避免频繁创建销毁的开销
 */
export class WindowPool {
  private idleQueue: IdleWindow[] = [];

  private activeMap = new Map<number, ActiveWindow>();

  private config: WindowPoolConfig;

  constructor(config: WindowPoolConfig) {
    this.config = config;

    this.startGC();
    this.replenishPool();
  }

  async acquire(options: OpenWindowOptions): Promise<BrowserWindow> {
    try {
      const window = await this.pullFromPoolOrCreate(options.config.component);

      this.configureActiveWindow(window, options);

      return window;
    } catch (error) {
      log.error('WindowPool.acquire() failed:', error);
      throw error;
    }
  }

  release(window: BrowserWindow): void {
    try {
      if (!this.activeMap.delete(window.id)) {
        log.warn('Window not found in active map:', window.id);
        window.destroy();
        return;
      }

      window.webContents.send('window-reset');
      window.hide();

      if (this.canRecycle(window)) {
        this.recycle(window);
      } else {
        window.destroy();
      }
    } catch (error) {
      log.error('WindowPool.release() failed:', error);

      if (!window.isDestroyed()) {
        window.destroy();
      }
    }
  }

  getState(): WindowPoolState {
    return {
      poolSize: this.idleQueue.length + this.activeMap.size,
      activeCount: this.activeMap.size,
      idleCount: this.idleQueue.length,
      totalCreated: 0,
      totalReused: 0,
      totalDestroyed: 0,
    };
  }

  destroy(): void {
    this.activeMap.forEach((item) => {
      if (!item.window.isDestroyed()) {
        item.window.destroy();
      }
    });
    this.activeMap.clear();

    this.idleQueue.forEach((item) => {
      if (!item.window.isDestroyed()) {
        item.window.destroy();
      }
    });
    this.idleQueue = [];
  }

  private async pullFromPoolOrCreate(
    component: string,
  ): Promise<BrowserWindow> {
    const item = this.idleQueue.pop();

    if (!item || item.window.isDestroyed()) {
      return this.createNewWindow(component);
    }

    return item.window;
  }

  private async createNewWindow(component: string): Promise<BrowserWindow> {
    const window = new BrowserWindow({
      width: this.config.defaultSize.width,
      height: this.config.defaultSize.height,
      show: false,
      skipTaskbar: false,
      webPreferences: {
        preload: getPreloadPath(),
        contextIsolation: true,
        nodeIntegration: false,
      },
    });

    await window.loadURL(getAppPageUrl({ component }));

    window.on('closed', () => this.handleWindowClose(window));

    return window;
  }

  private configureActiveWindow(
    window: BrowserWindow,
    options: OpenWindowOptions,
  ) {
    this.addToActive(window);

    WindowPool.ensureCorrectUrl(window, options.config)
      .then(() => {
        const { config, data } = options;

        // 设置窗口属性
        if (config.width && config.height) {
          const width = Math.min(config.width, this.config.maxSize.width);
          const height = Math.min(config.height, this.config.maxSize.height);
          window.setSize(width, height);
        }

        if (config.x !== undefined && config.y !== undefined) {
          window.setPosition(config.x, config.y);
        }

        if (config.title) {
          window.setTitle(config.title);
        }

        if (config.overrides) {
          WindowPool.applyOverrides(window, config.overrides);
        }

        WindowPool.sendInitialDataIfNeeded(window, data);

        window.show();
        window.focus();
        return null;
      })
      .catch((error: Error) => {
        log.error('Failed to configure window:', error);
        if (!window.isDestroyed()) {
          window.destroy();
        }
      });
  }

  private static ensureCorrectUrl(
    window: BrowserWindow,
    config: OpenWindowOptions['config'],
  ): Promise<void> {
    const currentUrl = window.webContents.getURL();

    const targetUrl = getAppPageUrl({ component: config.component });

    if (currentUrl !== targetUrl) {
      return window.loadURL(targetUrl);
    }

    return Promise.resolve();
  }

  private static applyOverrides(
    window: BrowserWindow,
    overrides: NonNullable<OpenWindowOptions['config']['overrides']>,
  ): void {
    if (overrides.alwaysOnTop !== undefined) {
      window.setAlwaysOnTop(overrides.alwaysOnTop, 'floating');
    }

    if (overrides.skipTaskbar !== undefined) {
      window.setSkipTaskbar(overrides.skipTaskbar);
    }
  }

  private static sendInitialDataIfNeeded(
    window: BrowserWindow,
    data?: unknown,
  ) {
    if (!data) {
      log.info('[WindowPool] No data to send, skipping window-data event');
      return;
    }

    const eventData: WindowDataEvent = {
      data,
    };

    log.info('[WindowPool] Sending window-data event', { data: eventData });
    window.webContents.send('window-data', eventData);
  }

  private canRecycle(window: BrowserWindow): boolean {
    if (window.isDestroyed()) {
      return false;
    }

    if (this.idleQueue.length >= this.config.maxTotal) {
      return false;
    }

    const contents = window.webContents;
    if (!contents || contents.isDestroyed()) {
      return false;
    }

    return true;
  }

  private recycle(window: BrowserWindow) {
    cleanupWindow(window);

    this.idleQueue.push({
      window,
      createdAt: Date.now(),
      lastUsedAt: Date.now(),
      useCount: 0,
    });
  }

  private addToActive(window: BrowserWindow) {
    this.activeMap.set(window.id, {
      window,
      acquiredAt: Date.now(),
    });
  }

  private handleWindowClose(window: BrowserWindow) {
    this.activeMap.delete(window.id);

    const index = this.idleQueue.findIndex((item) => item.window === window);
    if (index !== -1) {
      this.idleQueue.splice(index, 1);
    }
  }

  private startGC(): void {
    const interval = Math.max(this.config.ttl / 10, 60_000);

    setInterval(() => {
      this.purgeExpired();
      this.replenishPool();
    }, interval);
  }

  private purgeExpired() {
    const now = Date.now();

    this.idleQueue = this.idleQueue.filter((item) => {
      if (now - item.lastUsedAt <= this.config.ttl) {
        return true;
      }

      if (!item.window.isDestroyed()) {
        item.window.destroy();
      }

      return false;
    });
  }

  private replenishPool() {
    const shortage = Math.max(0, this.config.minIdle - this.idleQueue.length);

    if (shortage === 0) {
      return;
    }

    for (let i = 0; i < shortage; i += 1) {
      this.createNewWindow('default')
        .then((window) => this.recycle(window))
        .catch((error) => {
          log.error('Failed to create window for pool:', error);
        });
    }
  }
}
