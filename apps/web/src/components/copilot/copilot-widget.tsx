"use client";

import { useChat } from '@ai-sdk/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEffect, useRef, useState } from 'react';
import { parseCitations } from './citation';
import { Send, Bot, User, RefreshCw, Square, X, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function CopilotWidget() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const { messages, append, stop, regenerate, isLoading, error } = useChat({
    api: '/api/chat',
  });
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    append({ role: 'user', content: input });
    setInput('');
  };

  // Scroll anchoring
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const onCitationClick = (id: string) => {
    setOpen(false);
    router.push(`/bills?billId=${id}`);
  };

  const suggestions = [
    "Which bills are due this week?",
    "What is my largest pending approval?",
    "How much did we spend on software last month?"
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {open && (
        <div className="mb-4 flex h-[600px] w-[380px] max-h-[calc(100vh-120px)] flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl transition-all duration-300 animate-in slide-in-from-bottom-5">
          <div className="flex items-center justify-between border-b p-4">
            <div className="flex items-center gap-2 font-semibold">
              <Bot className="h-5 w-5 text-primary" />
              SpendFlow Copilot
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4" ref={scrollRef}>
            {messages.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center opacity-50">
                <Bot className="w-12 h-12 mb-4" />
                <p className="text-center text-sm">Ask me anything about your finances.</p>
              </div>
            )}

            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-2 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`p-3 text-sm rounded-xl ${m.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted/50 rounded-tl-sm border'}`}>
                    {m.role === 'assistant' ? parseCitations(m.content, onCitationClick) : m.content}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex justify-start">
                <div className="flex gap-2 max-w-[85%] flex-row">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-muted text-muted-foreground">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-3 text-sm rounded-xl bg-muted/50 rounded-tl-sm border">
                    <span className="animate-pulse">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="text-destructive text-center text-sm p-4 border border-destructive/20 bg-destructive/10 rounded-md flex items-center justify-between">
                <span>Failed to fetch response.</span>
                <Button variant="ghost" size="sm" onClick={() => regenerate()}><RefreshCw className="w-4 h-4 mr-2" /> Retry</Button>
              </div>
            )}
          </div>

          <div className="p-4 border-t bg-background">
            {messages.length === 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {suggestions.map((s, i) => (
                  <Button key={i} variant="outline" size="sm" onClick={() => append({ role: 'user', content: s })} className="text-xs text-left h-auto py-2">
                    {s}
                  </Button>
                ))}
              </div>
            )}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Copilot..."
                className="flex-1"
                disabled={isLoading}
              />
              {isLoading ? (
                <Button type="button" variant="destructive" size="icon" onClick={() => stop()}>
                  <Square className="w-4 h-4 fill-current" />
                </Button>
              ) : (
                <Button type="submit" size="icon" disabled={!input?.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              )}
            </form>
          </div>
        </div>
      )}

      <Button
        size="icon"
        className="h-14 w-14 rounded-full shadow-lg"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>
    </div>
  );
}
