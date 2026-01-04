import { useState, useEffect, useCallback } from 'react';
import log from 'electron-log/renderer';

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

    log.info(
      '[useWindowPreload] Hook initialized, waiting for window-data event',
    );

    const cleanup = window.electron?.ipcRenderer.on(
      'window-data',
      (payload: unknown) => {
        log.info('[useWindowPreload] Received window-data event', { payload });

        if (!isMounted || dataReceived) {
          log.warn('[useWindowPreload] Ignoring event', {
            isMounted,
            dataReceived,
          });
          return;
        }

        try {
          const eventData = payload as { data?: unknown };

          setData((eventData.data ?? null) as T);
          setIsReady(true);
          dataReceived = true;
          log.info('[useWindowPreload] Data processed successfully', {
            data: eventData.data,
          });
        } catch (error) {
          log.error('[useWindowPreload] Error processing window-data:', error);
        }
      },
    );

    log.info('[useWindowPreload] Event listener registered for window-data');

    const cleanupReset = window.electron?.ipcRenderer.on('window-reset', () => {
      if (!isMounted) return;

      dataReceived = false;
      setData(options.initialData ?? null);
      setIsReady(false);
    });

    // 如果1秒内没有收到数据，也标记为就绪
    const timeoutId = setTimeout(() => {
      if (!isMounted || dataReceived) return;
      log.warn(
        '[useWindowPreload] No data received after 1s, marking as ready. This might be expected if window was opened via route instead of openWindow()',
      );
      log.info('[useWindowPreload] Window location:', window.location.href);
      setIsReady(true);
    }, 1000);

    return () => {
      log.info('[useWindowPreload] Cleaning up hook');
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
