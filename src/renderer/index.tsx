import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import SearchCenter from './SearchCenter';
import { SettingsWindow } from './SettingsWindow';
import PluginApp from './PluginApp';
import { Toaster } from './components/ui/sonner';
import './App.css';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);

root.render(
  <HashRouter>
    <Routes>
      <Route path="/search" element={<SearchCenter />} />
      <Route path="/settings" element={<SettingsWindow />} />
      <Route path="/plugin" element={<PluginApp />} />
      <Route path="/" element={<SettingsWindow />} />
    </Routes>
    <Toaster />
  </HashRouter>,
);

// calling IPC exposed from preload script
window.electron?.ipcRenderer.once('ipc-example', (arg) => {
  // eslint-disable-next-line no-console
  console.log(arg);
});
window.electron?.ipcRenderer.sendMessage('ipc-example', ['ping']);
