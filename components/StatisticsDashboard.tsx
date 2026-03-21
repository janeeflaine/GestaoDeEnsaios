import React, { useState, useEffect, useMemo } from 'react';
import { Plus, FileText, Calendar, Users, Music, BarChart3, Trash2, Edit2 } from 'lucide-react';
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

    const chartColors = ['#facc15', '#60a5fa', '#34d399', '#94a3b8']; // yellow-400, blue-400, green-400, slate-400
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

            {/* Summary Cards */}
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

            {/* Charts */}
            {aggregated && aggregated.totals.total > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col items-center">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 text-center">Quantidade Total por Família</h3>
                        <div className="w-full h-72 flex items-center justify-center pt-2">
                            <Doughnut data={quantityChartData} options={chartOptions} />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col items-center">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 text-center">Porcentagem Real (%)</h3>
                        <div className="w-full h-72 flex items-center justify-center pt-2">
                            <Doughnut data={percentageChartData} options={chartOptions} />
                        </div>
                    </div>
                </div>
            )}

            {/* Category Table */}
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
                                <tr key={row.label} className={`bg-white hover:bg-slate-50 transition-colors`}>
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

            {/* Statistics List */}
            <div className="space-y-4 pt-4">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">Registros Consolidados</h3>
                {statistics.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200">
                        <BarChart3 size={48} className="text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 font-medium">Nenhuma estatística cadastrada ainda.</p>
                        <p className="text-slate-400 text-sm mt-1">Clique em "Cadastrar Dados do Evento" para começar.</p>
                    </div>
                ) : (
                    statistics.map(stat => {
                        const ft = calcFamilyTotals(stat);
                        const mt = calcMinistryTotals(stat);
                        const congregation = congregations.find(c => c.id === stat.congregation_id);
                        return (
                            <div key={stat.id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-md transition-shadow">
                                <div className="flex-1 min-w-0 w-full sm:w-auto">
                                    <p className="text-slate-800 font-bold truncate" title={congregation?.name}>{congregation?.name || 'Congregação'}</p>
                                    <p className="text-sm text-slate-500 truncate mt-1">
                                        <span className="font-semibold text-slate-600">{new Date(stat.event_date + 'T00:00:00').toLocaleDateString('pt-BR')}</span> •
                                        {' '}{ft.total} inst. • Total: {mt.totalGeral}
                                    </p>
                                </div>
                                <div className="flex gap-2 flex-shrink-0">
                                    <button onClick={() => handleExportPDF(stat)} className="bg-indigo-50 text-indigo-600 p-2.5 rounded-xl hover:bg-indigo-100 transition-all font-semibold flex items-center justify-center" title="Exportar PDF">
                                        <FileText size={18} />
                                    </button>
                                    <button onClick={() => { setEditingStat(stat); setShowForm(true); }} className="bg-slate-50 text-slate-600 p-2.5 rounded-xl hover:bg-slate-100 transition-all" title="Editar">
                                        <Edit2 size={18} />
                                    </button>
                                    <button onClick={() => stat.id && handleDelete(stat.id)} className="bg-red-50 text-red-600 p-2.5 rounded-xl hover:bg-red-100 transition-all" title="Excluir">
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
