# Edge Functions

## gemini-proxy

Proxy para a API do Google Gemini. Mantém a chave de API no servidor.

### Deploy

```bash
supabase functions deploy gemini-proxy
supabase secrets set GEMINI_API_KEY=sua_chave_aqui
```

### Uso

Chamado via `supabase.functions.invoke('gemini-proxy', { body: { messages } })`.
