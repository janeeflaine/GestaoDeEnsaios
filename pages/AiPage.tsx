import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot, User, AlertCircle, RefreshCw } from 'lucide-react';
import { ChatMessage, askAI } from '../services/ai';
import type { UserProfile } from '../types';

interface AiPageProps {
  userProfile: UserProfile | null;
  statsSummary?: string | null;
}

const QUICK_PROMPTS = [
  { label: 'Analisar Orquestra', text: 'Analise a formação orquestral com base nos dados fornecidos e dê sugestões de melhoria.' },
  { label: 'Dicas de Ensaio', text: 'Quais são as melhores práticas para conduzir um ensaio produtivo de orquestra na CCB?' },
  { label: 'Repertório CCB', text: 'Fale sobre o repertório musical da Congregação Cristã no Brasil e como escolher hinos para os ensaios.' },
  { label: 'Formação Ideal', text: 'Explique a importância dos percentuais ideais de formação orquestral (Cordas 50%, Madeiras 25%, Metais 25%).' },
];

export function AiPage({ userProfile, statsSummary }: AiPageProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // userProfile used for future personalization; suppress unused warning
  void userProfile;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    setError(null);

    // Prepend stats context to first user message if available
    const isFirstMessage = messages.length === 0;
    const fullText = isFirstMessage && statsSummary
      ? `Contexto da orquestra:\n${statsSummary}\n\n${text}`
      : text;

    const userMsg: ChatMessage = { role: 'user', text: fullText };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const reply = await askAI(newMessages);
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao conectar com a IA.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-3xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-200">
            <Sparkles size={22} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Assistente IA</h2>
            <p className="text-xs text-slate-400 font-medium">Powered by Google Gemini</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={clearChat} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors">
            <RefreshCw size={13} /> Nova conversa
          </button>
        )}
      </div>

      {/* Quick Prompts — only when chat is empty */}
      {messages.length === 0 && (
        <div className="mb-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Sugestões</p>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_PROMPTS.map(qp => (
              <button
                key={qp.label}
                onClick={() => sendMessage(qp.text)}
                className="text-left bg-white border border-slate-100 rounded-2xl p-3 hover:bg-indigo-50 hover:border-indigo-200 transition-all shadow-sm group"
              >
                <p className="text-xs font-black text-slate-700 group-hover:text-indigo-700">{qp.label}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2 group-hover:text-indigo-400">{qp.text}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-0">
        {messages.map((msg, i) => {
          // When showing user message, strip context preamble for display
          const displayText = msg.role === 'user' && i === 0 && statsSummary && msg.text.startsWith('Contexto da orquestra:')
            ? msg.text.slice(msg.text.indexOf('\n\n') + 2)
            : msg.text;

          return (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`shrink-0 p-2 rounded-xl ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-slate-100'}`}>
                {msg.role === 'user'
                  ? <User size={16} className="text-white" />
                  : <Bot size={16} className="text-slate-600" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-sm'
                  : 'bg-white border border-slate-100 text-slate-700 rounded-tl-sm shadow-sm'
              }`}>
                {displayText}
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex gap-3">
            <div className="shrink-0 p-2 rounded-xl bg-slate-100">
              <Bot size={16} className="text-slate-600" />
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1.5 items-center h-4">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 rounded-2xl px-4 py-3 text-sm">
            <AlertCircle size={16} />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="mt-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all">
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite sua pergunta... (Enter para enviar)"
          rows={2}
          className="w-full px-4 pt-3 pb-1 text-sm text-slate-700 placeholder-slate-400 bg-transparent outline-none resize-none"
        />
        <div className="flex justify-end px-3 pb-2">
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
