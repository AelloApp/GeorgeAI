'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Lock, LogOut, Sparkles, AlertTriangle, ArrowLeft, Eye, EyeOff } from 'lucide-react';

interface BoardAuthGateProps {
  mode: 'login' | 'unauthorized';
  currentEmail?: string | null;
  errorParam?: string;
}

const ADMIN_EMAIL = 'georgeyu810@gmail.com';

export default function BoardAuthGate({ mode, currentEmail, errorParam }: BoardAuthGateProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supabase] = useState(() => createClient());

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || loading) return;

    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    window.location.href = '/board';
  };

  const handleSignOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    window.location.href = '/board';
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-amber-500/30 bg-[#0b0b0c] p-8 shadow-[0_0_50px_rgba(212,175,55,0.1)] text-center">
        <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-[#F5D061] to-[#9E7B1C] flex items-center justify-center shadow-[0_0_25px_rgba(212,175,55,0.3)]">
          {mode === 'unauthorized' ? (
            <AlertTriangle className="w-7 h-7 text-black" />
          ) : (
            <Lock className="w-7 h-7 text-black" />
          )}
        </div>

        <h1 className="text-2xl font-bold bg-gradient-to-r from-[#F5D061] to-[#D4AF37] bg-clip-text text-transparent mb-2">
          GeorgeAI Responding Board
        </h1>

        {mode === 'unauthorized' || errorParam === 'unauthorized' ? (
          <>
            <p className="text-sm text-red-400 mb-6">
              Access denied{currentEmail ? ` (${currentEmail})` : ''}. Only{' '}
              <span className="font-semibold text-amber-300">{ADMIN_EMAIL}</span> can access the
              responding board.
            </p>
            <button
              onClick={handleSignOut}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-black bg-gradient-to-r from-[#F5D061] to-[#D4AF37] hover:brightness-110 transition flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </>
        ) : (
          <form onSubmit={handleLogin} className="flex flex-col gap-4 text-left mt-4">
            <p className="text-sm text-zinc-400 text-center">
              Restricted to <span className="text-amber-300 font-medium">{ADMIN_EMAIL}</span>.
            </p>

            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Admin Email</label>
              <input
                type="email"
                value={ADMIN_EMAIL}
                readOnly
                className="w-full rounded-xl bg-[#070708] border border-zinc-800 px-3.5 py-2.5 text-sm text-amber-200/90 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoFocus
                  className="w-full rounded-xl bg-[#0e0e10] border border-amber-500/30 focus:border-[#F5D061] focus:outline-none px-3.5 py-2.5 pr-10 text-sm text-zinc-100 placeholder:text-zinc-600 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-amber-300 transition"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && <p className="text-xs text-red-400 text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-black bg-gradient-to-r from-[#F5D061] to-[#D4AF37] hover:brightness-110 disabled:opacity-50 transition flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.25)]"
            >
              <Sparkles className="w-4 h-4" />
              {loading ? 'Signing in...' : 'Sign In to Board'}
            </button>
          </form>
        )}

        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-amber-300 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to GeorgeAI Public Chat
        </Link>
      </div>
    </div>
  );
}
