import React, { useEffect, useState } from 'react';
import { ChatWindow } from './ChatWindow';
import './App.css';

interface PluginRendererProps {
  component?: string;
  data?: Record<string, unknown>;
}

const componentMap: Record<string, React.ComponentType<any>> = {
  ChatWindow,
};

export function PluginRenderer({
  component = 'ChatWindow',
  data = {},
}: PluginRendererProps) {
  const [isReady, setIsReady] = useState(false);
  const [windowData, setWindowData] = useState<Record<string, unknown>>(data);

  useEffect(() => {
    const cleanup = window.electron?.ipcRenderer.on(
      'window-data',
      (payload: unknown) => {
        const eventData = payload as { data?: Record<string, unknown> };
        if (eventData.data) {
          setWindowData(eventData.data);
          setIsReady(true);
        }
      },
    );

    return cleanup;
  }, []);

  const Component = componentMap[component];
  if (!Component) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white">
        <div className="text-red-500">Component {component} not found</div>
      </div>
    );
  }

  if (!isReady && !data) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return <Component {...windowData} />;
}
