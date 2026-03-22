import React, { forwardRef } from 'react';
import { BookOpen, Mic, PenLine, Users } from 'lucide-react';
import { PieChart, Pie, Cell } from 'recharts';
import { EventStatistic, Congregation, Anciao, STAT_INSTRUMENTS, MINISTRY_FIELDS } from '../types';
import { calcFamilyTotals, calcMinistryTotals } from '../utils/orchestraCalculations';

interface PdfExportTemplateProps {
    stat: EventStatistic;
    congregation?: Congregation | null;
    anciao?: Anciao | null;
}

export const PdfExportTemplate = forwardRef<HTMLDivElement, PdfExportTemplateProps>(({ stat, congregation, anciao }, ref) => {
    const ft = calcFamilyTotals(stat);
    const mt = calcMinistryTotals(stat);

    const eventDate = new Date(stat.event_date + 'T00:00:00');
    const day = String(eventDate.getDate()).padStart(2, '0');
    const month = eventDate.toLocaleDateString('pt-BR', { month: 'long' });
    const year = eventDate.getFullYear();
    const eventDateFormatted = `${day} DE ${month.toUpperCase()} DE ${year} - (Estatística Extraoficial)`.toUpperCase();

    const totalInstruments = ft.total || 1;
    const cordasPct = Math.round((ft.cordas / totalInstruments) * 100);
    const madeirasPct = Math.round((ft.madeiras / totalInstruments) * 100);
    const metaisPct = Math.round((ft.metais / totalInstruments) * 100);
    const acordeonPct = Math.round((ft.acordeon / totalInstruments) * 100);

    const allInstKeys = [...STAT_INSTRUMENTS.cordas, ...STAT_INSTRUMENTS.madeiras, ...STAT_INSTRUMENTS.metais, ...STAT_INSTRUMENTS.acordeon];
    const maxInstCount = Math.max(1, ...allInstKeys.map(i => Number((stat as any)[i.key]) || 0));

    type RowData = { name: string; count: number | null; isHeader: boolean; bg: string; text?: string; barColor: string };
    const tableRows: RowData[] = [];

    const addFamily = (label: string, total: number, bg: string, barColor: string, text: string, instruments: readonly { key: string; label: string }[]) => {
        tableRows.push({ name: label, count: total, isHeader: true, bg, text, barColor: '' });
        instruments.forEach((inst) => {
            const count = Number((stat as any)[inst.key]) || 0;
            tableRows.push({ name: inst.label, count, isHeader: false, bg: 'bg-white', barColor });
        });
    };

    const colorCordas = '#c5a871';
    const colorMadeiras = '#132863';
    const colorMetais = '#135c2f';
    const colorAcordeon = '#8f1518';

    addFamily('CORDAS', ft.cordas, 'bg-[#c5a871]', 'bg-[#c5a871]', 'text-white', STAT_INSTRUMENTS.cordas);
    addFamily('MADEIRAS', ft.madeiras, 'bg-[#132863]', 'bg-[#132863]', 'text-white', STAT_INSTRUMENTS.madeiras);
    addFamily('METAIS', ft.metais, 'bg-[#135c2f]', 'bg-[#135c2f]', 'text-white', STAT_INSTRUMENTS.metais);
    addFamily('ACORDEON', ft.acordeon, 'bg-[#8f1518]', 'bg-[#8f1518]', 'text-white', STAT_INSTRUMENTS.acordeon);

    const encRegional = stat.enc_regionais && stat.enc_regionais.length > 0 ? stat.enc_regionais[0] : null;

    const donutData = [
        { name: 'CORDAS', value: ft.cordas, fill: colorCordas },
        { name: 'MADEIRAS', value: ft.madeiras, fill: colorMadeiras },
        { name: 'METAIS', value: ft.metais, fill: colorMetais },
        { name: 'ACORDEON', value: ft.acordeon, fill: colorAcordeon },
    ].filter(d => d.value > 0);

    const ministryItems = MINISTRY_FIELDS.map(f => ({
        name: f.label.replace('Presentes', '').replace('Música', 'da Música').trim(),
        value: Number((stat as any)[f.key]) || 0,
    }));

    return (
        <div className="fixed left-[-9999px] top-[-9999px] overflow-hidden bg-white" style={{ zIndex: -9999 }}>
            <div
                ref={ref}
                id="pdf-export-template"
                className="a4-page relative"
                style={{ width: '794px', height: '1123px', padding: '32px 34px', boxSizing: 'border-box', backgroundColor: 'white', overflow: 'hidden' }}
            >
                {/* Dotted background */}
                <div
                    className="absolute inset-0 z-0 opacity-40 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(#94a3b8 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}
                />

                {/* Content */}
                <div className="relative z-10 w-full h-full flex flex-col" style={{ gap: '10px' }}>

                    {/* ── Header ── */}
                    <header className="text-center py-2.5 bg-white/95 rounded-2xl shadow-sm border border-gray-100 shrink-0">
                        <h1 className="text-[24px] font-black tracking-tight leading-none" style={{ color: '#272f3d' }}>CONGREGAÇÃO CRISTÃ NO BRASIL</h1>
                        <p className="text-[11px] font-bold text-gray-600 mt-1 uppercase">{congregation?.name || ''} - {congregation?.city || ''} / {congregation?.state || ''}</p>
                        <p className="text-[9px] font-bold text-gray-500 uppercase mt-0.5">ESTATÍSTICA - ENSAIO REGIONAL</p>
                        <p className="text-[8px] uppercase font-bold text-gray-400 mt-0.5">{eventDateFormatted}</p>
                    </header>

                    {/* ── Presidency Pills ── */}
                    <section className="grid grid-cols-3 gap-2 shrink-0">
                        {[
                            { icon: <Mic className="w-3.5 h-3.5 text-gray-600" />, l1: `Ancião: Ir. ${anciao?.name || ''}`, l2: `LOCALIDADE: ${congregation?.city} - ${congregation?.state}` },
                            { icon: <BookOpen className="w-3.5 h-3.5 text-gray-600" />, l1: 'Palavra:', l2: (stat.palavra || '') },
                            { icon: <PenLine className="w-3.5 h-3.5 text-gray-600" />, l1: `Enc. Reg.: Ir. ${encRegional?.name || '-'}`, l2: `LOCALIDADE: ${encRegional?.city ? `${encRegional.city} - ${encRegional.state}` : '-'}` },
                        ].map((p, i) => (
                            <div key={i} className="bg-white rounded-full py-1 px-2 shadow-sm border border-gray-200 flex items-center gap-1.5">
                                <div className="p-1.5 bg-gray-50 rounded-full border border-gray-200 shrink-0">{p.icon}</div>
                                <div className="flex flex-col overflow-hidden">
                                    <p className="text-[8px] font-black text-gray-600 uppercase truncate">{p.l1}</p>
                                    <p className="text-[7px] font-bold text-gray-400 uppercase truncate">{p.l2}</p>
                                </div>
                            </div>
                        ))}
                    </section>

                    {/* ── Hinos ── */}
                    <section className="flex gap-2 shrink-0">
                        <div className="flex items-stretch bg-white rounded-lg overflow-hidden w-56 shadow-sm border border-gray-200">
                            <div className="bg-gray-200 px-2.5 py-1.5 flex items-center border-r border-gray-200">
                                <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Hino Abertura</span>
                            </div>
                            <div className="flex-1 flex items-center justify-center">
                                <span className="text-lg font-black text-gray-900">{stat.hino_abertura || ''}</span>
                            </div>
                        </div>
                        <div className="flex items-stretch bg-white rounded-lg overflow-hidden flex-1 shadow-sm border border-gray-200">
                            <div className="bg-gray-200 px-2.5 py-1.5 flex items-center border-r border-gray-200">
                                <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Hinos Ensaiados</span>
                            </div>
                            <div className="flex-1 flex items-center justify-center">
                                <span className="text-lg font-black text-gray-900">{stat.hinos_ensaiados || ''}</span>
                            </div>
                        </div>
                    </section>

                    {/* ── Two-Column Body ── */}
                    <div className="flex gap-3 flex-1 overflow-hidden min-h-0">

                        {/* LEFT – instrument list */}
                        <aside className="w-[42%] flex flex-col min-h-0">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
                                <div className="bg-gray-100 text-center py-2 border-b border-gray-300 shrink-0">
                                    <h2 className="text-[11px] font-black text-gray-700 uppercase tracking-wide">VISÃO GERAL DA ORQUESTRA</h2>
                                </div>
                                <div className="flex-1 pt-0.5 px-1 flex flex-col gap-0 overflow-hidden">
                                    {tableRows.map((row, idx) => {
                                        if (row.isHeader) {
                                            return (
                                                <div key={`h-${idx}`} className={`${row.bg} ${row.text} font-black px-2 py-[1.5px] uppercase mt-[3px]`} style={{ fontSize: '8px', letterSpacing: '0.05em' }}>
                                                    {row.name}
                                                </div>
                                            );
                                        }
                                        const pct = row.count && row.count > 0 ? Math.max((row.count / maxInstCount) * 100, 3) : 0;
                                        return (
                                            <div key={`r-${idx}`} className="flex items-center px-1 py-[1px]">
                                                <div className="shrink-0 truncate font-semibold text-gray-700 uppercase" style={{ fontSize: '7.5px', width: '38%' }}>{row.name}</div>
                                                {/* bar container with overflow hidden so it never bleeds */}
                                                <div className="overflow-hidden flex items-center" style={{ width: '47%', height: '7px' }}>
                                                    {pct > 0 && <div className={row.barColor} style={{ height: '7px', width: `${pct}%`, minWidth: '2px' }} />}
                                                    {row.count === 0 && <div className="bg-red-600" style={{ height: '7px', width: '2px' }} />}
                                                </div>
                                                <div className="text-right font-bold text-gray-600" style={{ fontSize: '8.5px', width: '15%' }}>
                                                    {row.count ? row.count : ''}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </aside>

                        {/* RIGHT – dashboard */}
                        <main className="w-[58%] flex flex-col min-h-0" style={{ gap: '8px' }}>
                            <h2 className="text-[9px] font-black text-gray-800 uppercase tracking-widest text-center flex justify-center items-center gap-3 shrink-0">
                                <span className="h-px bg-gray-300 flex-1" />DASHBOARD DE ANÁLISE<span className="h-px bg-gray-300 flex-1" />
                            </h2>

                            {/* 4 family cards */}
                            <div className="grid grid-cols-2 gap-2 shrink-0">
                                {[
                                    { title: 'CORDAS', color: colorCordas, pct: cordasPct, total: ft.cordas, ideal: '50%' },
                                    { title: 'MADEIRAS', color: colorMadeiras, pct: madeirasPct, total: ft.madeiras, ideal: '25%' },
                                    { title: 'METAIS', color: colorMetais, pct: metaisPct, total: ft.metais, ideal: '25%' },
                                    { title: 'ACORDEON', color: colorAcordeon, pct: acordeonPct, total: ft.acordeon, ideal: '-' }
                                ].map(c => (
                                    <div key={c.title} className="bg-white rounded-xl p-2.5 shadow-sm border border-gray-200 flex flex-col justify-between" style={{ minHeight: '72px' }}>
                                        <div className="flex justify-between">
                                            <div className="flex flex-col">
                                                <span className="font-black tracking-widest uppercase" style={{ fontSize: '8px', color: c.color }}>{c.title}</span>
                                                <span className="font-bold text-gray-400 uppercase" style={{ fontSize: '7px' }}>Total</span>
                                                <span className="font-black text-gray-900 leading-none tracking-tight" style={{ fontSize: '24px' }}>{c.total}</span>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="font-black text-gray-800 leading-none" style={{ fontSize: '20px' }}>{c.pct > 0 || c.title !== 'ACORDEON' ? `${c.pct}%` : '-'}</span>
                                                <span className="font-bold text-gray-400 uppercase mt-0.5" style={{ fontSize: '7px' }}>Ideal: {c.ideal}</span>
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full overflow-hidden mt-1" style={{ height: '6px' }}>
                                            <div className="h-full rounded-full" style={{ width: `${Math.min(c.pct, 100)}%`, backgroundColor: c.color }} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Donut + Personnel */}
                            <div className="flex gap-2 flex-1 min-h-0 overflow-hidden">
                                {/* Donut */}
                                <div className="bg-white rounded-xl px-1.5 py-2 shadow-sm border border-gray-200 flex flex-col items-center w-[38%]">
                                    <h3 className="font-black text-gray-500 uppercase text-center tracking-widest" style={{ fontSize: '7.5px' }}>TOTAL DE MÚSICOS<br />POR CATEGORIA</h3>
                                    <div className="flex-1 w-full relative flex items-center justify-center">
                                        <PieChart width={110} height={110}>
                                            <Pie data={donutData} cx={55} cy={55} innerRadius={34} outerRadius={50} stroke="none" dataKey="value" isAnimationActive={false}>
                                                {donutData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                                            </Pie>
                                        </PieChart>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="font-black text-gray-900 leading-none" style={{ fontSize: '22px' }}>{ft.total}</span>
                                            <span className="font-bold text-gray-500 uppercase" style={{ fontSize: '6px' }}>Total</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1">
                                        {[{ c: colorCordas, l: 'Cordas' }, { c: colorMadeiras, l: 'Madeiras' }, { c: colorMetais, l: 'Metais' }, { c: colorAcordeon, l: 'Acordeon' }].map(lg => (
                                            <div key={lg.l} className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-sm" style={{ backgroundColor: lg.c }} /><span className="font-bold text-gray-500 uppercase" style={{ fontSize: '6.5px' }}>{lg.l}</span></div>
                                        ))}
                                    </div>
                                </div>

                                {/* Personnel */}
                                <div className="bg-white rounded-xl p-2 shadow-sm border border-gray-200 flex flex-col w-[62%] justify-between overflow-hidden">
                                    <h3 className="font-black text-gray-600 uppercase text-center tracking-widest flex items-center justify-center gap-1 shrink-0" style={{ fontSize: '8px' }}>
                                        <span className="h-px bg-gray-200 flex-1" />PESSOAL ADICIONAL<span className="h-px bg-gray-200 flex-1" />
                                    </h3>

                                    <div className="flex gap-1.5 mt-1 shrink-0">
                                        <div className="flex-1 bg-white rounded-lg py-1 text-center border border-gray-200 shadow-sm">
                                            <p className="font-black text-gray-600 uppercase" style={{ fontSize: '8px' }}>Músicos</p>
                                            <p className="font-black text-gray-900" style={{ fontSize: '20px', lineHeight: 1 }}>{stat.musicos || 0}</p>
                                        </div>
                                        <div className="flex-1 bg-white rounded-lg py-1 text-center border border-gray-200 shadow-sm">
                                            <p className="font-black text-gray-600 uppercase" style={{ fontSize: '8px' }}>Organistas</p>
                                            <p className="font-black text-gray-900" style={{ fontSize: '20px', lineHeight: 1 }}>{stat.organistas || 0}</p>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-lg py-1 text-center border border-gray-200 shadow-sm mt-1 flex items-center justify-center gap-1.5 shrink-0">
                                        <Users className="w-3.5 h-3.5 text-gray-500" />
                                        <div>
                                            <p className="font-black text-gray-600 uppercase leading-none" style={{ fontSize: '8px' }}>Músicos + Organistas</p>
                                            <p className="font-black text-gray-900 leading-none mt-0.5" style={{ fontSize: '20px' }}>{mt.musicosOrganistas}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-1 mt-1 flex-1 items-stretch overflow-hidden">
                                        {ministryItems.map((item, idx) => (
                                            <div key={idx} className="bg-white rounded-md py-0.5 text-center border border-gray-200 shadow-sm flex flex-col justify-between">
                                                <p className="font-bold text-gray-600 uppercase px-0.5 leading-tight flex items-center justify-center" style={{ fontSize: '6px', minHeight: '16px' }}>{item.name}</p>
                                                <p className="font-black text-gray-900 leading-none" style={{ fontSize: '13px' }}>{item.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Bottom totals */}
                            <div className="flex items-stretch gap-2 shrink-0" style={{ height: '58px' }}>
                                <div className="bg-[#1f2937] rounded-xl p-2.5 flex items-center text-white shadow-md w-[42%]">
                                    <Users className="w-7 h-7 opacity-80 shrink-0" />
                                    <div className="flex flex-col ml-2">
                                        <span className="font-black tracking-widest uppercase text-gray-300" style={{ fontSize: '8px' }}>Total Geral:</span>
                                        <span className="font-black leading-none tracking-tight" style={{ fontSize: '36px' }}>{mt.totalGeral}</span>
                                    </div>
                                </div>
                                <div className="w-[58%] flex flex-col gap-1 justify-between">
                                    <div className="flex-1 bg-white rounded-full px-2.5 flex items-center justify-between shadow-sm border border-gray-200" style={{ borderLeftWidth: '4px', borderLeftColor: '#132863' }}>
                                        <span className="font-black text-gray-600 uppercase tracking-wider" style={{ fontSize: '8.5px' }}>MÚSICOS + ORG.:</span>
                                        <div className="bg-[#1f2937] text-white px-2.5 py-[1px] rounded-full font-black leading-none" style={{ fontSize: '13px' }}>{mt.musicosOrganistas}</div>
                                    </div>
                                    <div className="flex-1 bg-white rounded-full px-2.5 flex items-center justify-between shadow-sm border border-gray-200" style={{ borderLeftWidth: '4px', borderLeftColor: '#132863' }}>
                                        <span className="font-black text-gray-600 uppercase tracking-wider" style={{ fontSize: '8.5px' }}>TOTAL INSTRUMENTOS:</span>
                                        <div className="bg-[#1f2937] text-white px-2.5 py-[1px] rounded-full font-black leading-none" style={{ fontSize: '13px' }}>{ft.total}</div>
                                    </div>
                                </div>
                            </div>
                        </main>
                    </div>

                    {/* ── Footer ── */}
                    <footer className="flex justify-between items-center text-[9px] font-bold text-gray-400 pt-1.5 border-t border-gray-300 mt-auto shrink-0">
                        <p>TEMPLATE DE EXPORTAÇÃO v1.2</p>
                        <div className="flex items-center gap-1 opacity-80">
                            <div className="w-2 h-2 rounded-full bg-gray-400" />
                            <span className="font-bold">sistema</span>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );
});

export default PdfExportTemplate;
