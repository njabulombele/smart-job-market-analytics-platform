'use client';

import { useState, useRef, useEffect } from 'react';
import { aiApi } from '@/lib/api';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message { role: 'user' | 'assistant'; content: string; }

const SUGGESTIONS = [
  'What skills should a Java developer learn next?',
  'How do I transition to Cloud Engineering?',
  'Top interview questions for Spring Boot?',
  'Which pays more: Java or Python?',
  'How do I negotiate a higher salary?',
  'What certifications boost a DevOps career?',
];

const SUG_COLORS = [
  'bg-blue-50   border-blue-200   text-blue-700   hover:bg-blue-100',
  'bg-violet-50 border-violet-200 text-violet-700 hover:bg-violet-100',
  'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100',
  'bg-amber-50  border-amber-200  text-amber-700  hover:bg-amber-100',
  'bg-rose-50   border-rose-200   text-rose-700   hover:bg-rose-100',
  'bg-cyan-50   border-cyan-200   text-cyan-700   hover:bg-cyan-100',
];

export default function AiCoachPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm your AI Career Coach 👋\n\nI can help with career advice, skills to learn, interview prep, and salary insights — all backed by real market data. What would you like to explore?" }
  ]);
  const [input, setInput]         = useState('');
  const [sessionId]               = useState(() => crypto.randomUUID());
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef                 = useRef<HTMLDivElement>(null);
  const inputRef                  = useRef<HTMLInputElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

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
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I ran into an issue. Please try again.' }]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-3xl mx-auto">

      {/* ── Hero banner ── */}
      <div className="hero-rose rounded-2xl px-5 py-4 mb-4 border border-rose-200 shadow-sm
                      flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600
                        flex items-center justify-center flex-shrink-0 shadow-md shadow-rose-500/30">
          <Sparkles size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight
                         bg-gradient-to-r from-rose-600 to-pink-500 bg-clip-text text-transparent">
            AI Career Coach
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">Powered by RAG + LLM · real market data</p>
        </div>
      </div>

      {/* ── Chat window ── */}
      <div className="flex-1 bg-white rounded-2xl border border-indigo-100
                      shadow-[0_2px_16px_-4px_rgba(99,102,241,0.10)]
                      overflow-y-auto p-5 space-y-5">
        {messages.map((msg, i) => (
          <div key={i} className={cn('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : '')}>
            <div className={cn(
              'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 self-end',
              msg.role === 'assistant'
                ? 'bg-gradient-to-br from-pink-500 to-rose-500 shadow-sm shadow-rose-500/25'
                : 'bg-gradient-to-br from-indigo-500 to-blue-500 shadow-sm shadow-indigo-500/25'
            )}>
              {msg.role === 'assistant'
                ? <Bot size={14} className="text-white" />
                : <User size={14} className="text-white" />}
            </div>
            <div className={cn(
              'max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap',
              msg.role === 'assistant'
                ? 'bg-gradient-to-br from-slate-50 to-indigo-50/50 border border-indigo-100 text-slate-800 rounded-bl-sm'
                : 'bg-gradient-to-br from-indigo-600 to-blue-600 text-white rounded-br-sm shadow-md shadow-indigo-500/20'
            )}>
              {msg.content}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
              <Bot size={14} className="text-white" />
            </div>
            <div className="bg-gradient-to-br from-slate-50 to-indigo-50/50 border border-indigo-100 rounded-2xl rounded-bl-sm px-4 py-3">
              <span className="flex gap-1 items-center">
                {[0, 1, 2].map(i => (
                  <span key={i} className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Suggestions ── */}
      {messages.length <= 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((q, i) => (
            <button key={q} onClick={() => sendMessage(q)}
              className={cn(
                'text-xs border rounded-xl px-3 py-2 font-semibold transition',
                SUG_COLORS[i % SUG_COLORS.length]
              )}>
              {q}
            </button>
          ))}
        </div>
      )}

      {/* ── Input ── */}
      <div className="mt-3 flex gap-2 bg-white border border-indigo-200 rounded-2xl p-2
                      shadow-sm shadow-indigo-100
                      focus-within:ring-2 focus-within:ring-indigo-400 focus-within:border-transparent
                      transition duration-150">
        <input ref={inputRef} value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
          placeholder="Ask about careers, skills, salaries, interviews…"
          className="flex-1 bg-transparent text-sm placeholder:text-slate-400 text-slate-700
                     focus:outline-none px-2" />
        <button onClick={() => sendMessage(input)} disabled={isLoading || !input.trim()}
          className={cn(
            'w-9 h-9 rounded-xl flex items-center justify-center transition duration-150',
            input.trim() && !isLoading
              ? 'bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-500/30 hover:scale-105'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          )}>
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}
