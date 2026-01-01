import { WindowPool } from './windowPool';
import type { WindowPoolConfig, OpenWindowOptions } from '../types/window';

/**
 * 窗口管理器
 * 集成窗口池，负责窗口的创建、管理和复用
 */
export class WindowManager {
  /**
   * 窗口池实例
   */
  private pool: WindowPool | null = null;

  /**
   * 初始化窗口管理器
   */
  initialize(config: WindowPoolConfig): void {
    this.pool = new WindowPool(config);
  }

  /**
   * 打开窗口
   * @param options 打开窗口选项
   * @returns 窗口实例或null
   */
  async openWindow(options: OpenWindowOptions): Promise<any> {
    try {
      if (!this.pool) {
        throw new Error('Window pool not initialized');
      }
      return await this.pool.acquire(options);
    } catch (error) {
      throw new Error(`Failed to open window: ${error}`);
    }
  }

  /**
   * 释放窗口回池
   * @param window 窗口实例
   */
  releaseWindow(window: any): void {
    if (this.pool) {
      this.pool.release(window);
    } else if (!window.isDestroyed()) {
      window.destroy();
    }
  }

  /**
   * 获取窗口池状态
   */
  getPoolState(): ReturnType<WindowPool['getState']> | null {
    return this.pool ? this.pool.getState() : null;
  }

  /**
   * 销毁窗口池
   */
  destroy(): void {
    if (this.pool) {
      this.pool.destroy();
      this.pool = null;
    }
  }
}

/**
 * 全局窗口管理器实例
 */
export const windowManager = new WindowManager();
