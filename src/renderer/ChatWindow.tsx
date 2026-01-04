import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Button } from '@/renderer/components/ui/button';
import { Input } from '@/renderer/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/renderer/components/ui/select';
import { ChevronDown, ChevronRight } from 'lucide-react';

import type { AIChatPluginConfig } from '@/types/config';
// @ts-expect-error
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { toast } from 'sonner';

// ReactMarkdown 组件配置
const markdownComponents = {
  p: ({ children, ...props }: React.ComponentPropsWithoutRef<'p'>) => (
    <p className="mb-3 last:mb-0 leading-relaxed" {...props}>
      {children}
    </p>
  ),
  code: ({
    children,
    className,
    ...props
  }: React.ComponentPropsWithoutRef<'code'>) => {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';

    if (language) {
      return (
        <SyntaxHighlighter
          style={prism as any}
          language={language}
          PreTag="div"
          className="rounded-lg text-sm my-3"
          customStyle={{
            margin: 0,
            padding: '1rem',
            background: '#f8fafc',
            borderRadius: '0.5rem',
            border: '1px solid #e2e8f0',
          }}
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      );
    }

    return (
      <code
        className="bg-slate-100 rounded px-1.5 py-0.5 text-sm font-mono text-slate-700 border border-slate-200"
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ children }: React.ComponentPropsWithoutRef<'pre'>) => (
    <div>{children}</div>
  ),
  ul: ({ children, ...props }: React.ComponentPropsWithoutRef<'ul'>) => (
    <ul className="list-disc list-inside space-y-1.5 my-3" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: React.ComponentPropsWithoutRef<'ol'>) => (
    <ol className="list-decimal list-inside space-y-1.5 my-3" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }: React.ComponentPropsWithoutRef<'li'>) => (
    <li className="ml-4" {...props}>
      {children}
    </li>
  ),
  blockquote: ({
    children,
    ...props
  }: React.ComponentPropsWithoutRef<'blockquote'>) => (
    <blockquote
      className="border-l-3 border-slate-300 pl-4 italic my-3 text-slate-600 bg-slate-50 py-2 px-3 rounded-r"
      {...props}
    >
      {children}
    </blockquote>
  ),
  h1: ({ children, ...props }: React.ComponentPropsWithoutRef<'h1'>) => (
    <h1 className="text-2xl font-bold my-4 text-slate-900" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: React.ComponentPropsWithoutRef<'h2'>) => (
    <h2 className="text-xl font-semibold my-3 text-slate-800" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: React.ComponentPropsWithoutRef<'h3'>) => (
    <h3 className="text-lg font-semibold my-2 text-slate-700" {...props}>
      {children}
    </h3>
  ),
  strong: ({
    children,
    ...props
  }: React.ComponentPropsWithoutRef<'strong'>) => (
    <strong className="font-semibold text-slate-900" {...props}>
      {children}
    </strong>
  ),
  em: ({ children, ...props }: React.ComponentPropsWithoutRef<'em'>) => (
    <em className="italic text-slate-700" {...props}>
      {children}
    </em>
  ),
};

interface ChatData {
  initialMessage?: string;
  model?: string;
  pluginConfig?: AIChatPluginConfig;
}

interface ChatWindowProps extends ChatData {}

export function ChatWindow(props: ChatWindowProps = {}) {
  const { initialMessage, pluginConfig } = props;
  const propModel = props.model;
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [collapsedReasoning, setCollapsedReasoning] = useState<Set<string>>(
    new Set(),
  );

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasSentInitialMessageRef = useRef(false);

  useEffect(() => {
    if (pluginConfig) {
      setAvailableModels(pluginConfig.availableModels || []);
    }
  }, [pluginConfig]);

  useEffect(() => {
    if (availableModels.length > 0) {
      if (propModel && availableModels.includes(propModel)) {
        setSelectedModel(propModel);
      } else {
        setSelectedModel(availableModels[0]);
      }
    }
  }, [availableModels, propModel]);

  const { messages, sendMessage, status, error, clearError } = useChat({
    transport: new DefaultChatTransport({
      api: 'ipc://localhost/api/chat',
    }),
  });

  useEffect(() => {
    if (error) {
      toast.error(`对话出错: ${error.message}`);
      setTimeout(() => clearError(), 3000);
    }
  }, [error, clearError]);

  const toggleReasoning = useCallback((messageId: string) => {
    setCollapsedReasoning((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  }, []);

  // 自动折叠已完成的思考过程
  useEffect(() => {
    if (status === 'ready' && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant') {
        const hasReasoning = lastMessage.parts.some(
          (part) => part.type === 'reasoning',
        );
        if (hasReasoning) {
          setCollapsedReasoning((prev) => new Set(prev).add(lastMessage.id));
        }
      }
    }
  }, [status, messages]);

  const sendMessageWithModel = useCallback(
    (text: string) => {
      if (!selectedModel) {
        toast.error('请先选择模型');
        return;
      }

      sendMessage(
        {
          text,
        },
        {
          body: {
            model: selectedModel,
          },
        },
      );
    },
    [sendMessage, selectedModel],
  );

  useEffect(() => {
    if (
      initialMessage &&
      initialMessage.trim() !== '' &&
      !hasSentInitialMessageRef.current &&
      selectedModel
    ) {
      hasSentInitialMessageRef.current = true;
      sendMessageWithModel(initialMessage);
    }
  }, [initialMessage, sendMessageWithModel, selectedModel]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (inputRef.current && status === 'ready') {
      inputRef.current.focus();
    }
  }, [status]);

  return (
    <div className="w-full h-screen bg-slate-50 flex flex-col">
      {/* Header - 简约现代风格 */}
      <div className="bg-white border-b border-slate-200 p-5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
          <h1 className="text-lg font-semibold text-slate-800">智能对话助手</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-600 font-medium hidden sm:block">
            模型选择
          </span>
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-[180px] sm:w-[220px] bg-white border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
              <SelectValue placeholder="请选择模型" />
            </SelectTrigger>
            <SelectContent>
              {availableModels.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Messages Area - 改进的视觉层次 */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-5 bg-gradient-to-b from-slate-50 to-white">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-4 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md ${
                message.role === 'user'
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                  : 'bg-white text-slate-800 border border-slate-200'
              }`}
            >
              {message.parts.map((part) => {
                if (part.type === 'text') {
                  return (
                    <div key={part.text.slice(0, 10)}>
                      {message.role === 'assistant' ? (
                        <ReactMarkdown components={markdownComponents}>
                          {part.text}
                        </ReactMarkdown>
                      ) : (
                        <span className="leading-relaxed">{part.text}</span>
                      )}
                    </div>
                  );
                }
                if (part.type === 'reasoning') {
                  const isCollapsed = collapsedReasoning.has(message.id);
                  return (
                    <div
                      key={`reasoning-${part.text.slice(0, 10)}`}
                      className="mb-3"
                    >
                      <button
                        type="button"
                        onClick={() => toggleReasoning(message.id)}
                        className="text-xs font-medium text-blue-600 mb-2 flex items-center gap-2 hover:bg-blue-50 px-3 py-2 rounded-lg transition-all duration-200 group w-full text-left border border-blue-200"
                      >
                        {isCollapsed ? (
                          <ChevronRight className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                        <span className="w-2 h-2 bg-blue-500 rounded-full" />
                        思考过程
                        <span className="ml-auto text-xs opacity-70">
                          {isCollapsed ? '展开' : '折叠'}
                        </span>
                      </button>
                      <div
                        className={`overflow-hidden transition-all duration-300 ${isCollapsed ? 'max-h-0' : 'max-h-96'}`}
                      >
                        <div className="bg-blue-50 rounded-lg p-4 text-sm text-slate-700 leading-relaxed border border-blue-100">
                          {part.text}
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        ))}
        {status === 'submitted' && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 text-slate-600">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                  <div
                    className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: '0.1s' }}
                  />
                  <div
                    className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  />
                </div>
                <span className="text-sm font-medium">正在思考中...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - 现代化输入框 */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim()) {
            sendMessageWithModel(input);
            setInput('');
          }
        }}
        className="border-t border-slate-200 bg-white p-5 shadow-lg"
      >
        <div className="max-w-4xl mx-auto flex gap-3">
          <div className="flex-1">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="请输入您的问题或想法..."
              className="bg-white border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl py-3 px-4 text-slate-800 placeholder-slate-400 transition-all duration-200"
              disabled={status !== 'ready'}
            />
          </div>
          <Button
            type="submit"
            disabled={status !== 'ready' || !input.trim()}
            className="px-6 min-w-[90px] bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'submitted' ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                发送中
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="m22 2-7 20-4-9-9-4Z" />
                  <path d="M22 2 11 13" />
                </svg>
                发送
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
