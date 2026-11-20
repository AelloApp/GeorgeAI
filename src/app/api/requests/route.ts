import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('sessionId');
  if (!sessionId || sessionId.length < 8) {
    return NextResponse.json({ error: 'Invalid sessionId' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('requests')
    .select('id, session_id, sender_name, prompt, answer, status, created_at, answered_at')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ requests: data });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
    const sessionId = typeof body.sessionId === 'string' ? body.sessionId.trim() : '';
    const senderName =
      typeof body.senderName === 'string' && body.senderName.trim()
        ? body.senderName.trim().slice(0, 50)
        : 'Guest';

    if (!prompt || prompt.length > 3000) {
      return NextResponse.json(
        { error: 'Prompt must be between 1 and 3000 characters.' },
        { status: 400 }
      );
    }

    if (!sessionId || sessionId.length < 8) {
      return NextResponse.json({ error: 'Invalid sessionId' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('requests')
      .insert({
        session_id: sessionId,
        sender_name: senderName,
        prompt,
        status: 'pending',
      })
      .select('id, session_id, sender_name, prompt, answer, status, created_at, answered_at')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ request: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
