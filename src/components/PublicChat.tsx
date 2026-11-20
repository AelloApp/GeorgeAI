'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Send, Sparkles, Clock, CheckCircle2, Shield } from 'lucide-react';
import type { AIRequest } from '@/types/request';

export default function PublicChat() {
  const [sessionId, setSessionId] = useState('');
  const [senderName, setSenderName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<AIRequest[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let id = localStorage.getItem('georgeai_session_id');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('georgeai_session_id', id);
    }
    setSessionId(id);

    const savedName = localStorage.getItem('georgeai_sender_name');
    if (savedName) setSenderName(savedName);
  }, []);

  const fetchMessages = async (sid: string) => {
    try {
      const res = await fetch(`/api/requests?sessionId=${encodeURIComponent(sid)}`);
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.requests)) {
        setMessages(data.requests);
      }
    } catch {
      // retry on next interval
    }
  };

  useEffect(() => {
    if (!sessionId) return;
    fetchMessages(sessionId);

    const interval = setInterval(() => {
      fetchMessages(sessionId);
    }, 3000);

    return () => clearInterval(interval);
  }, [sessionId]);

  const answersKey = messages.map((m) => m.answer ?? '').join('|');

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, answersKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !sessionId || sending) return;

    setSending(true);
    setError(null);

    if (senderName.trim()) {
      localStorage.setItem('georgeai_sender_name', senderName.trim());
    }

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          sessionId,
          senderName: senderName.trim() || 'Guest',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to send request.');
      } else {
        setMessages((prev) => [...prev, data.request]);
        setPrompt('');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex flex-col">
      <header className="sticky top-0 z-20 border-b border-amber-500/20 bg-[#050505]/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F5D061] via-[#D4AF37] to-[#8C6D1F] flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.3)]">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-[#F5D061] via-[#D4AF37] to-amber-200 bg-clip-text text-transparent">
                GeorgeAI
              </h1>
              <p className="text-xs text-zinc-400">Human-powered intelligence • Live responses</p>
            </div>
          </div>

          <Link
            href="/board"
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-amber-500/30 text-amber-300 hover:bg-amber-500/10 transition"
          >
            <Shield className="w-3.5 h-3.5" />
            Responding Board
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 flex flex-col gap-6">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
            <div className="w-16 h-16 rounded-2xl border border-amber-500/30 bg-amber-500/5 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(212,175,55,0.12)]">
              <Sparkles className="w-8 h-8 text-[#D4AF37]" />
            </div>
            <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-white via-amber-100 to-[#D4AF37] bg-clip-text text-transparent">
              Ask GeorgeAI Anything
            </h2>
            <p className="text-zinc-400 max-w-md text-sm leading-relaxed">
              No login required. Send your request below—every message goes directly to the
              GeorgeAI responding board, and your answer will appear right here.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {messages.map((item) => (
              <div key={item.id} className="flex flex-col gap-3">
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-[#141416] border border-zinc-800 px-4 py-3 text-sm text-zinc-100">
                    <div className="text-[11px] uppercase tracking-wider text-zinc-500 mb-1">
                      {item.sender_name || 'You'}
                    </div>
                    <p className="whitespace-pre-wrap leading-relaxed">{item.prompt}</p>
                  </div>
                </div>

                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-gradient-to-b from-[#12100a] to-[#0b0a07] border border-amber-500/30 px-4 py-3.5 text-sm shadow-[0_0_25px_rgba(212,175,55,0.06)]">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-semibold text-[#F5D061]">GeorgeAI</span>
                      {item.status === 'pending' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-400/80 animate-pulse">
                          <Clock className="w-3 h-3" />
                          Awaiting George&apos;s response...
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400/90">
                          <CheckCircle2 className="w-3 h-3" />
                          Answered
                        </span>
                      )}
                    </div>

                    {item.status === 'answered' && item.answer ? (
                      <p className="whitespace-pre-wrap text-zinc-100 leading-relaxed">
                        {item.answer}
                      </p>
                    ) : (
                      <div className="flex items-center gap-1.5 py-1">
                        <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-bounce" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </main>

      <footer className="sticky bottom-0 border-t border-amber-500/20 bg-[#050505]/95 backdrop-blur-md">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-4 py-4 flex flex-col gap-2.5">
          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="Your name (optional)"
              maxLength={50}
              className="sm:w-44 rounded-xl bg-[#0e0e10] border border-zinc-800 focus:border-[#D4AF37] focus:outline-none px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 transition"
            />
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask GeorgeAI anything..."
                maxLength={3000}
                required
                className="flex-1 rounded-xl bg-[#0e0e10] border border-amber-500/30 focus:border-[#F5D061] focus:outline-none px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 transition"
              />
              <button
                type="submit"
                disabled={sending || !prompt.trim()}
                className="px-5 py-2.5 rounded-xl font-semibold text-sm text-black bg-gradient-to-r from-[#F5D061] to-[#D4AF37] hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.25)]"
              >
                <Send className="w-4 h-4" />
                {sending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </form>
      </footer>
    </div>
  );
}
