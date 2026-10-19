'use client';

import { useState, useRef, useEffect } from 'react';
import { aiApi } from '@/lib/api';
import { Send, Bot, User, Sparkles } from 'lucide-react';

interface Msg { role:'user'|'assistant'; content:string; }

const SUGGESTIONS = [
  'What skills should a Java developer learn next?',
  'How do I transition to Cloud Engineering?',
  'Top interview questions for Spring Boot?',
  'Which pays more in SA: Java or Python?',
  'How do I negotiate a higher salary in Rands?',
  'What certifications boost a DevOps career?',
];

export default function AiCoachPage() {
  const [messages, setMessages] = useState<Msg[]>([{
    role:'assistant',
    content:"Hi! I'm your AI Career Coach 👋\n\nI can help with career advice, skills to learn, interview prep, and salary insights in Rands (ZAR) — all backed by real South African market data.\n\nWhat would you like to explore?"
  }]);
  const [input,     setInput]     = useState('');
  const [sessionId]               = useState(() => crypto.randomUUID());
  const [loading,   setLoading]   = useState(false);
  const bottomRef                 = useRef<HTMLDivElement>(null);
  const inputRef                  = useRef<HTMLInputElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

  const send = async (text: string) => {
    const t = text.trim();
    if (!t || loading) return;
    setMessages(p => [...p, { role:'user', content:t }]);
    setInput(''); setLoading(true);
    try {
      const { data } = await aiApi.chat({ message:t, sessionId });
      setMessages(p => [...p, { role:'assistant', content: data.reply ?? data.message ?? 'No response.' }]);
    } catch {
      setMessages(p => [...p, { role:'assistant', content:'Sorry, something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'calc(100vh - 104px)', maxWidth:740, margin:'0 auto' }}>

      {/* Header */}
      <div className="page-hero" style={{ marginBottom:12 }}>
        <div className="flex items-center gap-3">
          <div style={{ width:40, height:40, borderRadius:8, background:'#DC2626',
                        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <Sparkles size={18} color="#fff" />
          </div>
          <div>
            <h1 className="page-hero-title">AI Career Coach</h1>
            <p className="page-hero-sub">Powered by RAG + LLM · real market data</p>
          </div>
        </div>
      </div>

      {/* Chat window */}
      <div className="card" style={{ flex:1, overflowY:'auto', padding:20, display:'flex', flexDirection:'column', gap:16 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display:'flex', gap:10, flexDirection: m.role==='user' ? 'row-reverse' : 'row' }}>
            <div style={{
              width:32, height:32, borderRadius:m.role==='assistant'?8:'50%',
              background: m.role==='assistant' ? '#FEF2F2' : '#E8F5EE',
              border: `1px solid ${m.role==='assistant'?'#FECACA':'#A8D8BC'}`,
              display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, alignSelf:'flex-end',
            }}>
              {m.role==='assistant'
                ? <Bot size={15} color="#DC2626" />
                : <User size={15} color="#1A7A3C" />}
            </div>
            <div className={m.role==='assistant' ? 'bubble-bot' : 'bubble-user'}
                 style={{ whiteSpace:'pre-wrap' }}>
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display:'flex', gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:8, background:'#FEF2F2', border:'1px solid #FECACA',
                          display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <Bot size={15} color="#DC2626" />
            </div>
            <div className="bubble-bot" style={{ display:'flex', alignItems:'center', gap:4 }}>
              {[0,1,2].map(i => (
                <span key={i} style={{
                  width:7, height:7, borderRadius:'50%', background:'#9CA3AF',
                  animation:`bounce-dot 1.2s ${i*.2}s infinite`,
                  display:'inline-block',
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions (first message only) */}
      {messages.length <= 1 && (
        <div style={{ padding:'10px 0', display:'flex', flexWrap:'wrap', gap:8 }}>
          {SUGGESTIONS.map(q => (
            <button key={q} onClick={() => send(q)}
              className="btn btn-ghost btn-sm"
              style={{ borderRadius:16, border:'1px solid #E5E7EB', background:'#fff',
                       fontSize:12, color:'#374151', padding:'6px 14px' }}>
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div className="card" style={{ padding:'8px 8px 8px 16px', display:'flex', alignItems:'center', gap:8, marginTop:8 }}>
        <input
          ref={inputRef} value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key==='Enter' && !e.shiftKey && send(input)}
          placeholder="Ask about careers, skills, salaries, interviews…"
          style={{ flex:1, border:'none', outline:'none', fontSize:14, color:'#111827', background:'transparent' }}
        />
        <button onClick={() => send(input)} disabled={loading||!input.trim()}
          className="btn btn-primary btn-sm"
          style={{ borderRadius:8, padding:'8px 14px' }}>
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
