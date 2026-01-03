import { Routes, Route } from 'react-router-dom';
import './App.css';
import SearchCenter from './SearchCenter';
import { SettingsWindow } from './SettingsWindow';
import { ChatWindow } from './ChatWindow';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/search" element={<SearchCenter />} />
        <Route path="/settings" element={<SettingsWindow />} />
        <Route path="/chat" element={<ChatWindow />} />
        <Route
          path="/"
          element={
            <div>
              <h1>配置页面</h1>
              <p>这里是主窗口的配置内容</p>
            </div>
          }
        />
      </Routes>
      <Toaster />
    </>
  );
}
