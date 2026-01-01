import type { BrowserWindowConstructorOptions } from 'electron';

/**
 * 窗口池配置
 */
export interface WindowPoolConfig {
  /**
   * 最小空闲窗口数
   */
  minIdle: number;

  /**
   * 最大窗口数（包含活跃和空闲）
   */
  maxTotal: number;

  /**
   * 空闲窗口超时时间（毫秒）
   */
  ttl: number;

  /**
   * 默认窗口大小
   */
  defaultSize: {
    width: number;
    height: number;
  };

  /**
   * 最大允许尺寸
   */
  maxSize: {
    width: number;
    height: number;
  };
}

/**
 * 窗口打开选项
 */
export interface OpenWindowOptions {
  /**
   * 预加载数据
   */
  data?: Record<string, any>;

  /**
   * 窗口配置
   */
  config: {
    /**
     * 组件名 - 必填参数，用于路由到具体组件
     */
    component: string;

    /**
     * 窗口标题
     */
    title?: string;

    /**
     * 窗口宽度
     */
    width?: number;

    /**
     * 窗口高度
     */
    height?: number;

    /**
     * 窗口位置X
     */
    x?: number;

    /**
     * 窗口位置Y
     */
    y?: number;

    /**
     * 其他 Electron 窗口选项
     */
    overrides?: Partial<BrowserWindowConstructorOptions>;
  };
}

/**
 * 窗口数据事件
 */
export interface WindowDataEvent {
  /**
   * 预加载数据
   */
  data?: Record<string, any>;
}

/**
 * 窗口池状态
 */
export interface WindowPoolState {
  /**
   * 当前池大小
   */
  poolSize: number;

  /**
   * 活跃窗口数
   */
  activeCount: number;

  /**
   * 空闲窗口数
   */
  idleCount: number;

  /**
   * 总创建数
   */
  totalCreated: number;

  /**
   * 总复用数
   */
  totalReused: number;

  /**
   * 总销毁数
   */
  totalDestroyed: number;
}
