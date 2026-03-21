import React, { useState, useEffect, useMemo } from 'react';
import { Plus, FileText, Calendar, Users, Music, BarChart3, Trash2 } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { EventStatistic, Anciao, EncRegional, Congregation, RehearsalEvent } from '../types';
import { calcFamilyTotals, calcFamilyPercentages, calcMinistryTotals } from '../utils/orchestraCalculations';
import { generateStatisticsPDF } from '../utils/pdfReport';
import { supabase } from '../supabaseClient';
import StatisticsForm from './StatisticsForm';

ChartJS.register(ArcElement, Tooltip, Legend);

interface StatisticsDashboardProps {
    congregations: Congregation[];
    events: RehearsalEvent[];
    userProfileId?: string;
}

export default function StatisticsDashboard({ congregations, events, userProfileId }: StatisticsDashboardProps) {
    const [statistics, setStatistics] = useState<EventStatistic[]>([]);
    const [anciaes, setAnciaes] = useState<Anciao[]>([]);
    const [encRegionais, setEncRegionais] = useState<EncRegional[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingStat, setEditingStat] = useState<EventStatistic | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        const [statsRes, ancRes, encRes] = await Promise.all([
            supabase.from('event_statistics').select('*').order('event_date', { ascending: false }),
            supabase.from('anciaes').select('*').order('name'),
            supabase.from('enc_regionais').select('*').order('name'),
        ]);
        if (statsRes.data) setStatistics(statsRes.data as EventStatistic[]);
        if (ancRes.data) setAnciaes(ancRes.data as Anciao[]);
        if (encRes.data) setEncRegionais(encRes.data as EncRegional[]);
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    // Aggregate all statistics for dashboard
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

    const chartColors = ['#EAB308', '#3B82F6', '#22C55E', '#94A3B8'];
    const chartLabels = ['Cordas', 'Madeiras', 'Metais', 'Acordeon'];

    const quantityChartData = {
        labels: chartLabels,
        datasets: [{
            data: aggregated ? [aggregated.totals.cordas, aggregated.totals.madeiras, aggregated.totals.metais, aggregated.totals.acordeon] : [0, 0, 0, 0],
            backgroundColor: chartColors,
            borderColor: 'transparent',
            borderWidth: 2,
        }],
    };

    const percentageChartData = {
        labels: chartLabels,
        datasets: [{
            data: aggregated ? [aggregated.pct.cordas, aggregated.pct.madeiras, aggregated.pct.metais, aggregated.pct.acordeon] : [0, 0, 0, 0],
            backgroundColor: chartColors,
            borderColor: 'transparent',
            borderWidth: 2,
        }],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom' as const, labels: { color: '#94A3B8', font: { size: 12, weight: 'bold' as const } } },
        },
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Excluir esta estatística?')) return;
        await supabase.from('event_statistics').delete().eq('id', id);
        fetchData();
    };

    const handleExportPDF = (stat: EventStatistic) => {
        const congregation = congregations.find(c => c.id === stat.congregation_id);
        const anciao = anciaes.find(a => a.id === stat.anciao_id);
        generateStatisticsPDF(stat, congregation, anciao);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="px-4 py-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                        <BarChart3 size={28} className="text-indigo-400" /> Estatísticas Musicais
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">Dashboard analítico e relatórios de formação orquestral</p>
                </div>
                <button
                    onClick={() => { setEditingStat(null); setShowForm(true); }}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold px-6 py-3 rounded-2xl flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg"
                >
                    <Plus size={20} /> Cadastrar Dados do Evento
                </button>
            </div>

            {/* Summary Cards */}
            {aggregated && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total de Eventos', value: aggregated.totalEventos, icon: <Calendar size={20} />, color: 'text-indigo-400' },
                        { label: 'Total de Músicos', value: aggregated.totalMusicos, icon: <Music size={20} />, color: 'text-yellow-400' },
                        { label: 'Músicos + Organistas', value: aggregated.totalMusicos + aggregated.totalOrganistas, icon: <Users size={20} />, color: 'text-green-400' },
                        { label: 'Total Geral', value: aggregated.totalGeral, icon: <Users size={20} />, color: 'text-purple-400' },
                    ].map(card => (
                        <div key={card.label} className="glass-card p-5 text-center">
                            <div className={`${card.color} mb-2 flex justify-center`}>{card.icon}</div>
                            <p className="text-3xl font-black text-white">{card.value}</p>
                            <p className="text-xs text-slate-400 font-bold mt-1">{card.label}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Charts */}
            {aggregated && aggregated.totals.total > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-card p-6">
                        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 text-center">Quantidade Total por Família</h3>
                        <div className="h-64"><Doughnut data={quantityChartData} options={chartOptions} /></div>
                    </div>
                    <div className="glass-card p-6">
                        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 text-center">Porcentagem Real (%)</h3>
                        <div className="h-64"><Doughnut data={percentageChartData} options={chartOptions} /></div>
                    </div>
                </div>
            )}

            {/* Category Table */}
            {aggregated && (
                <div className="glass-card overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-white/5">
                                <th className="p-3 text-left text-slate-400 font-bold uppercase text-xs">Categoria</th>
                                <th className="p-3 text-center text-slate-400 font-bold uppercase text-xs">Total</th>
                                <th className="p-3 text-center text-slate-400 font-bold uppercase text-xs">% Real</th>
                                <th className="p-3 text-center text-slate-400 font-bold uppercase text-xs">% Ideal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { label: 'Cordas', total: aggregated.totals.cordas, pct: aggregated.pct.cordas, ideal: '50%', bg: 'bg-yellow-900/20', text: 'text-yellow-400' },
                                { label: 'Madeiras', total: aggregated.totals.madeiras, pct: aggregated.pct.madeiras, ideal: '25%', bg: 'bg-blue-900/20', text: 'text-blue-400' },
                                { label: 'Metais', total: aggregated.totals.metais, pct: aggregated.pct.metais, ideal: '25%', bg: 'bg-green-900/20', text: 'text-green-400' },
                                { label: 'Acordeon', total: aggregated.totals.acordeon, pct: aggregated.pct.acordeon, ideal: '-', bg: 'bg-slate-800/20', text: 'text-slate-400' },
                            ].map(row => (
                                <tr key={row.label} className={`${row.bg} border-t border-white/5`}>
                                    <td className={`p-3 font-bold ${row.text}`}>{row.label}</td>
                                    <td className="p-3 text-center text-white font-semibold">{row.total}</td>
                                    <td className={`p-3 text-center font-bold ${row.text}`}>{row.pct}%</td>
                                    <td className="p-3 text-center text-slate-400 font-semibold">{row.ideal}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Statistics List */}
            <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Eventos Registrados</h3>
                {statistics.length === 0 ? (
                    <div className="glass-card p-12 text-center">
                        <BarChart3 size={48} className="text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400 font-medium">Nenhuma estatística cadastrada ainda.</p>
                        <p className="text-slate-500 text-sm mt-1">Clique em "Cadastrar Dados do Evento" para começar.</p>
                    </div>
                ) : (
                    statistics.map(stat => {
                        const ft = calcFamilyTotals(stat);
                        const mt = calcMinistryTotals(stat);
                        const congregation = congregations.find(c => c.id === stat.congregation_id);
                        return (
                            <div key={stat.id} className="glass-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                <div className="flex-1">
                                    <p className="text-white font-bold">{congregation?.name || 'Congregação'}</p>
                                    <p className="text-xs text-slate-400">
                                        {new Date(stat.event_date + 'T00:00:00').toLocaleDateString('pt-BR')} •
                                        {' '}{ft.total} instrumentos • Total Geral: {mt.totalGeral}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleExportPDF(stat)} className="bg-indigo-600/20 text-indigo-400 p-2 rounded-xl hover:bg-indigo-600/30 transition-all" title="Exportar PDF">
                                        <FileText size={18} />
                                    </button>
                                    <button onClick={() => { setEditingStat(stat); setShowForm(true); }} className="bg-white/5 text-slate-400 p-2 rounded-xl hover:bg-white/10 transition-all" title="Editar">
                                        <BarChart3 size={18} />
                                    </button>
                                    <button onClick={() => stat.id && handleDelete(stat.id)} className="bg-red-600/20 text-red-400 p-2 rounded-xl hover:bg-red-600/30 transition-all" title="Excluir">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Form Modal */}
            {showForm && (
                <StatisticsForm
                    congregations={congregations}
                    events={events}
                    anciaes={anciaes}
                    encRegionais={encRegionais}
                    editingStat={editingStat}
                    onClose={() => setShowForm(false)}
                    onSaved={() => { setShowForm(false); fetchData(); }}
                />
            )}
        </div>
    );
}
