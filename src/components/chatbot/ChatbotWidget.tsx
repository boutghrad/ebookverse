'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Trash2, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChatStore } from '@/lib/chat-store';
import { cn } from '@/lib/utils';

const SUGGESTIONS = [
  'What are the trending books?',
  'Show me free books',
  'What categories do you have?',
  'How can I pay?',
];

export default function ChatbotWidget() {
  const { messages, isOpen, isLoading, addMessage, setIsOpen, setIsLoading, clearMessages } =
    useChatStore();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = async (text?: string) => {
    const message = (text || input).trim();
    if (!message || isLoading) return;

    setInput('');
    addMessage('user', message);
    setIsLoading(true);

    try {
      const chatMessages = [
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user' as const, content: message },
      ];

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatMessages }),
      });

      const data = await res.json();
      addMessage('assistant', data.reply || 'Sorry, I could not understand that. Could you rephrase?');
    } catch {
      addMessage('assistant', 'Sorry, I encountered an error. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 size-14 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg hover:shadow-xl hover:shadow-violet-500/25 transition-shadow flex items-center justify-center group"
            aria-label="Open chat"
          >
            <MessageCircle className="size-6 group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 size-4 bg-emerald-500 rounded-full border-2 border-background animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] h-[540px] max-h-[calc(100vh-6rem)] bg-card border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white shrink-0">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles className="size-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">EbookBot</h3>
                  <p className="text-[10px] text-white/70">AI Assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-white/70 hover:text-white hover:bg-white/10"
                  onClick={clearMessages}
                  title="Clear chat"
                >
                  <Trash2 className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-white/70 hover:text-white hover:bg-white/10"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Welcome Message */}
              {messages.length === 0 && (
                <div className="flex flex-col items-center text-center gap-4 py-6">
                  <div className="size-16 rounded-full bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center">
                    <Bot className="size-8 text-violet-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-base">Welcome to EbookBot!</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      I can help you find books, answer questions, and navigate the store.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 w-full mt-2">
                    {SUGGESTIONS.map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => sendMessage(suggestion)}
                        className="text-left text-xs p-2.5 rounded-lg border bg-background hover:bg-muted transition-colors leading-relaxed"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Messages */}
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn('flex gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start')}
                >
                  {msg.role === 'assistant' && (
                    <div className="size-7 rounded-full bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center shrink-0 mt-1">
                      <Bot className="size-3.5 text-violet-500" />
                    </div>
                  )}
                  <div
                    className={cn(
                      'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-br-md'
                        : 'bg-muted rounded-bl-md'
                    )}
                  >
                    {msg.content}
                  </div>
                  {msg.role === 'user' && (
                    <div className="size-7 rounded-full bg-violet-500 flex items-center justify-center shrink-0 mt-1">
                      <User className="size-3.5 text-white" />
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2 justify-start"
                >
                  <div className="size-7 rounded-full bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="size-3.5 text-violet-500" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1.5">
                      <span className="size-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
                      <span className="size-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
                      <span className="size-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Suggestions below messages */}
            {messages.length > 0 && !isLoading && (
              <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
                {SUGGESTIONS.slice(0, 2).map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => sendMessage(suggestion)}
                    className="text-[11px] px-2.5 py-1 rounded-full border bg-background hover:bg-muted transition-colors whitespace-nowrap shrink-0"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-4 pb-4 pt-2 shrink-0">
              <div className="flex items-end gap-2 bg-muted/50 rounded-xl border px-3 py-2 focus-within:border-violet-500 focus-within:ring-1 focus-within:ring-violet-500 transition-all">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything..."
                  rows={1}
                  className="flex-1 bg-transparent text-sm resize-none outline-none placeholder:text-muted-foreground max-h-20 py-0.5"
                  style={{ height: 'auto' }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = Math.min(target.scrollHeight, 80) + 'px';
                  }}
                />
                <Button
                  size="icon"
                  className="size-8 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shrink-0"
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
