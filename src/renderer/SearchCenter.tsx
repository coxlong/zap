import { useEffect, useRef, useLayoutEffect } from 'react';
import {
  Command,
  CommandList,
  CommandItem,
} from '@/renderer/components/ui/command';
import { Input } from '@/renderer/components/ui/input';
import { Candidate } from '@/plugins/types';
import { WindowAPI } from '@/main/preload';
import {
  SearchStateProvider,
  useSearch,
} from '@/renderer/contexts/SearchStateContext';
import { Search } from 'lucide-react';

declare global {
  interface Window extends WindowAPI {}
}

function SearchContent() {
  const { state, setSearchTerm, startComposition, endComposition } =
    useSearch();
  const { searchTerm, results, error } = state;
  const containerRef = useRef<HTMLDivElement>(null);

  // Monitor content height changes to dynamically resize window
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const updateWindowHeight = () => {
      const height = container.scrollHeight;
      window.desktop?.resizeSearchWindow(height);
    };

    const observer = new ResizeObserver(() => {
      updateWindowHeight();
    });
    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [results]);

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

      case 'open-window':
        if (window.desktop?.openWindow && candidate.action.payload) {
          const { payload } = candidate.action;
          window.desktop.openWindow({
            data: payload.data,
            config: payload.config,
          });
          window.electron?.ipcRenderer.sendMessage('close-search-window');
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

      if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        const index = parseInt(e.key, 10) - 1;
        if (results[index]) {
          handleSelectCandidate(results[index]);
        }
      }

      // Auto focus input on window focus/render usually handled by autoFocus prop,
      // but ensuring it stays focused can be good.
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [results]);

  const hasResults = results.length > 0;

  return (
    <div className="bg-transparent p-0 m-0">
      <div
        ref={containerRef}
        className="w-full bg-white/50 backdrop-blur-lg backdrop-saturate-150 overflow-hidden font-sans"
      >
        <div className="flex items-center px-5 py-3">
          <Search
            className="w-5 h-5 text-muted-foreground mr-3 shrink-0"
            strokeWidth={2}
          />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onCompositionStart={startComposition}
            onCompositionEnd={(e) => endComposition(e.currentTarget.value)}
            placeholder="输入内容..."
            className="h-8 text-lg font-normal border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent placeholder:text-muted-foreground p-0 shadow-none w-full text-foreground"
            autoFocus
          />
          {error && <div className="text-xs text-red-500 ml-2">{error}</div>}
        </div>
        <div
          className={`h-px bg-gray-400/30 mx-4 ${hasResults ? 'opacity-100' : 'opacity-0'}`}
        />

        <div
          className="overflow-hidden"
          style={{
            height: hasResults ? Math.min(results.length * 60, 400) : 0,
            opacity: hasResults ? 1 : 0,
          }}
        >
          <div className="overflow-y-auto scrollbar-hide h-full">
            <Command className="border-0 bg-transparent">
              <CommandList className="max-h-full">
                {results.map((candidate, index) => (
                  <CommandItem
                    key={`${candidate.pluginId}-${candidate.title}-${candidate.action.payload}`}
                    onSelect={() => handleSelectCandidate(candidate)}
                    className="group flex items-center h-[60px] px-3 py-2 aria-selected:bg-gray-100/80 cursor-default rounded-lg transition-colors duration-200"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-md bg-gray-50 text-2xl border border-gray-100 mr-4 shrink-0 font-emoji">
                      {candidate.icon || '📦'}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="font-medium text-base text-gray-900 leading-tight truncate">
                        {candidate.title}
                      </div>
                      {(candidate.description || candidate.action.type) && (
                        <div className="text-xs text-gray-400 mt-0.5 truncate flex items-center">
                          <span className="truncate">
                            {candidate.description || candidate.pluginId}
                          </span>
                          {candidate.action.type === 'open-url' && (
                            <span className="ml-1.5 opacity-70">URL</span>
                          )}
                        </div>
                      )}
                    </div>

                    {index < 9 && (
                      <div className="opacity-0 group-aria-selected:opacity-100 transition-opacity ml-3 flex items-center">
                        <span className="text-xs text-gray-400 font-medium bg-white px-1.5 py-0.5 rounded border border-gray-200">
                          ⌘{index + 1}
                        </span>
                      </div>
                    )}
                  </CommandItem>
                ))}
              </CommandList>
            </Command>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchCenter() {
  return (
    <SearchStateProvider>
      <SearchContent />
    </SearchStateProvider>
  );
}
