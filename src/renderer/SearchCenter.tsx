import { useEffect, useRef, useLayoutEffect } from 'react';
import {
  Command,
  CommandList,
  CommandItem,
  CommandInput,
  CommandEmpty,
} from '@/renderer/components/ui/command';
import { Candidate } from '@/plugins/types';
import { WindowAPI } from '@/main/preload';
import {
  SearchStateProvider,
  useSearch,
} from '@/renderer/contexts/SearchStateContext';

declare global {
  interface Window extends WindowAPI {}
}

function SearchContent() {
  const { state, setSearchTerm, startComposition, endComposition } =
    useSearch();
  const { searchTerm, results, error } = state;
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Listen for focus event from main process
  useEffect(() => {
    const handleFocus = () => {
      inputRef.current?.focus();
    };

    const cleanup = window.electron?.ipcRenderer.on(
      'search-window-focus',
      handleFocus,
    );

    return cleanup;
  }, []);

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
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [results]);

  const hasResults = results.length > 0;

  return (
    <div
      ref={containerRef}
      className="w-full min-h-[64px] bg-white/50 backdrop-blur-lg backdrop-saturate-150 overflow-hidden font-sans"
    >
      <Command
        className="bg-transparent [&_[data-slot=command-input-wrapper]]:!h-16 [&_[data-slot=command-input-wrapper]]:!border-0 [&_[cmdk-list]]:px-2 [&_[cmdk-list]]:pb-2"
        shouldFilter={false}
      >
        <CommandInput
          ref={inputRef}
          value={searchTerm}
          onValueChange={setSearchTerm}
          onCompositionStart={startComposition}
          onCompositionEnd={(e) =>
            endComposition((e.target as HTMLInputElement).value)
          }
          placeholder="输入内容..."
          className="text-lg hover:bg-transparent focus:bg-transparent active:bg-transparent hover:outline-none focus:outline-none hover:ring-0 focus:ring-0"
        />

        {hasResults && <div className="h-px bg-gray-200/60 mx-4" />}

        {hasResults && (
          <CommandList className="max-h-[400px]">
            <CommandEmpty>
              {error ? (
                <div className="text-red-500 text-sm">{error}</div>
              ) : (
                <div className="text-muted-foreground text-sm">
                  输入关键词开始搜索...
                </div>
              )}
            </CommandEmpty>

            {results.map((candidate, index) => (
              <CommandItem
                key={`${candidate.pluginId}-${candidate.title}-${candidate.action.payload || index}`}
                value={`${candidate.title}-${index}`}
                onSelect={() => handleSelectCandidate(candidate)}
                className="group h-[60px] rounded-lg aria-selected:bg-gray-100/80"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-md bg-gray-50 text-2xl border border-gray-100 shrink-0">
                  {candidate.icon || '📦'}
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-center ml-3">
                  <div className="font-medium text-base text-gray-900 leading-tight truncate">
                    {candidate.title}
                  </div>
                  {(candidate.description || candidate.action.type) && (
                    <div className="text-xs text-gray-400 mt-0.5 truncate">
                      <span className="truncate">
                        {candidate.description || candidate.pluginId}
                      </span>
                      {candidate.action.type === 'open-url' && (
                        <span className="ml-1.5 opacity-70">· URL</span>
                      )}
                    </div>
                  )}
                </div>

                {index < 9 && (
                  <div className="opacity-0 group-aria-selected:opacity-100 transition-opacity">
                    <span className="text-xs text-gray-400 font-medium bg-white px-1.5 py-0.5 rounded border border-gray-200">
                      ⌘{index + 1}
                    </span>
                  </div>
                )}
              </CommandItem>
            ))}
          </CommandList>
        )}
      </Command>
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
