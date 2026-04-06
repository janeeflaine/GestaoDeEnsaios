import React, { useState } from 'react';
import { ArrowLeft, FileText, Eye, Copy, CheckCheck, LogIn, UserPlus } from 'lucide-react';
import { EventStatistic, Congregation, STAT_INSTRUMENTS, MINISTRY_FIELDS } from '../types';
import { calcFamilyTotals, calcMinistryTotals } from '../utils/orchestraCalculations';
import { generateStatisticsPDF, getStatisticsPdfDataUrl } from '../utils/pdfReport';
import { saveStatCopy } from '../services/statistics';
import PdfPreviewModal from '../components/modals/PdfPreviewModal';

interface SharedStatPageProps {
  stat: EventStatistic;
  congregations: Congregation[];
  isGuest: boolean;
  isAuthenticated: boolean;
  userId?: string;
  onBack: () => void;
  onSavedCopy: () => void;
  onGoToProfile: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

export function SharedStatPage({
  stat,
  congregations,
  isGuest,
  isAuthenticated,
  userId,
  onBack,
  onSavedCopy,
  onGoToProfile,
  showToast,
}: SharedStatPageProps) {
  const [savingCopy, setSavingCopy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const congregation = congregations.find((c) => c.id === stat.congregation_id);
  const ft = calcFamilyTotals(stat);
  const mt = calcMinistryTotals(stat);
  const dateLabel = new Date(stat.event_date + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  const handleSaveCopy = async () => {
    if (!userId) return;
    setSavingCopy(true);
    try {
      await saveStatCopy(stat, userId);
      showToast('Cópia salva no seu painel!', 'success');
      onSavedCopy();
    } catch (err) {
      showToast('Erro ao salvar cópia: ' + (err instanceof Error ? err.message : String(err)), 'error');
    } finally {
      setSavingCopy(false);
    }
  };

  const handleDownloadPDF = () => {
    generateStatisticsPDF(stat, congregation, undefined);
  };

  const handlePreviewPDF = async () => {
    setIsExporting(true);
    const url = await getStatisticsPdfDataUrl(stat, congregation, undefined);
    setPreviewDataUrl(url);
    setIsExporting(false);
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const families = [
    { label: 'Cordas', value: ft.cordas, color: 'bg-yellow-400', pct: ft.total ? Math.round((ft.cordas / ft.total) * 100) : 0, ideal: 50, textColor: 'text-yellow-600' },
    { label: 'Madeiras', value: ft.madeiras, color: 'bg-blue-400', pct: ft.total ? Math.round((ft.madeiras / ft.total) * 100) : 0, ideal: 25, textColor: 'text-blue-600' },
    { label: 'Metais', value: ft.metais, color: 'bg-green-400', pct: ft.total ? Math.round((ft.metais / ft.total) * 100) : 0, ideal: 25, textColor: 'text-green-600' },
    { label: 'Acordeon', value: ft.acordeon, color: 'bg-slate-400', pct: ft.total ? Math.round((ft.acordeon / ft.total) * 100) : 0, ideal: null, textColor: 'text-slate-600' },
  ];

  return (
    <div className="px-4 py-6 max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm font-semibold transition-colors">
        <ArrowLeft size={16} /> Voltar
      </button>

      {/* Header card */}
      <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/40 border border-slate-100 space-y-1">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-widest text-indigo-400 font-black mb-1">Estatística Compartilhada</p>
            <h2 className="text-xl font-black text-slate-800">{congregation?.name ?? 'Congregação'}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{dateLabel}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={handlePreviewPDF} disabled={isExporting} title="Pré-visualizar PDF"
              className="bg-purple-50 text-purple-600 p-2.5 rounded-xl hover:bg-purple-100 transition-all disabled:opacity-60">
              {isExporting
                ? <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                : <Eye size={18} />}
            </button>
            <button onClick={handleDownloadPDF} title="Baixar PDF"
              className="bg-indigo-50 text-indigo-600 p-2.5 rounded-xl hover:bg-indigo-100 transition-all">
              <FileText size={18} />
            </button>
            <button onClick={handleCopyLink} title="Copiar link"
              className="bg-slate-50 text-slate-600 p-2.5 rounded-xl hover:bg-slate-100 transition-all">
              {copied ? <CheckCheck size={18} className="text-green-500" /> : <Copy size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* CTA: save copy */}
      {isAuthenticated && userId ? (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm font-bold text-indigo-800">Quer guardar estes dados?</p>
            <p className="text-xs text-indigo-600 mt-0.5">Salve uma cópia no seu painel — não afeta os dados de quem compartilhou.</p>
          </div>
          <button onClick={handleSaveCopy} disabled={savingCopy}
            className="bg-indigo-600 text-white font-bold px-5 py-2.5 rounded-2xl flex items-center gap-2 hover:bg-indigo-700 transition-colors disabled:opacity-60 whitespace-nowrap">
            {savingCopy
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Copy size={16} />}
            Salvar cópia
          </button>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm font-bold text-amber-800">Crie um perfil para salvar</p>
            <p className="text-xs text-amber-700 mt-0.5">Visitantes não podem salvar cópias. Crie uma conta gratuita.</p>
          </div>
          <button onClick={onGoToProfile}
            className="bg-amber-500 text-white font-bold px-5 py-2.5 rounded-2xl flex items-center gap-2 hover:bg-amber-600 transition-colors whitespace-nowrap">
            <UserPlus size={16} /> Criar perfil
          </button>
        </div>
      )}

      {/* Family summary */}
      <div className="bg-white rounded-3xl p-5 shadow-xl shadow-slate-200/40 border border-slate-100 space-y-4">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Formação Orquestral</h3>
        <div className="grid grid-cols-2 gap-3">
          {families.map((f) => (
            <div key={f.label} className="bg-slate-50 rounded-2xl p-4">
              <p className={`text-xs font-black uppercase tracking-wider mb-1 ${f.textColor}`}>{f.label}</p>
              <p className="text-2xl font-black text-slate-800">{f.value}</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 bg-slate-200 rounded-full h-1.5">
                  <div className={`${f.color} h-1.5 rounded-full`} style={{ width: `${Math.min(f.pct, 100)}%` }} />
                </div>
                <span className={`text-xs font-bold ${f.textColor}`}>{f.pct}%</span>
                {f.ideal && (
                  <span className="text-xs text-slate-400">/ {f.ideal}%</span>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="pt-2 border-t border-slate-100 flex justify-between text-sm">
          <span className="text-slate-500">Total de instrumentos</span>
          <span className="font-black text-slate-800">{ft.total}</span>
        </div>
      </div>

      {/* Instrument detail by family */}
      {(['cordas', 'madeiras', 'metais', 'acordeon'] as const).map((family) => {
        const instruments = STAT_INSTRUMENTS[family];
        const hasAny = instruments.some((i) => (stat[i.key as keyof EventStatistic] as number) > 0);
        if (!hasAny) return null;
        const labels: Record<string, string> = {
          cordas: 'Cordas', madeiras: 'Madeiras', metais: 'Metais', acordeon: 'Acordeon',
        };
        return (
          <div key={family} className="bg-white rounded-3xl p-5 shadow-xl shadow-slate-200/40 border border-slate-100">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{labels[family]}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {instruments.map((inst) => {
                const val = (stat[inst.key as keyof EventStatistic] as number) || 0;
                if (val === 0) return null;
                return (
                  <div key={inst.key} className="flex justify-between items-center bg-slate-50 rounded-xl px-3 py-2">
                    <span className="text-xs text-slate-600 font-medium">{inst.label}</span>
                    <span className="text-sm font-black text-slate-800">{val}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Ministry */}
      <div className="bg-white rounded-3xl p-5 shadow-xl shadow-slate-200/40 border border-slate-100">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Ministério</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {MINISTRY_FIELDS.map((field) => {
            const val = (stat[field.key as keyof EventStatistic] as number) || 0;
            if (val === 0) return null;
            return (
              <div key={field.key} className="flex justify-between items-center bg-slate-50 rounded-xl px-3 py-2">
                <span className="text-xs text-slate-600 font-medium">{field.label}</span>
                <span className="text-sm font-black text-slate-800">{val}</span>
              </div>
            );
          })}
        </div>
        <div className="pt-3 mt-2 border-t border-slate-100 flex justify-between text-sm">
          <span className="text-slate-500">Total geral</span>
          <span className="font-black text-slate-800">{mt.totalGeral}</span>
        </div>
      </div>

      {/* Info fields */}
      {(stat.palavra || stat.hino_abertura || stat.hinos_ensaiados) && (
        <div className="bg-white rounded-3xl p-5 shadow-xl shadow-slate-200/40 border border-slate-100 space-y-3">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Informações do Culto</h3>
          {stat.palavra && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Palavra</span>
              <span className="font-bold text-slate-700">{stat.palavra}</span>
            </div>
          )}
          {stat.hino_abertura ? (
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Hino de Abertura</span>
              <span className="font-bold text-slate-700">Nº {stat.hino_abertura}</span>
            </div>
          ) : null}
          {stat.hinos_ensaiados ? (
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Hinos Ensaiados</span>
              <span className="font-bold text-slate-700">{stat.hinos_ensaiados}</span>
            </div>
          ) : null}
        </div>
      )}

      {previewDataUrl && (
        <PdfPreviewModal
          dataUrl={previewDataUrl}
          title="Pré-visualização"
          fileName={`Estatistica_${congregation?.name ?? 'Evento'}_${stat.event_date}.pdf`}
          onClose={() => setPreviewDataUrl(null)}
        />
      )}
    </div>
  );
}
