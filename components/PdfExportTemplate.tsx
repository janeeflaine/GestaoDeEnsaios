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

    // Extract formatted date 
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
    const maxInstCount = Math.max(1, ...allInstKeys.map(i => (stat as any)[i.key] || 0));

    type RowData = { name: string; count: number | null; isHeader: boolean; bg: string; text?: string; barColor: string };
    const tableRows: RowData[] = [];

    const addFamily = (label: string, total: number, bg: string, barColor: string, text: string, instruments: readonly { key: string; label: string }[]) => {
        tableRows.push({ name: label, count: total, isHeader: true, bg, text, barColor: '' });
        instruments.forEach((inst) => {
            const count = (stat as any)[inst.key] || 0;
            // Use white backgrounds for normal rows to let the bar pop
            tableRows.push({ name: inst.label, count, isHeader: false, bg: 'bg-white', barColor });
        });
    };

    // Specific colors match Photo 2
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
        value: (stat as any)[f.key] || 0,
    }));

    return (
        <div className="fixed left-[-9999px] top-[-9999px] overflow-hidden bg-white" style={{ zIndex: -9999 }}>
            <div
                ref={ref}
                id="pdf-export-template"
                className="a4-page relative overflow-hidden"
                style={{ width: '794px', height: '1123px', padding: '38px', boxSizing: 'border-box', backgroundColor: 'white' }}
            >
                {/* Dotted background pattern spanning the entire A4 area securely */}
                <div
                    className="absolute inset-0 z-0 opacity-40 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(#94a3b8 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}
                ></div>

                {/* Content Overlay */}
                <div className="relative z-10 w-full h-full flex flex-col gap-5">

                    {/* Header */}
                    <header className="text-center py-4 bg-white/95 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
                        <h1 className="text-3xl font-black text-gray-800 tracking-tight" style={{ color: '#272f3d' }}>CONGREGAÇÃO CRISTÃ NO BRASIL</h1>
                        <p className="text-sm font-bold text-gray-600 mt-1 uppercase">{(congregation?.name || '')} - {congregation?.city || ''} / {congregation?.state || ''}</p>
                        <p className="text-[11px] font-bold text-gray-500 uppercase mt-0.5">ESTATÍSTICA - ENSAIO REGIONAL</p>
                        <p className="text-[10px] uppercase font-bold text-gray-400 mt-1">{eventDateFormatted}</p>
                    </header>

                    {/* Presidency Section (Top 3 rounded pills) */}
                    <section className="grid grid-cols-3 gap-4">
                        {/* Ancião */}
                        <div className="bg-white rounded-full py-1.5 px-2 shadow-sm border border-gray-200 flex items-center gap-3">
                            <div className="p-2.5 bg-gray-50 rounded-full border border-gray-200 shrink-0">
                                <Mic className="w-5 h-5 text-gray-600" />
                            </div>
                            <div className="flex flex-col justify-center overflow-hidden">
                                <p className="text-[9.5px] font-black text-gray-600 uppercase truncate">Ancião: Ir. {anciao?.name || ''}</p>
                                <p className="text-[8px] font-bold text-gray-400 uppercase truncate">LOCALIDADE: {congregation?.city} - {congregation?.state}</p>
                            </div>
                        </div>

                        {/* Palavra */}
                        <div className="bg-white rounded-full py-1.5 px-2 shadow-sm border border-gray-200 flex items-center gap-3">
                            <div className="p-2.5 bg-gray-50 rounded-full border border-gray-200 shrink-0">
                                <BookOpen className="w-5 h-5 text-gray-600" />
                            </div>
                            <div className="flex flex-col justify-center overflow-hidden">
                                <p className="text-[9px] font-bold text-gray-400 uppercase truncate mb-0.5">Palavra:</p>
                                <p className="text-[11px] font-black text-gray-800 uppercase truncate">{(stat.palavra || '')}</p>
                            </div>
                        </div>

                        {/* Enc Regional */}
                        <div className="bg-white rounded-full py-1.5 px-2 shadow-sm border border-gray-200 flex items-center gap-3">
                            <div className="p-2.5 bg-gray-50 rounded-full border border-gray-200 shrink-0">
                                <PenLine className="w-5 h-5 text-gray-600" />
                            </div>
                            <div className="flex flex-col justify-center overflow-hidden">
                                <p className="text-[9.5px] font-black text-gray-600 uppercase truncate">Enc. Reg.: Ir. {encRegional?.name || '-'}</p>
                                <p className="text-[8px] font-bold text-gray-400 uppercase truncate">LOCALIDADE: {encRegional?.city ? `${encRegional.city} - ${encRegional.state}` : '-'}</p>
                            </div>
                        </div>
                    </section>

                    {/* Hinos Section */}
                    <section className="flex gap-4">
                        <div className="flex items-stretch bg-white rounded-lg overflow-hidden w-64 shadow-sm border border-gray-200">
                            <div className="bg-gray-200 px-4 py-3 flex items-center justify-center border-r border-gray-200">
                                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Hino Abertura</span>
                            </div>
                            <div className="flex-1 flex items-center justify-center">
                                <span className="text-2xl font-black text-gray-900">{stat.hino_abertura || ''}</span>
                            </div>
                        </div>
                        <div className="flex items-stretch bg-white rounded-lg overflow-hidden flex-1 shadow-sm border border-gray-200">
                            <div className="bg-gray-200 px-4 py-3 flex items-center justify-center border-r border-gray-200">
                                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Hinos Ensaiados</span>
                            </div>
                            <div className="flex-1 flex items-center justify-center">
                                <span className="text-2xl font-black text-gray-900">{stat.hinos_ensaiados || ''}</span>
                            </div>
                        </div>
                    </section>

                    {/* Two Column Content */}
                    <div className="flex gap-5 flex-1 overflow-hidden">

                        {/* Left Column (Instrument List) */}
                        <aside className="w-[42%] flex flex-col gap-3 min-h-0">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden pb-1">
                                {/* Table Header */}
                                <div className="bg-gray-100 text-center py-2.5 border-b border-gray-300">
                                    <h2 className="text-[12px] font-black text-gray-700 uppercase tracking-wide">VISÃO GERAL DA ORQUESTRA</h2>
                                </div>

                                {/* Table Body */}
                                <div className="flex-1 text-[10px] pt-1 px-1 flex flex-col gap-[1px]">
                                    {tableRows.map((row, idx) => {
                                        if (row.isHeader) {
                                            return (
                                                <div key={`head-${idx}`} className={`${row.bg} ${row.text} font-black px-2 py-[2px] uppercase mt-1 mb-[1px]`} style={{ letterSpacing: '0.05em' }}>
                                                    {row.name}
                                                </div>
                                            );
                                        }
                                        return (
                                            <div key={`row-${idx}`} className={`flex items-center px-2 py-[2px] ${row.bg}`}>
                                                <div className="w-[35%] truncate font-semibold text-gray-700 uppercase" style={{ fontSize: '9px' }}>{row.name}</div>
                                                <div className="w-[50%] flex items-center h-full px-1">
                                                    {row.count !== null && row.count > 0 && (
                                                        <div
                                                            className={`${row.barColor}`}
                                                            style={{ height: '8px', width: `${Math.max((row.count / maxInstCount) * 100, 2)}%` }}
                                                        ></div>
                                                    )}
                                                    {row.count === 0 && (
                                                        <div className="bg-red-600" style={{ height: '8px', width: '2px' }}></div>
                                                    )}
                                                </div>
                                                <div className="w-[15%] text-right font-bold text-gray-600" style={{ fontSize: '10px' }}>
                                                    {row.count === null || row.count === 0 ? '' : row.count}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </aside>

                        {/* Right Column (Dashboard) */}
                        <main className="w-[58%] flex flex-col gap-4 min-h-0">
                            <h2 className="text-[11px] font-black text-gray-800 uppercase tracking-widest text-center relative flex justify-center items-center gap-4">
                                <span className="h-px bg-gray-300 flex-1"></span>
                                DASHBOARD DE ANÁLISE
                                <span className="h-px bg-gray-300 flex-1"></span>
                            </h2>

                            {/* Dashboard Grid (4 Cards) */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Func to render cards exactly like photo 2 */}
                                {[
                                    { title: 'CORDAS', color: colorCordas, pct: cordasPct, total: ft.cordas, ideal: '50%' },
                                    { title: 'MADEIRAS', color: colorMadeiras, pct: madeirasPct, total: ft.madeiras, ideal: '25%' },
                                    { title: 'METAIS', color: colorMetais, pct: metaisPct, total: ft.metais, ideal: '25%' },
                                    { title: 'ACORDEON', color: colorAcordeon, pct: acordeonPct, total: ft.acordeon, ideal: '-' }
                                ].map(c => (
                                    <div key={c.title} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 flex flex-col justify-between" style={{ minHeight: '105px' }}>
                                        <div className="flex justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black tracking-widest uppercase" style={{ color: c.color }}>{c.title}</span>
                                                <span className="text-[8px] font-bold text-gray-400 uppercase mt-0.5">Total</span>
                                                <span className="text-[34px] leading-none font-black text-gray-900 mt-1 tracking-tight">{c.total}</span>
                                            </div>
                                            <div className="flex flex-col items-end pt-1">
                                                <span className="text-[30px] leading-none font-black text-gray-800">{c.pct > 0 || c.title !== 'ACORDEON' ? `${c.pct}%` : '-'}</span>
                                                <span className="text-[8px] font-bold text-gray-400 mt-1 uppercase">Ideal: {c.ideal}</span>
                                            </div>
                                        </div>
                                        {/* Colored Progress Bar spanning bottom left */}
                                        <div className="w-full bg-gray-100 h-2.5 rounded-full mt-auto mb-1 flex overflow-hidden">
                                            <div className="h-full rounded-full" style={{ width: `${Math.min(c.pct, 100)}%`, backgroundColor: c.color }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Lower Dashboard Section */}
                            <div className="flex gap-4 flex-1 min-h-0 mt-1">

                                {/* Category Donut */}
                                <div className="bg-white rounded-2xl px-2 py-4 shadow-sm border border-gray-200 flex flex-col items-center w-[40%]">
                                    <h3 className="text-[9px] font-black text-gray-500 uppercase text-center mb-2 tracking-widest">TOTAL DE MÚSICOS<br />POR CATEGORIA</h3>
                                    <div className="flex-1 w-full relative flex items-center justify-center">
                                        <PieChart width={150} height={150}>
                                            <Pie
                                                data={donutData}
                                                cx={75}
                                                cy={75}
                                                innerRadius={45}
                                                outerRadius={70}
                                                stroke="none"
                                                dataKey="value"
                                                isAnimationActive={false}
                                            >
                                                {donutData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                        {/* Center Text inside Donut */}
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-3xl font-black text-gray-900 leading-none">{ft.total}</span>
                                            <span className="text-[8px] font-bold text-gray-500 uppercase mt-0.5">Total</span>
                                        </div>
                                    </div>

                                    {/* Donut Legend */}
                                    <div className="w-full mt-4 flex justify-center">
                                        <div className="grid grid-cols-2 gap-x-5 gap-y-2">
                                            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: colorCordas }}></div><span className="text-[8px] font-bold text-gray-500 uppercase">Cordas</span></div>
                                            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: colorMadeiras }}></div><span className="text-[8px] font-bold text-gray-500 uppercase">Madeiras</span></div>
                                            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: colorMetais }}></div><span className="text-[8px] font-bold text-gray-500 uppercase">Metais</span></div>
                                            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: colorAcordeon }}></div><span className="text-[8px] font-bold text-gray-500 uppercase">Acordeon</span></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Personnel (Pessoal Adicional) */}
                                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 flex flex-col w-[60%] justify-between">
                                    <h3 className="text-[10px] font-black text-gray-600 uppercase text-center tracking-widest relative flex items-center justify-center gap-3">
                                        <span className="h-px bg-gray-200 flex-1"></span>
                                        PESSOAL ADICIONAL
                                        <span className="h-px bg-gray-200 flex-1"></span>
                                    </h3>

                                    <div className="flex gap-2 mt-4">
                                        <div className="flex-1 bg-white rounded-xl py-2 px-1 text-center border border-gray-200 shadow-sm flex flex-col justify-center">
                                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-wider">Músicos</p>
                                            <p className="text-3xl font-black text-gray-900 mt-1">{stat.musicos || 0}</p>
                                        </div>
                                        <div className="flex-1 bg-white rounded-xl py-2 px-1 text-center border border-gray-200 shadow-sm flex flex-col justify-center">
                                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-wider">Organistas</p>
                                            <p className="text-3xl font-black text-gray-900 mt-1">{stat.organistas || 0}</p>
                                        </div>
                                    </div>

                                    <div className="bg-white/50 rounded-xl py-2 px-3 text-center border border-gray-200 shadow-sm mt-2 flex flex-col items-center justify-center">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Users className="w-4 h-4 text-gray-500" />
                                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-wider">Músicos + Organistas</p>
                                        </div>
                                        <p className="text-[34px] font-black text-gray-900 leading-none">{mt.musicosOrganistas}</p>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 mt-3 flex-1 items-end">
                                        {ministryItems.map((item, idx) => (
                                            <div key={idx} className="bg-white rounded-xl py-2 text-center border border-gray-200 shadow-sm flex flex-col justify-center">
                                                <p className="text-[8px] font-bold text-gray-600 uppercase px-1 leading-tight h-[20px] flex items-center justify-center">{item.name}</p>
                                                <p className="text-xl font-black text-gray-900 leading-none mt-1">{item.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Final Row Totals (Like in Photo 2) */}
                            <div className="flex justify-between items-stretch gap-4 h-24 mb-1 mt-1">
                                {/* Total Geral Box */}
                                <div className="bg-[#1f2937] rounded-2xl p-4 flex items-center justify-between text-white shadow-md flex-1">
                                    <div className="flex items-center gap-4">
                                        <div className="opacity-80">
                                            <Users className="w-10 h-10" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-black tracking-widest uppercase text-gray-300">Total Geral:</span>
                                            <span className="text-[52px] font-black leading-none mt-[-2px] tracking-tight">{mt.totalGeral}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side breakdown (Musicos+Org vs Instruments) */}
                                <div className="w-[45%] flex flex-col gap-2 justify-between">
                                    <div className="flex-1 bg-white rounded-full px-5 flex items-center justify-between shadow-sm border border-gray-200 border-l-[6px] border-l-[#132863]">
                                        <span className="text-[11px] font-black text-gray-600 uppercase tracking-wider truncate">MÚSICOS + ORGANISTAS:</span>
                                        <div className="bg-[#1f2937] text-white px-4 py-1 rounded-full text-xl font-black leading-none shrink-0">{mt.musicosOrganistas}</div>
                                    </div>
                                    <div className="flex-1 bg-white rounded-full px-5 flex items-center justify-between shadow-sm border border-gray-200 border-l-[6px] border-l-[#132863]">
                                        <span className="text-[11px] font-black text-gray-600 uppercase tracking-wider truncate">TOTAL GERAL:</span>
                                        <div className="bg-[#1f2937] text-white px-4 py-1 rounded-full text-xl font-black leading-none shrink-0">{mt.totalGeral}</div>
                                    </div>
                                </div>
                            </div>

                        </main>
                    </div>

                    {/* Export Footer Info */}
                    <footer className="flex justify-between items-center text-[10px] font-bold text-gray-400 pt-2 border-t border-gray-300 mt-auto">
                        <p>TEMPLATE DE EXPORTAÇÃO v1.2</p>
                        <div className="flex items-center gap-1.5 opacity-80">
                            <div className="w-2.5 h-2.5 rounded-full bg-gray-400"></div>
                            <span className="font-bold">sistema</span>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );
});

export default PdfExportTemplate;
