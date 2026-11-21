'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Lock, LogOut, Sparkles, AlertTriangle, ArrowLeft } from 'lucide-react';

interface BoardAuthGateProps {
  mode: 'login' | 'unauthorized';
  currentEmail?: string | null;
  errorParam?: string;
}

export default function BoardAuthGate({ mode, currentEmail, errorParam }: BoardAuthGateProps) {
  const [loading, setLoading] = useState(false);
  const [supabase] = useState(() => createClient());

  const handleGoogleLogin = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          prompt: 'select_account',
        },
      },
    });
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
              <span className="font-semibold text-amber-300">georgeyu810@gmail.com</span> can access
              the responding board.
            </p>
            <button
              onClick={handleSignOut}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-black bg-gradient-to-r from-[#F5D061] to-[#D4AF37] hover:brightness-110 transition flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out &amp; Switch Google Account
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-zinc-400 mb-6">
              Restricted to <span className="text-amber-300 font-medium">georgeyu810@gmail.com</span>.
              Sign in with Google to view and answer requests.
            </p>

            {errorParam === 'auth_failed' && (
              <p className="text-xs text-red-400 mb-4">Authentication failed. Please try again.</p>
            )}

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-black bg-gradient-to-r from-[#F5D061] to-[#D4AF37] hover:brightness-110 disabled:opacity-50 transition flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.25)]"
            >
              <Sparkles className="w-4 h-4" />
              {loading ? 'Redirecting to Google...' : 'Sign in with Google'}
            </button>
          </>
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
