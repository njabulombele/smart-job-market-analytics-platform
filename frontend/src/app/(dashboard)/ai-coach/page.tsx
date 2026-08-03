'use client';

import { useState, useRef, useEffect } from 'react';
import { aiApi } from '@/lib/api';
import { Send, Bot, User } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTED_QUESTIONS = [
  'What skills should a Java developer learn in 2024?',
  'How do I become a Cloud Engineer?',
  'What interview questions should I expect for a Spring Boot role?',
  'Which pays more: Java or Python development?',
];

export default function AiCoachPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm your AI Career Coach. Ask me anything about tech careers, skills to learn, interview prep, or salary insights." }
  ]);
  const [input, setInput] = useState('');
  const [sessionId] = useState(() => crypto.randomUUID());
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    setIsLoading(true);

    try {
      const { data } = await aiApi.chat({ message: text, sessionId });
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I ran into an issue. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-3xl mx-auto">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">AI Career Coach</h1>
        <p className="text-gray-500">Powered by RAG + LLM with real job market data</p>
      </div>

      {/* Chat window */}
      <div className="flex-1 bg-white rounded-xl shadow-sm overflow-y-auto p-6 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
              ${msg.role === 'assistant' ? 'bg-blue-100' : 'bg-gray-200'}`}>
              {msg.role === 'assistant' ? <Bot size={16} className="text-blue-600" /> : <User size={16} className="text-gray-600" />}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm
              ${msg.role === 'assistant' ? 'bg-gray-100 text-gray-800' : 'bg-blue-600 text-white'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Bot size={16} className="text-blue-600" />
            </div>
            <div className="bg-gray-100 rounded-2xl px-4 py-3">
              <span className="flex gap-1">
                {[0,1,2].map(i => (
                  <span key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.1}s` }} />
                ))}
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested questions */}
      {messages.length === 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map(q => (
            <button key={q} onClick={() => sendMessage(q)}
              className="text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-3 py-1.5 hover:bg-blue-100 transition">
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="mt-4 flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
          placeholder="Ask about careers, skills, salaries..."
          className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button onClick={() => sendMessage(input)} disabled={isLoading || !input.trim()}
          className="bg-blue-600 text-white rounded-xl px-4 py-3 hover:bg-blue-700 disabled:opacity-50 transition">
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
