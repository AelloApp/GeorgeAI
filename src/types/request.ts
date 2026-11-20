export interface AIRequest {
  id: string;
  session_id: string;
  sender_name: string | null;
  prompt: string;
  answer: string | null;
  status: 'pending' | 'answered';
  created_at: string;
  answered_at: string | null;
}
