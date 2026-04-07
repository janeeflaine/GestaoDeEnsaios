import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, FileText, Eye, Calendar, Users, Music, BarChart3, Trash2, Edit2, Share2, AlertTriangle, X, Bell, CheckCircle, XCircle } from 'lucide-react';
import {
    ResponsiveContainer,
    ComposedChart,
    BarChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend as RechartsLegend,
    Cell
} from 'recharts';
import { EventStatistic, Anciao, Encarregado, Congregation, RehearsalEvent, UserRole, PendingAnciao, PendingConductor } from '../types';
import { fetchPendingAnciaes, approvePendingAnciao, rejectPendingAnciao } from '../services/anciaes';
import { fetchPendingConductors, approvePendingConductor, rejectPendingConductor } from '../services/conductors';
import { calcFamilyTotals, calcMinistryTotals } from '../utils/orchestraCalculations';
import { generateStatisticsPDF, getStatisticsPdfDataUrl } from '../utils/pdfReport';
import PdfPreviewModal from './modals/PdfPreviewModal';
import { ShareStatModal } from './modals/ShareStatModal';
import { supabase } from '../supabaseClient';
import StatisticsForm from './StatisticsForm';
import {
    loadGuestStatistics,
    upsertGuestStatistic,
    deleteGuestStatistic,
    fetchMyStatistics,
    deleteStatistic,
} from '../services/statistics';

// Chart.js removed in favor of Recharts

interface StatisticsDashboardProps {
    congregations: Congregation[];
    events: RehearsalEvent[];
    isGuest?: boolean;
    userId?: string;
    userRole?: UserRole;
    userName?: string;
    onGoToProfile?: () => void;
}

const GUEST_BANNER_DISMISSED_KEY = 'guest_stat_banner_dismissed';

export default function StatisticsDashboard({
    congregations, events, isGuest = false, userId, userRole, userName, onGoToProfile,
}: StatisticsDashboardProps) {
    const isAdmin = userRole === UserRole.ADMIN;
    const [statistics, setStatistics] = useState<EventStatistic[]>([]);
    const [anciaes, setAnciaes] = useState<Anciao[]>([]);
    const [encRegionais, setEncRegionais] = useState<Encarregado[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingStat, setEditingStat] = useState<EventStatistic | null>(null);
    const [loading, setLoading] = useState(true);
    const [isExporting, setIsExporting] = useState<string | null>(null);
    const [previewStat, setPreviewStat] = useState<EventStatistic | null>(null);
    const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
    const [sharingStat, setSharingStat] = useState<EventStatistic | null>(null);
    const [bannerDismissed, setBannerDismissed] = useState(
        () => sessionStorage.getItem(GUEST_BANNER_DISMISSED_KEY) === '1'
    );
    const [pendingAnciaes, setPendingAnciaes] = useState<PendingAnciao[]>([]);
    const [pendingConductors, setPendingConductors] = useState<PendingConductor[]>([]);
    const [showPendingModal, setShowPendingModal] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (isGuest) {
                setStatistics(loadGuestStatistics());
            } else {
                setStatistics(await fetchMyStatistics());
            }

            const [ancRes, encRes] = await Promise.all([
                supabase.from('anciaes').select('*').order('name'),
                supabase.from('conductors').select('*').eq('type', 'Regional').order('name'),
            ]);
            if (ancRes.data) setAnciaes(ancRes.data as Anciao[]);
            if (encRes.data) setEncRegionais(encRes.data as Encarregado[]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [isGuest, userId]);

    const loadPending = useCallback(async () => {
        if (!isAdmin) return;
        try {
            const [anc, cond] = await Promise.all([fetchPendingAnciaes(), fetchPendingConductors()]);
            setPendingAnciaes(anc);
            setPendingConductors(cond);
        } catch { /* silent */ }
    }, [isAdmin]);

    useEffect(() => { loadPending(); }, [loadPending]);

    const handleApprovePending = async (p: PendingAnciao) => {
        await approvePendingAnciao(p);
        await loadPending();
        fetchData();
    };

    const handleRejectPending = async (id: string) => {
        await rejectPendingAnciao(id);
        await loadPending();
    };

    const handleApprovePendingConductor = async (p: PendingConductor) => {
        await approvePendingConductor(p);
        await loadPending();
        fetchData();
    };

    const handleRejectPendingConductor = async (id: string) => {
        await rejectPendingConductor(id);
        await loadPending();
    };

    // ── Guest stat CRUD ───────────────────────────────────────
    const handleGuestSave = (stat: EventStatistic) => {
        setStatistics(upsertGuestStatistic(stat));
    };

    const handleGuestDelete = (id: string) => {
        if (!confirm('Excluir esta estatística?')) return;
        setStatistics(deleteGuestStatistic(id));
    };

    // ── Authenticated stat CRUD ───────────────────────────────
    const handleAuthDelete = async (id: string) => {
        if (!confirm('Excluir esta estatística?')) return;
        await deleteStatistic(id);
        setStatistics((prev) => prev.filter((s) => s.id !== id));
    };

    const handleDelete = (stat: EventStatistic) => {
        if (!stat.id) return;
        if (isGuest) {
            handleGuestDelete(stat.id);
        } else {
            handleAuthDelete(stat.id);
        }
    };

    const handleShareTokenChange = (statId: string, newToken: string | null) => {
        setStatistics((prev) =>
            prev.map((s) => s.id === statId ? { ...s, share_token: newToken ?? undefined } : s)
        );
        if (sharingStat?.id === statId) {
            setSharingStat((prev) => prev ? { ...prev, share_token: newToken ?? undefined } : prev);
        }
    };

    // ── PDF handlers ──────────────────────────────────────────
    const handleExportPDF = (stat: EventStatistic) => {
        const congregation = congregations.find(c => c.id === stat.congregation_id);
        const anciao = anciaes.find(a => a.id === stat.anciao_id);
        generateStatisticsPDF(stat, congregation, anciao);
    };

    const handlePreviewPDF = async (stat: EventStatistic) => {
        setIsExporting(stat.id!);
        const congregation = congregations.find(c => c.id === stat.congregation_id);
        const anciao = anciaes.find(a => a.id === stat.anciao_id);
        const dataUrl = await getStatisticsPdfDataUrl(stat, congregation, anciao);
        setPreviewStat(stat);
        setPreviewDataUrl(dataUrl);
        setIsExporting(null);
    };

    // ── Aggregated data ───────────────────────────────────────
    const aggregated = useMemo(() => {
        if (statistics.length === 0) return null;
        const totals = { cordas: 0, madeiras: 0, metais: 0, acordeon: 0, total: 0 };
        let totalMusicos = 0, totalOrganistas = 0, totalGeral = 0;

        statistics.forEach(stat => {
            const ft = calcFamilyTotals(stat);
            totals.cordas += ft.cordas;
            totals.madeiras += ft.madeiras;
            totals.metais += ft.metais;
            totals.acordeon += ft.acordeon;
            totals.total += ft.total;
            const mt = calcMinistryTotals(stat);
            totalMusicos += stat.musicos || 0;
            totalOrganistas += stat.organistas || 0;
            totalGeral += mt.totalGeral;
        });

        const pct = totals.total > 0 ? {
            cordas: Math.round((totals.cordas / totals.total) * 100),
            madeiras: Math.round((totals.madeiras / totals.total) * 100),
            metais: Math.round((totals.metais / totals.total) * 100),
            acordeon: Math.round((totals.acordeon / totals.total) * 100),
        } : { cordas: 0, madeiras: 0, metais: 0, acordeon: 0 };

        return { totals, pct, totalMusicos, totalOrganistas, totalGeral, totalEventos: statistics.length };
    }, [statistics]);

    const rechartsPctData = useMemo(() => aggregated ? [
        { name: 'Cordas', real: aggregated.pct.cordas, ideal: 50, fill: '#facc15' },
        { name: 'Madeiras', real: aggregated.pct.madeiras, ideal: 25, fill: '#60a5fa' },
        { name: 'Metais', real: aggregated.pct.metais, ideal: 25, fill: '#34d399' },
        { name: 'Acordeon', real: aggregated.pct.acordeon, ideal: 0, fill: '#94a3b8' },
    ] : [], [aggregated]);

    const rechartsQtyData = useMemo(() => aggregated ? [
        { name: 'Cordas', value: aggregated.totals.cordas, fill: '#facc15' },
        { name: 'Madeiras', value: aggregated.totals.madeiras, fill: '#60a5fa' },
        { name: 'Metais', value: aggregated.totals.metais, fill: '#34d399' },
        { name: 'Acordeon', value: aggregated.totals.acordeon, fill: '#94a3b8' },
    ] : [], [aggregated]);

    const TargetMarker = useCallback((props: any) => {
        const { cx, cy, payload } = props;
        if (cy == null || payload.ideal === 0) return null;
        const width = 45;
        return (
            <line x1={cx - width / 2} y1={cy} x2={cx + width / 2} y2={cy} stroke="#0f172a" strokeWidth={3} strokeLinecap="round" />
        );
    }, []);

    const PercentageTooltip = useCallback(({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const realStr = payload.find((p: any) => p.dataKey === 'real');
            const idealStr = payload.find((p: any) => p.dataKey === 'ideal');

            const real = realStr ? Number(realStr.value) : 0;
            const ideal = idealStr ? Number(idealStr.value) : 0;

            let statusText = '';
            let statusColor = '';
            if (ideal > 0) {
                const diff = real - ideal;
                if (diff < -5) {
                    statusText = 'Abaixo do Ideal 🚨';
                    statusColor = 'text-red-500';
                } else if (diff > 5) {
                    statusText = 'Acima do Ideal ⚠️';
                    statusColor = 'text-amber-500';
                } else {
                    statusText = 'Próximo ao Ideal ✅';
                    statusColor = 'text-green-500';
                }
            }

            return (
                <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-xl min-w-[150px]">
                    <p className="font-bold text-slate-800 mb-2">{label}</p>
                    <p className="text-sm font-bold" style={{ color: realStr?.color || '#000' }}>Barra (Real): {real}%</p>
                    {ideal > 0 && <p className="text-sm font-bold text-slate-700">Linha (Meta): {ideal}%</p>}
                    {statusText && <p className={`text-xs font-black mt-2 ${statusColor}`}>{statusText}</p>}
                </div>
            );
        }
        return null;
    }, []);

    const QuantityTooltip = useCallback(({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            return (
                <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-xl min-w-[120px]">
                    <p className="font-bold text-slate-800 mb-1">{label}</p>
                    <p className="text-sm font-bold" style={{ color: data.color || '#000' }}>Total: {data.value}</p>
                </div>
            );
        }
        return null;
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="px-4 py-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">

            {/* ── Guest banner ────────────────────────────────── */}
            {isGuest && !bannerDismissed && (
                <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-start gap-3 relative">
                    <AlertTriangle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-amber-800">Você está navegando como visitante</p>
                        <p className="text-xs text-amber-700 mt-1">
                            Seus dados ficam salvos enquanto esta aba estiver aberta, mas{' '}
                            <strong>serão perdidos ao fechar o navegador ou a aba</strong>.
                            Para manter seus registros permanentemente,{' '}
                            <button onClick={onGoToProfile} className="underline font-bold hover:text-amber-900 transition-colors">
                                crie um perfil gratuito
                            </button>
                            .
                        </p>
                    </div>
                    <button
                        onClick={() => { sessionStorage.setItem(GUEST_BANNER_DISMISSED_KEY, '1'); setBannerDismissed(true); }}
                        className="text-amber-400 hover:text-amber-600 transition-colors flex-shrink-0"
                        title="Fechar aviso"
                    >
                        <X size={18} />
                    </button>
                </div>
            )}

            {/* ── Admin: pending notifications ─────────────────── */}
            {isAdmin && (pendingAnciaes.length > 0 || pendingConductors.length > 0) && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3">
                    <Bell size={20} className="text-blue-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-blue-800">
                            {pendingAnciaes.length + pendingConductors.length} solicitaç{pendingAnciaes.length + pendingConductors.length > 1 ? 'ões' : 'ão'} pendente{pendingAnciaes.length + pendingConductors.length > 1 ? 's' : ''}
                        </p>
                        <p className="text-xs text-blue-600 mt-0.5">
                            {[
                                pendingAnciaes.length > 0 && `${pendingAnciaes.length} ancião`,
                                pendingConductors.length > 0 && `${pendingConductors.length} enc. regional`,
                            ].filter(Boolean).join(' · ')}
                        </p>
                    </div>
                    <button onClick={() => setShowPendingModal(true)}
                        className="bg-blue-600 text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors flex-shrink-0">
                        Revisar
                    </button>
                </div>
            )}

            {/* ── Header ──────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <BarChart3 size={28} className="text-indigo-600" /> Estatísticas Musicais
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">Dashboard analítico e relatórios de formação orquestral</p>
                </div>
                <button
                    onClick={() => { setEditingStat(null); setShowForm(true); }}
                    className="bg-indigo-600 text-white font-bold px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-200"
                >
                    <Plus size={20} /> Cadastrar Dados do Evento
                </button>
            </div>

            {/* ── Summary Cards ───────────────────────────────── */}
            {aggregated && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total de Eventos', value: aggregated.totalEventos, icon: <Calendar size={20} />, color: 'text-indigo-400' },
                        { label: 'Total de Músicos', value: aggregated.totalMusicos, icon: <Music size={20} />, color: 'text-yellow-400' },
                        { label: 'Músicos + Organistas', value: aggregated.totalMusicos + aggregated.totalOrganistas, icon: <Users size={20} />, color: 'text-green-400' },
                        { label: 'Total Geral', value: aggregated.totalGeral, icon: <Users size={20} />, color: 'text-purple-500' },
                    ].map(card => (
                        <div key={card.label} className="bg-white p-5 rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 text-center">
                            <div className={`${card.color} mb-2 flex justify-center`}>{card.icon}</div>
                            <p className="text-3xl font-black text-slate-800">{card.value}</p>
                            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-1">{card.label}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Charts ──────────────────────────────────────── */}
            {aggregated && aggregated.totals.total > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col items-center">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 text-center">Quantidade Total por Família</h3>
                        <div className="w-full h-72 flex items-center justify-center pt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={rechartsQtyData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <RechartsTooltip content={<QuantityTooltip />} cursor={{ fill: '#f8fafc' }} />
                                    <Bar dataKey="value" name="Quantidade" fill="#475569" radius={[4, 4, 0, 0]} maxBarSize={60} label={{ position: 'top', fill: '#475569', fontSize: 12, fontWeight: 'bold', formatter: (v: any) => v > 0 ? v : '' }}>
                                        {rechartsQtyData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col items-center">
                        <div className="w-full flex justify-between items-center mb-6">
                            <div className="w-4"></div>
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Porcentagem Real vs Ideal</h3>
                            <div className="w-4"></div>
                        </div>
                        <div className="w-full h-72 flex items-center justify-center pt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={rechartsPctData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                                    <RechartsTooltip content={<PercentageTooltip />} cursor={{ fill: '#f8fafc' }} />
                                    <RechartsLegend wrapperStyle={{ paddingTop: '10px' }} iconType="circle" />
                                    <Bar dataKey="real" name="Barra (Real)" fill="#475569" radius={[4, 4, 0, 0]} maxBarSize={60} label={{ position: 'top', fill: '#475569', fontSize: 12, fontWeight: 'bold', formatter: (v: any) => v > 0 ? `${v}%` : '' }}>
                                        {rechartsPctData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                                    </Bar>
                                    <Line type="monotone" dataKey="ideal" name="Linha (Meta/Ideal)" stroke="#0f172a" strokeWidth={0} dot={<TargetMarker />} activeDot={false} legendType="line" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Family Table ─────────────────────────────────── */}
            {aggregated && (
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-x-auto">
                    <table className="w-full text-sm min-w-[500px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoria</th>
                                <th className="p-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</th>
                                <th className="p-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">% Real</th>
                                <th className="p-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">% Ideal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {[
                                { label: 'Cordas', total: aggregated.totals.cordas, pct: aggregated.pct.cordas, ideal: '50%', border: 'border-l-4 border-l-yellow-400', text: 'text-yellow-600' },
                                { label: 'Madeiras', total: aggregated.totals.madeiras, pct: aggregated.pct.madeiras, ideal: '25%', border: 'border-l-4 border-l-blue-400', text: 'text-blue-600' },
                                { label: 'Metais', total: aggregated.totals.metais, pct: aggregated.pct.metais, ideal: '25%', border: 'border-l-4 border-l-green-400', text: 'text-green-600' },
                                { label: 'Acordeon', total: aggregated.totals.acordeon, pct: aggregated.pct.acordeon, ideal: '-', border: 'border-l-4 border-l-slate-400', text: 'text-slate-600' },
                            ].map(row => (
                                <tr key={row.label} className="bg-white hover:bg-slate-50 transition-colors">
                                    <td className={`p-4 font-bold ${row.text} ${row.border}`}>{row.label}</td>
                                    <td className="p-4 text-center text-slate-800 font-bold">{row.total}</td>
                                    <td className={`p-4 text-center font-black ${row.text}`}>{row.pct}%</td>
                                    <td className="p-4 text-center text-slate-400 font-medium">{row.ideal}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ── Statistics List ──────────────────────────────── */}
            <div className="space-y-4 pt-4">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">Registros Consolidados</h3>
                {statistics.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200">
                        <BarChart3 size={48} className="text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 font-medium">Nenhuma estatística cadastrada ainda.</p>
                        <p className="text-slate-400 text-sm mt-1">Clique em "Cadastrar Dados do Evento" para começar.</p>
                        {isGuest && (
                            <p className="text-amber-500 text-xs mt-3 font-semibold">
                                ⚠ Os dados serão perdidos ao fechar esta aba. <button onClick={onGoToProfile} className="underline">Crie um perfil</button> para salvar permanentemente.
                            </p>
                        )}
                    </div>
                ) : (
                    statistics.map(stat => {
                        const ft = calcFamilyTotals(stat);
                        const mt = calcMinistryTotals(stat);
                        const congregation = congregations.find(c => c.id === stat.congregation_id);
                        const hasShareToken = !!stat.share_token;
                        // Apenas o criador pode editar/excluir (guests são donos de todos os seus próprios dados locais)
                        const isOwner = isGuest || stat.created_by === userId;
                        return (
                            <div key={stat.id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-md transition-shadow">
                                <div className="flex-1 min-w-0 w-full sm:w-auto">
                                    <p className="text-slate-800 font-bold truncate" title={congregation?.name}>{congregation?.name || 'Congregação'}</p>
                                    <p className="text-sm text-slate-500 truncate mt-1">
                                        <span className="font-semibold text-slate-600">{new Date(stat.event_date + 'T00:00:00').toLocaleDateString('pt-BR')}</span> •
                                        {' '}{ft.total} inst. • Total: {mt.totalGeral}
                                    </p>
                                    {hasShareToken && (
                                        <p className="text-xs text-green-600 font-semibold mt-1">🔗 Link ativo</p>
                                    )}
                                </div>
                                <div className="flex gap-2 flex-shrink-0 flex-wrap">
                                    <button onClick={() => handlePreviewPDF(stat)} disabled={isExporting === stat.id}
                                        className="bg-purple-50 text-purple-600 p-2.5 rounded-xl hover:bg-purple-100 transition-all flex items-center justify-center min-w-[40px]"
                                        title="Pré-visualizar PDF">
                                        {isExporting === stat.id
                                            ? <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                                            : <Eye size={18} />}
                                    </button>
                                    <button onClick={() => handleExportPDF(stat)} disabled={isExporting === stat.id}
                                        className="bg-indigo-50 text-indigo-600 p-2.5 rounded-xl hover:bg-indigo-100 transition-all flex items-center justify-center min-w-[40px]"
                                        title="Exportar PDF">
                                        <FileText size={18} />
                                    </button>
                                    {!isGuest && (
                                        <button onClick={() => setSharingStat(stat)}
                                            className={`p-2.5 rounded-xl transition-all flex items-center justify-center min-w-[40px] ${hasShareToken ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                                            title="Compartilhar via WhatsApp">
                                            <Share2 size={18} />
                                        </button>
                                    )}
                                    {isOwner && (
                                        <button onClick={() => { setEditingStat(stat); setShowForm(true); }}
                                            className="bg-slate-50 text-slate-600 p-2.5 rounded-xl hover:bg-slate-100 transition-all"
                                            title="Editar">
                                            <Edit2 size={18} />
                                        </button>
                                    )}
                                    {isOwner && (
                                        <button onClick={() => handleDelete(stat)}
                                            className="bg-red-50 text-red-600 p-2.5 rounded-xl hover:bg-red-100 transition-all"
                                            title="Excluir">
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* ── Form Modal ───────────────────────────────────── */}
            {/* ── Pending Anciaes Modal (admin) ────────────────── */}
            {showPendingModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl border border-slate-100">
                        <div className="flex items-center justify-between mb-6">
                            <h4 className="text-xl font-bold text-slate-800 tracking-tight">Solicitações Pendentes</h4>
                            <button onClick={() => setShowPendingModal(false)} className="bg-slate-100 p-2 rounded-xl hover:bg-slate-200 transition-colors">
                                <X size={20} className="text-slate-500" />
                            </button>
                        </div>
                        {pendingAnciaes.length === 0 && pendingConductors.length === 0 ? (
                            <p className="text-slate-500 text-center py-8">Nenhuma solicitação pendente.</p>
                        ) : (
                            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                                {pendingAnciaes.length > 0 && (
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Anciães</p>
                                        {pendingAnciaes.map(p => (
                                            <div key={p.id} className="bg-slate-50 rounded-2xl p-4 flex items-start gap-3 border border-slate-100">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-slate-800">IR. {p.name.toUpperCase()}</p>
                                                    {p.requester_name && (
                                                        <p className="text-xs text-slate-500 mt-0.5">Solicitado por: <span className="font-semibold text-slate-600">{p.requester_name}</span></p>
                                                    )}
                                                    <p className="text-xs text-slate-400 mt-0.5">{p.created_at ? new Date(p.created_at).toLocaleDateString('pt-BR') : ''}</p>
                                                </div>
                                                <div className="flex gap-2 flex-shrink-0">
                                                    <button onClick={() => handleApprovePending(p)}
                                                        className="flex items-center gap-1 bg-green-50 text-green-700 font-bold text-xs px-3 py-2 rounded-xl hover:bg-green-100 transition-colors border border-green-200"
                                                        title="Aprovar e salvar no banco">
                                                        <CheckCircle size={14} /> Aprovar
                                                    </button>
                                                    <button onClick={() => handleRejectPending(p.id)}
                                                        className="flex items-center gap-1 bg-red-50 text-red-600 font-bold text-xs px-3 py-2 rounded-xl hover:bg-red-100 transition-colors border border-red-200"
                                                        title="Rejeitar">
                                                        <XCircle size={14} /> Rejeitar
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {pendingConductors.length > 0 && (
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Encarregados Regionais</p>
                                        {pendingConductors.map(p => (
                                            <div key={p.id} className="bg-slate-50 rounded-2xl p-4 flex items-start gap-3 border border-slate-100">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-slate-800">{p.name}</p>
                                                    {p.congregation && <p className="text-xs text-slate-500 mt-0.5">{p.congregation}</p>}
                                                    {p.requester_name && (
                                                        <p className="text-xs text-slate-500 mt-0.5">Solicitado por: <span className="font-semibold text-slate-600">{p.requester_name}</span></p>
                                                    )}
                                                    <p className="text-xs text-slate-400 mt-0.5">{p.created_at ? new Date(p.created_at).toLocaleDateString('pt-BR') : ''}</p>
                                                </div>
                                                <div className="flex gap-2 flex-shrink-0">
                                                    <button onClick={() => handleApprovePendingConductor(p)}
                                                        className="flex items-center gap-1 bg-green-50 text-green-700 font-bold text-xs px-3 py-2 rounded-xl hover:bg-green-100 transition-colors border border-green-200"
                                                        title="Aprovar e salvar no banco">
                                                        <CheckCircle size={14} /> Aprovar
                                                    </button>
                                                    <button onClick={() => handleRejectPendingConductor(p.id)}
                                                        className="flex items-center gap-1 bg-red-50 text-red-600 font-bold text-xs px-3 py-2 rounded-xl hover:bg-red-100 transition-colors border border-red-200"
                                                        title="Rejeitar">
                                                        <XCircle size={14} /> Rejeitar
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {showForm && (
                <StatisticsForm
                    congregations={congregations}
                    events={events}
                    anciaes={anciaes}
                    encRegionais={encRegionais}
                    editingStat={editingStat}
                    isGuest={isGuest}
                    userId={userId}
                    userRole={userRole}
                    userName={userName}
                    onClose={() => setShowForm(false)}
                    onSaved={(saved) => {
                        setShowForm(false);
                        if (isGuest && saved) {
                            handleGuestSave(saved);
                        } else {
                            fetchData();
                        }
                    }}
                />
            )}

            {/* ── Share Modal ──────────────────────────────────── */}
            {sharingStat && !isGuest && (
                <ShareStatModal
                    statId={sharingStat.id!}
                    statLabel={`${congregations.find(c => c.id === sharingStat.congregation_id)?.name ?? 'Evento'} — ${new Date(sharingStat.event_date + 'T00:00:00').toLocaleDateString('pt-BR')}`}
                    existingToken={sharingStat.share_token ?? null}
                    onClose={() => setSharingStat(null)}
                    onTokenChange={handleShareTokenChange}
                />
            )}

            {/* ── PDF Preview Modal ────────────────────────────── */}
            {previewDataUrl && previewStat && (
                <PdfPreviewModal
                    dataUrl={previewDataUrl}
                    title="Pré-visualização da Estatística"
                    fileName={`Estatistica_${congregations.find(c => c.id === previewStat.congregation_id)?.name || 'Evento'}_${previewStat.event_date}.pdf`}
                    onClose={() => { setPreviewDataUrl(null); setPreviewStat(null); }}
                />
            )}
        </div>
    );
}
