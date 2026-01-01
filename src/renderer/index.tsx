import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import PluginApp from './PluginApp';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);

root.render(
  <HashRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/main" element={<App />} />
      <Route path="/plugin" element={<PluginApp />} />
    </Routes>
  </HashRouter>,
);

// calling IPC exposed from preload script
window.electron?.ipcRenderer.once('ipc-example', (arg) => {
  // eslint-disable-next-line no-console
  console.log(arg);
});
window.electron?.ipcRenderer.sendMessage('ipc-example', ['ping']);
