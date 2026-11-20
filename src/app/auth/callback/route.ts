import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const ALLOWED_EMAIL = 'georgeyu810@gmail.com';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email?.toLowerCase() === ALLOWED_EMAIL) {
        return NextResponse.redirect(`${origin}/board`);
      }

      await supabase.auth.signOut();
      return NextResponse.redirect(`${origin}/board?error=unauthorized`);
    }
  }

  return NextResponse.redirect(`${origin}/board?error=auth_failed`);
}
