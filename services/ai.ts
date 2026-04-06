import { supabase } from '../supabaseClient';

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

/**
 * Send a chat history to the Gemini proxy Edge Function and return the assistant reply.
 */
export async function askAI(messages: ChatMessage[]): Promise<string> {
  const { data, error } = await supabase.functions.invoke('gemini-proxy', {
    body: { messages },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data.text as string;
}
