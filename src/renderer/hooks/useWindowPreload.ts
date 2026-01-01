import { useState, useEffect, useCallback } from 'react';
import electronLog from 'electron-log/renderer';

import type { DependencyList } from 'react';

interface UseWindowPreloadOptions<T> {
  initialData?: T;
}

interface UseWindowPreloadReturn<T> {
  data: T | null;
  isReady: boolean;
  reset: () => void;
  updateData: (newData: T) => void;
}

export function useWindowPreload<T = any>(
  options: UseWindowPreloadOptions<T> = {},
): UseWindowPreloadReturn<T> {
  const [data, setData] = useState<T | null>(options.initialData ?? null);
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    let dataReceived = false;

    const cleanup = window.electron?.ipcRenderer.on(
      'window-data',
      (payload: unknown) => {
        if (!isMounted || dataReceived) return;

        try {
          const eventData = payload as { data?: unknown };

          setData((eventData.data ?? null) as T);
          setIsReady(true);
          dataReceived = true;
          electronLog.info('Data processed successfully', {
            data: eventData.data,
          });
        } catch (error) {
          electronLog.error('Error processing window-data:', error);
        }
      },
    );

    const cleanupReset = window.electron?.ipcRenderer.on('window-reset', () => {
      if (!isMounted) return;

      dataReceived = false;
      setData(options.initialData ?? null);
      setIsReady(false);
    });

    // 如果1秒内没有收到数据，也标记为就绪
    const timeoutId = setTimeout(() => {
      if (!isMounted || dataReceived) return;
      electronLog.warn('No data received after 1s, marking as ready');
      setIsReady(true);
    }, 1000);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      cleanup?.();
      cleanupReset?.();
    };
  }, [options.initialData]);

  const reset = useCallback(() => {
    setData(options.initialData ?? null);
    setIsReady(false);
  }, [options.initialData]);

  const updateData = useCallback((newData: T) => {
    setData(newData);
  }, []);

  return {
    data,
    isReady,
    reset,
    updateData,
  };
}

export function useWindowResetEffect(
  onReset: () => void,
  deps: DependencyList = [],
): void {
  useEffect(() => {
    const cleanup = window.electron?.ipcRenderer.on('window-reset', () => {
      onReset();
    });

    return () => {
      cleanup?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onReset, ...deps]);
}
