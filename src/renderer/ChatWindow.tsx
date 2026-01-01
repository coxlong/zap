import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Button } from '@/renderer/components/ui/button';
import { Input } from '@/renderer/components/ui/input';
import { useEffect, useRef, useState } from 'react';
import { useWindowPreload } from '@/renderer/hooks/useWindowPreload';

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
                  <span key={part.text.slice(0, 10)}>{part.text}</span>
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
