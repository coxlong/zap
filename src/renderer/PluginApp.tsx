import { PluginRenderer } from './PluginRenderer';

export default function PluginApp() {
  const url = new URL(window.location.href);
  const component = url.searchParams.get('component') || 'ChatWindow';

  return <PluginRenderer component={component} />;
}
