import React, { forwardRef } from 'react';
import { BookOpen, Mic, PenLine, Users } from 'lucide-react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Cell, ResponsiveContainer } from 'recharts';
import { EventStatistic, Congregation, Anciao, STAT_INSTRUMENTS, MINISTRY_FIELDS } from '../types';
import { calcFamilyTotals, calcMinistryTotals } from '../utils/orchestraCalculations';

/* ─── Color tokens (from original PDF/app/globals.css) ─── */
const CCB = {
    gold: '#d4bc8d',
    blueDark: '#1e293b',
    blueLight: '#1e3a8a',
    green: '#14532d',
    gray: '#9ca3af',
};

interface PdfExportTemplateProps {
    stat: EventStatistic;
    congregation?: Congregation | null;
    anciao?: Anciao | null;
}

export const PdfExportTemplate = forwardRef<HTMLDivElement, PdfExportTemplateProps>(({ stat, congregation, anciao }, ref) => {
    const ft = calcFamilyTotals(stat);
    const mt = calcMinistryTotals(stat);

    /* ── date ── */
    const eventDate = new Date(stat.event_date + 'T00:00:00');
    const day = String(eventDate.getDate()).padStart(2, '0');
    const month = eventDate.toLocaleDateString('pt-BR', { month: 'long' });
    const year = eventDate.getFullYear();
    const eventDateFormatted = `${day} DE ${month.toUpperCase()} DE ${year} - (Estatística Extraoficial)`;

    /* ── percentages ── */
    const totalInstruments = ft.total || 1;
    const cordasPct = Math.round((ft.cordas / totalInstruments) * 100);
    const madeirasPct = Math.round((ft.madeiras / totalInstruments) * 100);
    const metaisPct = Math.round((ft.metais / totalInstruments) * 100);
    const acordeonPct = Math.round((ft.acordeon / totalInstruments) * 100);

    /* ── build table rows exactly like original ── */
    type RowData = { name: string; count: number | null; isHeader: boolean; bg: string; text?: string; barColor: string };
    const tableRows: RowData[] = [];

    const addFamily = (label: string, color: string, instruments: readonly { key: string; label: string }[]) => {
        tableRows.push({ name: label, count: null, isHeader: true, bg: color, text: 'white', barColor: '' });
        instruments.forEach((inst, i) => {
            const count = Number((stat[inst.key as keyof EventStatistic] as number)) || 0;
            tableRows.push({ name: inst.label, count, isHeader: false, bg: i % 2 === 0 ? '#ffffff' : '#f9fafb', barColor: color });
        });
    };

    addFamily('CORDAS', CCB.gold, STAT_INSTRUMENTS.cordas);
    addFamily('MADEIRAS', CCB.blueLight, STAT_INSTRUMENTS.madeiras);
    addFamily('METAIS', CCB.green, STAT_INSTRUMENTS.metais);
    addFamily('ACORDEON', '#7f1d1d', STAT_INSTRUMENTS.acordeon);

    /* ── max for bar width ── */
    const allInstKeys = [...STAT_INSTRUMENTS.cordas, ...STAT_INSTRUMENTS.madeiras, ...STAT_INSTRUMENTS.metais, ...STAT_INSTRUMENTS.acordeon];
    const maxInstCount = Math.max(1, ...allInstKeys.map(i => Number(stat[i.key as keyof EventStatistic]) || 0));

    const encRegional = stat.enc_regionais && stat.enc_regionais.length > 0 ? stat.enc_regionais[0] : null;

    const rechartsPctData = [
        { name: 'Cordas', real: cordasPct, ideal: 50, fill: CCB.gold },
        { name: 'Madeiras', real: madeirasPct, ideal: 25, fill: CCB.blueLight },
        { name: 'Metais', real: metaisPct, ideal: 25, fill: CCB.green },
        { name: 'Acordeon', real: acordeonPct, ideal: 0, fill: CCB.gray },
    ];

    const TargetMarker = (props: any) => {
        const { cx, cy, payload } = props;
        if (cy == null || payload.ideal === 0) return null;
        const width = 30;
        return (
            <line x1={cx - width / 2} y1={cy} x2={cx + width / 2} y2={cy} stroke="#0f172a" strokeWidth={2} strokeLinecap="round" />
        );
    };

    const ministryItems = MINISTRY_FIELDS.map((f: any) => ({
        name: f.label.replace('Presentes', '').replace('Música', 'da Música').trim(),
        value: Number(stat[f.key as keyof EventStatistic]) || 0,
    }));

    /*
     * ──────────────────────────────────────────────────────
     * RENDER — This is an EXACT copy of PDF/app/page.tsx
     * with static data replaced by dynamic props.
     * ──────────────────────────────────────────────────────
     */
    return (
        <div className="fixed left-[-9999px] top-[-9999px] overflow-hidden bg-white" style={{ zIndex: -9999 }}>
            <div
                ref={ref}
                id="pdf-export-template"
                style={{
                    width: '210mm',
                    height: '297mm',
                    margin: '0 auto',
                    backgroundColor: '#f9fafb',
                    position: 'relative',
                    overflow: 'hidden',
                    padding: '10mm',
                    boxSizing: 'border-box',
                    backgroundImage: 'radial-gradient(#d1d5db 0.5px, transparent 0.5px)',
                    backgroundSize: '10px 10px',
                }}
                className="flex flex-col gap-4"
            >

                {/* Header */}
                <header className="text-center py-3 bg-white/80 rounded-xl shadow-sm border border-gray-100">
                    <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">CONGREGAÇÃO CRISTÃ NO BRASIL</h1>
                    <p className="text-xs font-semibold text-gray-600 mt-1">{congregation?.name || ''} - {congregation?.city || ''} / {congregation?.state || ''}</p>
                    <p className="text-xs font-bold text-gray-700">ESTATÍSTICA - ENSAIO REGIONAL</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{eventDateFormatted}</p>
                </header>

                {/* Presidency Section */}
                <section className="grid grid-cols-3 gap-3">
                    <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center gap-3" style={{ borderLeft: '4px solid #9ca3af' }}>
                        <div className="p-2 bg-gray-100 rounded-lg"><Mic className="w-5 h-5 text-gray-700" /></div>
                        <div>
                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Ancião: Ir. {anciao?.name || ''}</p>
                            <p className="text-[8px] text-gray-400">LOCALIDADE: {congregation?.city} - {congregation?.state}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center gap-3" style={{ borderLeft: '4px solid #9ca3af' }}>
                        <div className="p-2 bg-gray-100 rounded-lg"><BookOpen className="w-5 h-5 text-gray-700" /></div>
                        <div>
                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Palavra:</p>
                            <p className="text-[10px] font-extrabold text-gray-800">{stat.palavra || ''}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center gap-3" style={{ borderLeft: '4px solid #9ca3af' }}>
                        <div className="p-2 bg-gray-100 rounded-lg"><PenLine className="w-5 h-5 text-gray-700" /></div>
                        <div>
                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Enc. Reg.: Ir. {encRegional?.name || '-'}</p>
                            <p className="text-[8px] text-gray-400">LOCALIDADE: {encRegional?.city ? `${encRegional.city} - ${encRegional.state}` : '-'}</p>
                        </div>
                    </div>
                </section>

                {/* Two Column Content */}
                <div className="flex gap-4 flex-1 overflow-hidden mt-3">

                    {/* Left Column (Instrument List & Hinos) */}
                    <aside className="w-[45%] flex flex-col gap-3">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col flex-shrink-0">
                            <div className="bg-gray-200 text-center py-2 border-b border-gray-300 shrink-0">
                                <h2 className="text-[10px] font-black text-gray-800 uppercase leading-tight">FORMAÇÃO ORQUESTRAL - DETALHAMENTO</h2>
                            </div>
                            <div className="text-[9px]">
                                {tableRows.map((row, idx) => {
                                    if (row.isHeader) {
                                        return (
                                            <div key={idx} className="font-bold px-2 py-0.5 uppercase border-b border-gray-300 text-[9px]" style={{ backgroundColor: row.bg, color: row.text }}>
                                                {row.name}
                                            </div>
                                        );
                                    }
                                    return (
                                        <div key={idx} className="flex items-center px-2 py-[2px] border-b border-gray-100" style={{ backgroundColor: row.bg }}>
                                            <div className="w-[45%] truncate font-medium text-gray-800">{row.name}</div>
                                            <div className="w-[40%] flex items-center h-full overflow-hidden">
                                                {row.count !== null && row.count > 0 && (
                                                    <div
                                                        className="h-2.5 border shadow-sm"
                                                        style={{
                                                            backgroundColor: row.barColor,
                                                            borderColor: 'rgba(0,0,0,0.2)',
                                                            width: `${Math.max((row.count / maxInstCount) * 100, 2)}%`,
                                                        }}
                                                    />
                                                )}
                                                {row.count === 0 && <div className="h-2.5 w-0.5 bg-red-600" />}
                                            </div>
                                            <div className="w-[15%] text-right font-medium text-gray-800">{row.count}</div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="bg-gray-800 text-white font-bold py-1.5 px-3 text-[10px] flex justify-between">
                                <span>TOTAL</span>
                                <span>{ft.total}</span>
                            </div>
                        </div>

                        {/* Músicos e Organistas Table */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col flex-shrink-0">
                            <div className="bg-gray-200 text-center py-2 border-b border-gray-300 shrink-0">
                                <h2 className="text-[10px] font-black text-gray-800 uppercase leading-tight">ORGANISTAS E MÚSICOS</h2>
                            </div>
                            <div className="flex flex-col text-[10px]">
                                <div className="flex items-center border-b border-gray-100 bg-white">
                                    <div className="w-[15%] py-1 font-bold text-center border-r border-gray-100">{stat.organistas || 0}</div>
                                    <div className="w-[85%] py-1 px-3 font-medium">Organistas</div>
                                </div>
                                <div className="flex items-center bg-white">
                                    <div className="w-[15%] py-1 font-bold text-center border-r border-gray-100">{stat.musicos || 0}</div>
                                    <div className="w-[85%] py-1 px-3 font-medium">Músicos</div>
                                </div>
                                <div className="bg-gray-800 text-white font-bold py-1.5 px-3 text-[10px] flex justify-between">
                                    <span>TOTAL</span>
                                    <span>{mt.musicosOrganistas}</span>
                                </div>
                            </div>
                        </div>

                        {/* Hinos Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col flex-shrink-0">
                            <div className="bg-gray-200 text-center py-2 border-b border-gray-300 shrink-0">
                                <h2 className="text-[10px] font-black text-gray-800 uppercase leading-tight">HINOS</h2>
                            </div>
                            <div className="flex flex-col text-[10px]">
                                <div className="flex items-center border-b border-gray-100 bg-white">
                                    <div className="w-[15%] py-1.5 font-bold text-center border-r border-gray-100">1</div>
                                    <div className="w-[85%] py-1.5 px-3 font-medium">Abertura: <span className="font-bold">{stat.hino_abertura || '-'}</span></div>
                                </div>
                                <div className="flex items-center bg-white">
                                    <div className="w-[15%] py-1.5 font-bold text-center border-r border-gray-100">{stat.hinos_ensaiados || 0}</div>
                                    <div className="w-[85%] py-1.5 px-3 font-medium">Hinos Ensaiados</div>
                                </div>
                            </div>
                        </div>

                        {/* Bar Chart Real vs Ideal */}
                        <div className="bg-white rounded-xl p-2 shadow-sm border border-gray-100 flex flex-col flex-1 min-h-[140px] items-center">
                            <p className="text-[9px] font-black text-gray-600 mb-1 text-center uppercase">TOTAL DE MÚSICOS POR CATEGORIA</p>
                            <div className="w-full flex-1 flex items-center justify-center -ml-4 mt-2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={rechartsPctData} margin={{ top: 12, right: 0, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 8, fontWeight: 600 }} dy={5} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 8 }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                                        <Bar isAnimationActive={false} dataKey="real" fill="#475569" radius={[2, 2, 0, 0]} maxBarSize={30} label={{ position: 'top', fill: '#475569', fontSize: 8, fontWeight: 'bold', formatter: (v: any) => v > 0 ? `${v}%` : '' }}>
                                            {rechartsPctData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                                        </Bar>
                                        <Line isAnimationActive={false} type="monotone" dataKey="ideal" stroke="#0f172a" strokeWidth={0} dot={<TargetMarker />} activeDot={false} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                    </aside>

                    {/* Right Column (Dashboard) */}
                    <main className="w-[55%] flex flex-col gap-4">
                        <div className="bg-gray-200 text-center py-2 border border-gray-300 rounded-lg shrink-0">
                            <h2 className="text-[10px] font-black text-gray-700 uppercase leading-tight">Dashboard de Análise</h2>
                        </div>

                        {/* Dashboard Grid (4 Cards) */}
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { title: 'CORDAS', color: CCB.gold, textColor: '#6b7280', pct: cordasPct, total: ft.cordas, ideal: '50%' },
                                { title: 'MADEIRAS', color: CCB.blueLight, textColor: CCB.blueLight, pct: madeirasPct, total: ft.madeiras, ideal: '25%' },
                                { title: 'METAIS', color: CCB.green, textColor: CCB.green, pct: metaisPct, total: ft.metais, ideal: '25%' },
                                { title: 'ACORDEON', color: CCB.gray, textColor: CCB.gray, pct: acordeonPct, total: ft.acordeon, ideal: '-' },
                            ].map(c => (
                                <div key={c.title} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 relative overflow-hidden" style={{ borderTop: `4px solid ${c.color}` }}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-[9px] font-black" style={{ color: c.textColor }}>{c.title}</p>
                                            <p className="text-[7px] text-gray-400 mt-1">Total</p>
                                            <p className="text-2xl font-black text-gray-800 leading-none">{c.total}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-black text-gray-800">{c.pct > 0 || c.title !== 'ACORDEON' ? `${c.pct}%` : '-'}</p>
                                            <p className="text-[7px] font-bold text-gray-400">Ideal: {c.ideal}</p>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                                        <div className="h-1.5 rounded-full" style={{ width: `${Math.min(c.pct, 100)}%`, backgroundColor: c.color }} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pessoal Adicional */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col flex-1 min-h-0">
                            <div className="bg-white text-center py-2 border-b border-gray-100 shrink-0">
                                <h2 className="text-[11px] font-black text-gray-800 uppercase leading-tight">PESSOAL ADICIONAL</h2>
                            </div>

                            <div className="flex-1 overflow-y-auto text-[9px] bg-white">
                                <div className="bg-gray-800 text-white text-[9px] font-bold px-3 py-1.5 uppercase text-center">Ministério</div>
                                <div className="flex flex-col">
                                    {ministryItems.filter(m => !['Encarregados', 'Examinadoras', 'Instrutores'].some(kw => m.name.includes(kw))).map((item, idx) => (
                                        <div key={idx} className="flex flex-row items-center border-b border-gray-100 px-3 py-1.5">
                                            <span className="font-black text-gray-800 mr-2">{item.value}</span>
                                            <span className="text-gray-700">{item.name}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-gray-800 text-white text-[9px] font-bold px-3 py-1.5 uppercase text-center mt-3">Encarregados Musicais</div>
                                <div className="flex flex-col">
                                    {ministryItems.filter(m => ['Encarregados', 'Examinadoras', 'Instrutores'].some(kw => m.name.includes(kw))).map((item, idx) => (
                                        <div key={idx} className="flex flex-row items-center border-b border-gray-100 px-3 py-1.5">
                                            <span className="font-black text-gray-800 mr-2">{item.value}</span>
                                            <span className="text-gray-700">{item.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Totals Column */}
                        <div className="flex flex-col gap-2 mt-auto">
                            {/* Footer Total Large */}
                            <div className="rounded-xl p-3 flex items-center justify-between text-white shadow-md" style={{ backgroundColor: CCB.blueDark }}>
                                <div className="flex items-center gap-3">
                                    <div className="opacity-50">
                                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path></svg>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold tracking-widest uppercase text-gray-300">Total Geral:</p>
                                        <h3 className="text-4xl font-black leading-none mt-0.5">{mt.totalGeral}</h3>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Totals */}
                            <div className="grid grid-cols-1 gap-1.5">
                                <div className="bg-white rounded-full px-4 py-1.5 shadow-sm border border-gray-100 flex items-center justify-between" style={{ borderLeft: `4px solid ${CCB.blueLight}` }}>
                                    <span className="text-[9px] font-black text-gray-700 uppercase">Músicos + Organistas:</span>
                                    <span className="text-white px-3 py-0.5 rounded-full text-sm font-black" style={{ backgroundColor: CCB.blueDark }}>{mt.musicosOrganistas}</span>
                                </div>
                                <div className="bg-white rounded-full px-4 py-1.5 shadow-sm border border-gray-100 flex items-center justify-between" style={{ borderLeft: `4px solid ${CCB.blueLight}` }}>
                                    <span className="text-[9px] font-black text-gray-700 uppercase">Total Geral:</span>
                                    <span className="text-white px-3 py-0.5 rounded-full text-sm font-black" style={{ backgroundColor: CCB.blueDark }}>{mt.totalGeral}</span>
                                </div>
                            </div>
                        </div>

                    </main>
                </div>

                {/* Export Footer Info */}
                <footer className="flex justify-between items-center text-[9px] font-bold text-gray-400 pt-2 border-t border-gray-200 mt-auto">
                    <p>TEMPLATE DE EXPORTAÇÃO v1.2</p>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-gray-400" />
                        <span>sistema</span>
                    </div>
                </footer>
            </div>
        </div>
    );
});

export default PdfExportTemplate;
