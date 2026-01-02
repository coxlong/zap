import React, { useEffect, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Button } from '@/renderer/components/ui/button';
import { Input } from '@/renderer/components/ui/input';
import { useWindowPreload } from '@/renderer/hooks/useWindowPreload';
// @ts-expect-error
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism';

// ReactMarkdown 组件配置
const markdownComponents = {
  // 自定义样式
  p: ({ children, ...props }: React.ComponentPropsWithoutRef<'p'>) => (
    <p className="mb-2 last:mb-0" {...props}>
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
          className="rounded-md text-sm my-2"
          customStyle={{
            margin: 0,
            padding: '1rem',
            background: '#f8f9fa',
            borderRadius: '0.375rem',
          }}
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      );
    }

    return (
      <code
        className="bg-gray-200 rounded px-1 py-0.5 text-sm font-mono"
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
    <ul className="list-disc list-inside space-y-1 my-2" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: React.ComponentPropsWithoutRef<'ol'>) => (
    <ol className="list-decimal list-inside space-y-1 my-2" {...props}>
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
      className="border-l-4 border-gray-300 pl-4 italic my-2"
      {...props}
    >
      {children}
    </blockquote>
  ),
  h1: ({ children, ...props }: React.ComponentPropsWithoutRef<'h1'>) => (
    <h1 className="text-2xl font-bold my-3" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: React.ComponentPropsWithoutRef<'h2'>) => (
    <h2 className="text-xl font-bold my-2" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: React.ComponentPropsWithoutRef<'h3'>) => (
    <h3 className="text-lg font-bold my-2" {...props}>
      {children}
    </h3>
  ),
  strong: ({
    children,
    ...props
  }: React.ComponentPropsWithoutRef<'strong'>) => (
    <strong className="font-semibold" {...props}>
      {children}
    </strong>
  ),
  em: ({ children, ...props }: React.ComponentPropsWithoutRef<'em'>) => (
    <em className="italic" {...props}>
      {children}
    </em>
  ),
};

interface ChatData {
  initialMessage?: string;
}

export function ChatWindow() {
  const { data, isReady } = useWindowPreload<ChatData>();
  const initialMessage = data?.initialMessage;
  const [input, setInput] = useState('');

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: 'ipc://localhost/api/chat',
    }),
  });

  const hasSentInitialMessageRef = useRef(false);

  useEffect(() => {
    if (isReady && initialMessage && !hasSentInitialMessageRef.current) {
      hasSentInitialMessageRef.current = true;
      sendMessage({ text: initialMessage });
    }
  }, [isReady, initialMessage, sendMessage]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!isReady) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-white flex flex-col">
      <div className="bg-gray-50 border-b p-4">
        <h1 className="text-lg font-semibold">AI 对话</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {message.parts.map((part) =>
                part.type === 'text' ? (
                  <div key={part.text.slice(0, 10)}>
                    {message.role === 'assistant' ? (
                      <ReactMarkdown components={markdownComponents}>
                        {part.text}
                      </ReactMarkdown>
                    ) : (
                      <span>{part.text}</span>
                    )}
                  </div>
                ) : null,
              )}
            </div>
          </div>
        ))}
        {status === 'submitted' && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="animate-pulse">思考中...</div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim()) {
            sendMessage({ text: input });
            setInput('');
          }
        }}
        className="border-t p-4 bg-gray-50"
      >
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入消息..."
            className="flex-1"
            autoFocus
            disabled={status !== 'ready'}
          />
          <Button type="submit" disabled={status !== 'ready'}>
            发送
          </Button>
        </div>
      </form>
    </div>
  );
}
