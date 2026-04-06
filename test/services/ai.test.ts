import { describe, it, expect, vi, beforeEach } from 'vitest';
import { askAI } from '../../services/ai';
import type { ChatMessage } from '../../services/ai';

const mockInvoke = vi.hoisted(() => vi.fn());

vi.mock('../../supabaseClient', () => ({
  supabase: {
    functions: {
      invoke: mockInvoke,
    },
  },
}));

const messages: ChatMessage[] = [
  { role: 'user', text: 'Analise nossa orquestra.' },
];

describe('askAI', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns text from Edge Function response', async () => {
    mockInvoke.mockResolvedValueOnce({ data: { text: 'Resposta da IA.' }, error: null });
    const result = await askAI(messages);
    expect(result).toBe('Resposta da IA.');
    expect(mockInvoke).toHaveBeenCalledWith('gemini-proxy', { body: { messages } });
  });

  it('throws when supabase returns an invocation error', async () => {
    mockInvoke.mockResolvedValueOnce({ data: null, error: new Error('Network error') });
    await expect(askAI(messages)).rejects.toThrow('Network error');
  });

  it('throws when Edge Function returns error field in data', async () => {
    mockInvoke.mockResolvedValueOnce({
      data: { error: 'GEMINI_API_KEY not set' },
      error: null,
    });
    await expect(askAI(messages)).rejects.toThrow('GEMINI_API_KEY not set');
  });

  it('passes the full message history to Edge Function', async () => {
    mockInvoke.mockResolvedValueOnce({ data: { text: 'OK' }, error: null });
    const history: ChatMessage[] = [
      { role: 'user', text: 'Pergunta 1' },
      { role: 'assistant', text: 'Resposta 1' },
      { role: 'user', text: 'Pergunta 2' },
    ];
    await askAI(history);
    expect(mockInvoke).toHaveBeenCalledWith('gemini-proxy', { body: { messages: history } });
  });
});
