'use client';

import { useState, useRef, useEffect } from 'react';
import { aiApi } from '@/lib/api';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message { role: 'user' | 'assistant'; content: string; }

const SUGGESTIONS = [
  'What skills should a Java developer learn next?',
  'How do I transition to Cloud Engineering?',
  'What are top interview questions for Spring Boot?',
  'Which pays more: Java or Python?',
  'How do I negotiate a higher salary?',
  'What certifications boost a DevOps career?',
];

export default function AiCoachPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm your AI Career Coach 👋\n\nI can help you with career advice, skills to learn, interview prep, and salary insights — all backed by real market data. What would you like to explore?" }
  ]);
  const [input, setInput]     = useState('');
  const [sessionId]           = useState(() => crypto.randomUUID());
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef             = useRef<HTMLDivElement>(null);
  const inputRef              = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    setMessages(prev => [...prev, { role: 'user', content: trimmed }]);
    setInput('');
    setIsLoading(true);

    try {
      const { data } = await aiApi.chat({ message: trimmed, sessionId });
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply ?? data.message ?? 'No response.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I ran into an issue. Please try again in a moment.' }]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600
                        flex items-center justify-center shadow-md shadow-blue-600/25">
          <Sparkles size={18} className="text-white" />
        </div>
        <div className="page-header">
          <h1>AI Career Coach</h1>
          <p>Powered by RAG + LLM with real job market data</p>
        </div>
      </div>

      {/* Chat window */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-y-auto p-5 space-y-5">
        {messages.map((msg, i) => (
          <div key={i} className={cn('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : '')}>
            {/* Avatar */}
            <div className={cn(
              'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 self-end',
              msg.role === 'assistant'
                ? 'bg-gradient-to-br from-blue-600 to-indigo-600 shadow-sm shadow-blue-600/20'
                : 'bg-slate-200'
            )}>
              {msg.role === 'assistant'
                ? <Bot size={15} className="text-white" />
                : <User size={15} className="text-slate-600" />}
            </div>

            {/* Bubble */}
            <div className={cn(
              'max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap',
              msg.role === 'assistant'
                ? 'bg-slate-50 border border-slate-100 text-slate-800 rounded-bl-sm'
                : 'bg-blue-600 text-white rounded-br-sm shadow-sm shadow-blue-600/20'
            )}>
              {msg.content}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600
                            flex items-center justify-center flex-shrink-0">
              <Bot size={15} className="text-white" />
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-bl-sm px-4 py-3">
              <span className="flex gap-1 items-center">
                {[0, 1, 2].map(i => (
                  <span key={i} className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map(q => (
            <button key={q} onClick={() => sendMessage(q)}
              className="text-xs bg-slate-50 text-slate-600 border border-slate-200 rounded-xl
                         px-3 py-2 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition">
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div className="mt-3 flex gap-2 bg-white border border-slate-200 rounded-2xl p-2 shadow-sm
                      focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent
                      transition duration-150">
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
          placeholder="Ask about careers, skills, salaries, interviews…"
          className="flex-1 bg-transparent text-sm placeholder:text-slate-400 focus:outline-none px-2"
        />
        <button onClick={() => sendMessage(input)} disabled={isLoading || !input.trim()}
          className={cn(
            'w-9 h-9 rounded-xl flex items-center justify-center transition duration-150',
            input.trim() && !isLoading
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-600/30'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          )}>
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}
