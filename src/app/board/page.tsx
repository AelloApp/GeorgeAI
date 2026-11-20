import { createClient } from '@/lib/supabase/server';
import BoardAuthGate from '@/components/BoardAuthGate';
import RespondingBoard from '@/components/RespondingBoard';
import type { AIRequest } from '@/types/request';

export const dynamic = 'force-dynamic';

const ALLOWED_EMAIL = 'georgeyu810@gmail.com';

export default async function BoardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <BoardAuthGate mode="login" errorParam={params.error} />;
  }

  if (user.email?.toLowerCase() !== ALLOWED_EMAIL) {
    return (
      <BoardAuthGate
        mode="unauthorized"
        currentEmail={user.email}
        errorParam={params.error}
      />
    );
  }

  const { data: requests } = await supabase
    .from('requests')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <RespondingBoard
      initialRequests={(requests as AIRequest[]) || []}
      userEmail={user.email}
    />
  );
}
