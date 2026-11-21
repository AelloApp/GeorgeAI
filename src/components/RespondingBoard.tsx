'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { AIRequest } from '@/types/request';
import {
  Sparkles,
  LogOut,
  Send,
  Trash2,
  Clock,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

interface RespondingBoardProps {
  initialRequests: AIRequest[];
  userEmail: string;
}

export default function RespondingBoard({ initialRequests, userEmail }: RespondingBoardProps) {
  const [supabase] = useState(() => createClient());
  const [requests, setRequests] = useState<AIRequest[]>(initialRequests);
  const [filter, setFilter] = useState<'all' | 'pending' | 'answered'>('all');
  const [drafts, setDrafts] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const r of initialRequests) {
      if (r.answer) map[r.id] = r.answer;
    }
    return map;
  });
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    const channel = supabase
      .channel('georgeai-board-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'requests' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newReq = payload.new as AIRequest;
            setRequests((prev) => {
              if (prev.some((r) => r.id === newReq.id)) return prev;
              return [newReq, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as AIRequest;
            setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old.id as string;
            setRequests((prev) => prev.filter((r) => r.id !== deletedId));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const handleAnswer = async (id: string) => {
    const text = (drafts[id] || '').trim();
    if (!text) return;

    setSavingId(id);
    const { data, error } = await supabase
      .from('requests')
      .update({
        answer: text,
        status: 'answered',
        answered_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      setRequests((prev) => prev.map((r) => (r.id === id ? (data as AIRequest) : r)));
    }
    setSavingId(null);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('requests').delete().eq('id', id);
    if (!error) {
      setRequests((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/board';
  };

  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const filtered = requests.filter((r) => (filter === 'all' ? true : r.status === filter));

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100">
      <header className="sticky top-0 z-20 border-b border-amber-500/20 bg-[#050505]/95 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F5D061] to-[#9E7B1C] flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.25)]">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-[#F5D061] to-[#D4AF37] bg-clip-text text-transparent">
                GeorgeAI Responding Board
              </h1>
              <p className="text-xs text-zinc-400">Signed in as {userEmail}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-zinc-800 hover:border-amber-500/40 text-zinc-300 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Public Site
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-amber-500/30 text-amber-300 hover:bg-amber-500/10 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            {(['all', 'pending', 'answered'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition ${
                  filter === tab
                    ? 'bg-gradient-to-r from-[#F5D061] to-[#D4AF37] text-black'
                    : 'bg-[#0e0e10] border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {tab}
                {tab === 'pending' && ` (${pendingCount})`}
              </button>
            ))}
          </div>

          <span className="text-xs text-zinc-500">
            Live sync active • {requests.length} total request{requests.length === 1 ? '' : 's'}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-amber-500/20 bg-[#0b0b0c] p-12 text-center text-zinc-500 text-sm">
            No {filter === 'all' ? '' : filter} requests right now.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((req) => (
              <div
                key={req.id}
                className={`rounded-2xl border p-5 transition ${
                  req.status === 'pending'
                    ? 'border-amber-500/40 bg-[#0e0c08] shadow-[0_0_25px_rgba(212,175,55,0.08)]'
                    : 'border-zinc-800 bg-[#0b0b0c]'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-xs font-semibold text-amber-300">
                      {req.sender_name || 'Guest'}
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      {new Date(req.created_at).toLocaleString()}
                    </span>
                    {req.status === 'pending' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/15 text-[#F5D061] border border-amber-500/30">
                        <Clock className="w-3 h-3" /> Pending
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                        <CheckCircle2 className="w-3 h-3" /> Answered
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(req.id)}
                    title="Delete request"
                    className="text-zinc-500 hover:text-red-400 transition p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-sm text-zinc-100 whitespace-pre-wrap bg-[#060607] border border-zinc-800/80 rounded-xl p-3.5 mb-4">
                  {req.prompt}
                </p>

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <textarea
                    rows={2}
                    value={drafts[req.id] ?? ''}
                    onChange={(e) => setDrafts((prev) => ({ ...prev, [req.id]: e.target.value }))}
                    placeholder="Write your GeorgeAI response..."
                    className="flex-1 rounded-xl bg-[#070708] border border-amber-500/25 focus:border-[#F5D061] focus:outline-none px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 resize-y"
                  />
                  <button
                    onClick={() => handleAnswer(req.id)}
                    disabled={savingId === req.id || !(drafts[req.id] || '').trim()}
                    className="sm:self-end px-5 py-2.5 rounded-xl font-semibold text-xs text-black bg-gradient-to-r from-[#F5D061] to-[#D4AF37] hover:brightness-110 disabled:opacity-40 transition flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {savingId === req.id
                      ? 'Saving...'
                      : req.status === 'answered'
                      ? 'Update Answer'
                      : 'Send Answer'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
