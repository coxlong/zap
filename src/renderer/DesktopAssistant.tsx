import { useState, useEffect } from 'react';
import {
  Command,
  CommandList,
  CommandItem,
} from '@/renderer/components/ui/command';
import { Input } from '@/renderer/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/renderer/components/ui/dialog';
import { processInput } from '@/plugins';
import { Candidate } from '@/plugins/types';
import { Channels } from '@/main/preload';

interface WindowAPI {
  electron: {
    ipcRenderer: {
      sendMessage: (channel: Channels, ...args: unknown[]) => void;
      on: (channel: Channels, func: (...args: unknown[]) => void) => () => void;
      once: (channel: Channels, func: (...args: unknown[]) => void) => void;
    };
  };
  desktop: {
    quit: () => void;
    copyToClipboard: (text: string) => void;
    openURL: (url: string) => void;
  };
}

declare global {
  interface Window extends WindowAPI {}
}

export function DesktopAssistant() {
  const [searchTerm, setSearchTerm] = useState('');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    if (searchTerm) {
      const results = processInput(searchTerm);
      setCandidates(results);
    } else {
      setCandidates([]);
    }
  }, [searchTerm]);

  const handleSelectCandidate = (candidate: Candidate) => {
    switch (candidate.action.type) {
      case 'copy':
        if (candidate.action.payload) {
          window.desktop?.copyToClipboard(candidate.action.payload);
          window.electron?.ipcRenderer.sendMessage('close-search-window');
        }
        break;

      case 'open-url':
        if (candidate.action.payload) {
          window.desktop?.openURL(candidate.action.payload);
          window.electron?.ipcRenderer.sendMessage('close-search-window');
        }
        break;

      case 'open-chat':
        if (candidate.action.payload) {
          setChatInput(candidate.action.payload);
          setIsChatOpen(true);
        }
        break;

      default:
        break;
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        window.electron?.ipcRenderer.sendMessage('close-search-window');
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'q') {
        e.preventDefault();
        window.desktop?.quit();
      }

      if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '8') {
        e.preventDefault();
        const index = parseInt(e.key, 10) - 1;
        if (candidates[index]) {
          handleSelectCandidate(candidates[index]);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [candidates]);

  return (
    <div className="w-full h-screen bg-black/50 flex items-center justify-center">
      <div className="w-[720px] h-[420px] bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="输入时间戳、网址或任何问题..."
            className="h-14 text-lg border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            autoFocus
          />
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {candidates.length > 0 ? (
            <Command className="border-0">
              <CommandList>
                {candidates.map((candidate, index) => (
                  <CommandItem
                    key={`${candidate.pluginId}-${candidate.title}-${candidate.action.payload}`}
                    onSelect={() => handleSelectCandidate(candidate)}
                    className="flex items-center h-10 px-3 py-2 hover:bg-gray-100 cursor-pointer rounded-md"
                  >
                    <span className="w-6 text-sm mr-2">
                      {candidate.icon || '📋'}
                    </span>
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {candidate.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {candidate.description}
                      </div>
                    </div>
                    {index < 9 && (
                      <span className="text-xs text-gray-400 ml-auto">
                        ⌘{index + 1}
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandList>
            </Command>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <div className="text-4xl mb-2">🕵️</div>
              <div className="text-lg mb-1">没有找到匹配的操作</div>
              <div className="text-sm text-gray-400">
                试试输入时间戳、网址或提问
              </div>
            </div>
          )}
        </div>

        <div className="px-4 py-2 border-t border-gray-200 text-xs text-gray-500">
          <span>ESC</span> 关闭 · <span>⌘+数字</span> 快速选择
        </div>
      </div>

      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogContent className="sm:max-w-[600px] h-[500px] flex flex-col">
          <DialogHeader>
            <DialogTitle>AI 对话</DialogTitle>
          </DialogHeader>
          <div className="flex-1 flex flex-col p-0">
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="p-4 rounded-lg bg-muted text-muted-foreground">
                请输入您的问题：{chatInput}
              </div>
            </div>
            <div className="p-4 border-t">
              <Input placeholder="输入消息..." className="w-full" />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
