import React, { useState } from 'react';
import { X, Share2, Copy, CheckCheck, MessageCircle, RefreshCw, Trash2 } from 'lucide-react';
import { generateShareToken, revokeShareToken } from '../../services/statistics';

interface ShareStatModalProps {
  statId: string;
  statLabel: string;
  existingToken?: string | null;
  onClose: () => void;
  onTokenChange: (statId: string, newToken: string | null) => void;
}

export function ShareStatModal({
  statId,
  statLabel,
  existingToken,
  onClose,
  onTokenChange,
}: ShareStatModalProps) {
  const [token, setToken] = useState<string | null>(existingToken ?? null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = token
    ? `${window.location.origin}${window.location.pathname}?stat_share=${token}`
    : null;

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const newToken = await generateShareToken(statId);
      setToken(newToken);
      onTokenChange(statId, newToken);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async () => {
    if (!confirm('Deseja desativar o link de compartilhamento? Quem tiver o link não conseguirá mais acessar.')) return;
    setLoading(true);
    try {
      await revokeShareToken(statId);
      setToken(null);
      onTokenChange(statId, null);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsApp = () => {
    if (!shareUrl) return;
    const text = encodeURIComponent(
      `Confira os dados do ensaio — *${statLabel}*:\n${shareUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <Share2 size={20} className="text-indigo-600" /> Compartilhar
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[280px]">{statLabel}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        {/* Link area */}
        {shareUrl ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Qualquer pessoa com este link poderá visualizar os dados e salvar uma cópia no painel delas.
            </p>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-3">
              <p className="text-xs text-slate-500 truncate flex-1 font-mono">{shareUrl}</p>
              <button
                onClick={handleCopy}
                className="flex-shrink-0 text-indigo-600 hover:text-indigo-800 transition-colors"
                title="Copiar link"
              >
                {copied ? <CheckCheck size={18} className="text-green-500" /> : <Copy size={18} />}
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleWhatsApp}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle size={18} /> WhatsApp
              </button>
              <button
                onClick={handleCopy}
                className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition-colors"
              >
                {copied ? <CheckCheck size={18} /> : <Copy size={18} />}
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
                title="Gerar novo link (invalida o anterior)"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Gerar novo link
              </button>
              <span className="text-slate-200">|</span>
              <button
                onClick={handleRevoke}
                disabled={loading}
                className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 transition-colors"
              >
                <Trash2 size={14} /> Desativar link
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Gere um link de compartilhamento para enviar via WhatsApp. Quem receber poderá visualizar e salvar uma cópia no painel deles.
            </p>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Share2 size={18} />
              )}
              Gerar link de compartilhamento
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
