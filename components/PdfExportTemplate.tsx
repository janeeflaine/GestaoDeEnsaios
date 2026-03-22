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

    const eventDateFormatted = new Date(stat.event_date + 'T00:00:00').toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'long', year: 'numeric'
    }).toUpperCase();

    const totalInstruments = ft.total || 1;
    const cordasPct = Math.round((ft.cordas / totalInstruments) * 100);
    const madeirasPct = Math.round((ft.madeiras / totalInstruments) * 100);
    const metaisPct = Math.round((ft.metais / totalInstruments) * 100);
    const acordeonPct = Math.round((ft.acordeon / totalInstruments) * 100);

    type RowData = { name: string; count: number | null; isHeader: boolean; bg: string; text?: string; barColor: string };
    const tableRows: RowData[] = [];

    const addFamily = (label: string, total: number, bg: string, barColor: string, text: string, instruments: readonly { key: string; label: string }[]) => {
        tableRows.push({ name: label, count: total, isHeader: true, bg, text, barColor: '' });
        instruments.forEach((inst, idx) => {
            const count = (stat as any)[inst.key] || 0;
            const zebraBg = idx % 2 === 0 ? 'bg-white' : 'bg-gray-50';
            tableRows.push({ name: inst.label, count, isHeader: false, bg: zebraBg, barColor });
        });
    };

    addFamily('CORDAS', ft.cordas, 'bg-ccb-gold', 'bg-ccb-gold', 'text-white', STAT_INSTRUMENTS.cordas);
    addFamily('MADEIRAS', ft.madeiras, 'bg-ccb-blue-light', 'bg-ccb-blue-light', 'text-white', STAT_INSTRUMENTS.madeiras);
    addFamily('METAIS', ft.metais, 'bg-ccb-green', 'bg-ccb-green', 'text-white', STAT_INSTRUMENTS.metais);
    addFamily('ACORDEON', ft.acordeon, 'bg-ccb-gray', 'bg-ccb-gray', 'text-white', STAT_INSTRUMENTS.acordeon);

    const encRegional = stat.enc_regionais && stat.enc_regionais.length > 0 ? stat.enc_regionais[0] : null;

    const donutData = [
        { name: 'CORDAS', value: ft.cordas, fill: '#d4bc8d' },
        { name: 'MADEIRAS', value: ft.madeiras, fill: '#1e3a8a' },
        { name: 'METAIS', value: ft.metais, fill: '#14532d' },
        { name: 'ACORDEON', value: ft.acordeon, fill: '#9ca3af' },
    ].filter(d => d.value > 0);

    const ministryItems = MINISTRY_FIELDS.map(f => ({
        name: f.label.replace('Presentes', '').replace('Música', 'da Música').trim(),
        value: (stat as any)[f.key] || 0,
    }));

    return (
        <div className="fixed left-[-9999px] top-[-9999px] overflow-hidden" style={{ zIndex: -9999 }}>
            {/* 
        This is the invisible container for html2canvas. 
        It has fixed dimensions representing an A4 page at 96dpi so tailwind and recharts render properly. 
      */}
            <div
                ref={ref}
                id="pdf-export-template"
                className="a4-page flex flex-col gap-4 bg-white"
                style={{ width: '794px', height: '1123px', padding: '38px', boxSizing: 'border-box' }}
            >
                {/* Header */}
                <header className="text-center py-3 bg-white/80 rounded-xl shadow-sm border border-gray-100">
                    <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">CONGREGAÇÃO CRISTÃ NO BRASIL</h1>
                    <p className="text-xs font-semibold text-gray-600 mt-1">{(congregation?.name || '').toUpperCase()} - {congregation?.city || ''} / {congregation?.state || ''}</p>
                    <p className="text-xs font-bold text-gray-700">ESTATÍSTICA - ENSAIO REGIONAL</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{eventDateFormatted}</p>
                </header>

                {/* Presidency Section */}
                <section className="grid grid-cols-3 gap-3">
                    <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center gap-3 border-l-4 border-l-gray-400">
                        <div className="p-2 bg-gray-100 rounded-lg">
                            <Mic className="w-5 h-5 text-gray-700" />
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Ancião: Ir. {anciao?.name || ''}</p>
                            <p className="text-[8px] text-gray-400">LOCALIDADE: {congregation?.city} - {congregation?.state}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center gap-3 border-l-4 border-l-gray-400">
                        <div className="p-2 bg-gray-100 rounded-lg">
                            <BookOpen className="w-5 h-5 text-gray-700" />
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Palavra:</p>
                            <p className="text-[10px] font-extrabold text-gray-800">{(stat.palavra || '').toUpperCase()}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center gap-3 border-l-4 border-l-gray-400">
                        <div className="p-2 bg-gray-100 rounded-lg">
                            <PenLine className="w-5 h-5 text-gray-700" />
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Enc. Reg.: Ir. {encRegional?.name || ''}</p>
                            <p className="text-[8px] text-gray-400">LOCALIDADE: {encRegional ? `${encRegional.congregation}` : ''}</p>
                        </div>
                    </div>
                </section>

                {/* Hinos Section */}
                <section className="flex gap-4">
                    <div className="flex items-center bg-gray-200 rounded-lg overflow-hidden w-64 shadow-sm">
                        <span className="bg-gray-300 text-[9px] font-bold px-3 py-2 text-gray-700 uppercase">Hino Abertura</span>
                        <span className="flex-1 bg-white text-lg font-bold text-center py-1">{stat.hino_abertura || '-'}</span>
                    </div>
                    <div className="flex items-center bg-gray-200 rounded-lg overflow-hidden flex-1 shadow-sm">
                        <span className="bg-gray-300 text-[9px] font-bold px-3 py-2 text-gray-700 uppercase">Hinos Ensaiados</span>
                        <span className="flex-1 bg-white h-full font-bold flex items-center justify-center text-lg">{stat.hinos_ensaiados || '-'}</span>
                    </div>
                </section>

                {/* Two Column Content */}
                <div className="flex gap-4 flex-1 overflow-hidden">

                    {/* Left Column (Instrument List) */}
                    <aside className="w-2/5 flex flex-col gap-3">
                        <div className="flex flex-col flex-1 min-h-0">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-1 flex flex-col">
                                {/* Table Header */}
                                <div className="bg-gray-100 text-center py-2 border-b border-gray-300 shrink-0">
                                    <h2 className="text-[11px] font-black text-gray-800 uppercase leading-tight">VISÃO GERAL DA ORQUESTRA</h2>
                                </div>

                                {/* Table Body */}
                                <div className="flex-1 overflow-y-auto text-[9px]">
                                    {tableRows.map((row, idx) => {
                                        if (row.isHeader) {
                                            return (
                                                <div key={idx} className={`${row.bg} ${row.text} font-bold px-2 py-0.5 uppercase border-b border-gray-300 text-[9px]`}>
                                                    {row.name}
                                                </div>
                                            );
                                        }
                                        return (
                                            <div key={idx} className={`flex items-center px-2 py-[3px] ${row.bg} border-b border-gray-100`}>
                                                <div className="w-[45%] truncate font-medium text-gray-800">{row.name}</div>
                                                <div className="w-[40%] flex items-center h-full">
                                                    {row.count !== null && row.count > 0 && (
                                                        <div
                                                            className={`h-2.5 ${row.barColor} border border-black/20 shadow-sm`}
                                                            style={{ width: `${Math.max((row.count / 110) * 100, 2)}%` }}
                                                        ></div>
                                                    )}
                                                    {row.count === 0 && (
                                                        <div className="h-2.5 w-0.5 bg-red-600"></div>
                                                    )}
                                                </div>
                                                <div className="w-[15%] text-right font-medium text-gray-800">{row.count || '-'}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Right Column (Dashboard) */}
                    <main className="w-3/5 flex flex-col gap-4">
                        <h2 className="text-[10px] font-black text-gray-700 uppercase border-b-2 border-gray-300 pb-1 text-center">Dashboard de Análise</h2>

                        {/* Dashboard Grid (4 Cards) */}
                        <div className="grid grid-cols-2 gap-3">
                            {/* Card: Cordas */}
                            <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 border-t-4 border-t-ccb-gold relative overflow-hidden">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-[9px] font-black text-gray-500">CORDAS</p>
                                        <p className="text-[7px] text-gray-400 mt-1">Total</p>
                                        <p className="text-2xl font-black text-gray-800 leading-none">{ft.cordas}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[7px] text-gray-400 mt-1">Total</p>
                                        <p className="text-2xl font-black text-gray-800 leading-none">{cordasPct}%</p>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 mb-1">
                                    <div className="bg-ccb-gold h-1.5 rounded-full" style={{ width: `${cordasPct}%` }}></div>
                                </div>
                                <p className="text-[7px] font-bold text-gray-400 text-center">Real: {cordasPct}% Ideal: 50%</p>
                            </div>

                            {/* Card: Madeiras */}
                            <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 border-t-4 border-t-ccb-blue-light relative overflow-hidden">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-[9px] font-black text-ccb-blue-light">MADEIRAS</p>
                                        <p className="text-[7px] text-gray-400 mt-1">Total</p>
                                        <p className="text-2xl font-black text-gray-800 leading-none">{ft.madeiras}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[7px] text-gray-400 mt-1">Total</p>
                                        <p className="text-2xl font-black text-gray-800 leading-none">{madeirasPct}%</p>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 mb-1">
                                    <div className="bg-ccb-blue-light h-1.5 rounded-full" style={{ width: `${madeirasPct}%` }}></div>
                                </div>
                                <p className="text-[7px] font-bold text-gray-400 text-center">Real: {madeirasPct}% Ideal: 25%</p>
                            </div>

                            {/* Card: Metais */}
                            <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 border-t-4 border-t-ccb-green relative overflow-hidden">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-[9px] font-black text-ccb-green">METAIS</p>
                                        <p className="text-[7px] text-gray-400 mt-1">Total</p>
                                        <p className="text-2xl font-black text-gray-800 leading-none">{ft.metais}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[7px] text-gray-400 mt-1">Total</p>
                                        <p className="text-2xl font-black text-gray-800 leading-none">{metaisPct}%</p>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 mb-1">
                                    <div className="bg-ccb-green h-1.5 rounded-full" style={{ width: `${metaisPct}%` }}></div>
                                </div>
                                <p className="text-[7px] font-bold text-gray-400 text-center">Real: {metaisPct}% Ideal: 25%</p>
                            </div>

                            {/* Card: Acordeon */}
                            <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 border-t-4 border-t-gray-400 relative overflow-hidden">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-[9px] font-black text-gray-400">ACORDEON</p>
                                        <p className="text-[7px] text-gray-400 mt-1">Total</p>
                                        <p className="text-2xl font-black text-gray-800 leading-none">{ft.acordeon}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[7px] text-gray-400 mt-1">Total</p>
                                        <p className="text-2xl font-black text-gray-800 leading-none">{acordeonPct > 0 ? `${acordeonPct}%` : '-'}</p>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 mb-1">
                                    <div className="bg-gray-400 h-1.5 rounded-full" style={{ width: `${acordeonPct}%` }}></div>
                                </div>
                                <p className="text-[7px] font-bold text-gray-400 text-center">Real: {acordeonPct}% Ideal: -</p>
                            </div>
                        </div>

                        {/* Charts Container */}
                        <div className="flex-1 flex flex-col gap-3 min-h-0">

                            {/* Category Donut */}
                            <div className="flex flex-row gap-3">
                                <div className="bg-white rounded-xl p-2 shadow-sm border border-gray-100 flex flex-col items-center relative w-[45%]">
                                    <p className="text-[8px] font-black text-gray-600 mb-0.5 text-center leading-tight">TOTAL DE MÚSICOS<br />POR CATEGORIA</p>
                                    <div className="flex-1 w-full relative h-[120px] flex items-center justify-center">
                                        <PieChart width={120} height={120}>
                                            <Pie
                                                data={donutData}
                                                cx={60}
                                                cy={60}
                                                innerRadius={30}
                                                outerRadius={50}
                                                stroke="none"
                                                dataKey="value"
                                                isAnimationActive={false}
                                            >
                                                {donutData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                        {/* Center Text */}
                                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                            <span className="text-lg font-black text-gray-800 leading-none">{ft.total}</span>
                                            <span className="text-[6px] font-bold text-gray-400 uppercase">Total</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-center w-full mt-1">
                                        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                                            <div className="flex items-center gap-1"><div className="w-2 h-2 bg-ccb-gold rounded-[2px]"></div><span className="text-[7px] font-bold text-gray-600">Cordas</span></div>
                                            <div className="flex items-center gap-1"><div className="w-2 h-2 bg-ccb-blue-light rounded-[2px]"></div><span className="text-[7px] font-bold text-gray-600">Madeiras</span></div>
                                            <div className="flex items-center gap-1"><div className="w-2 h-2 bg-ccb-green rounded-[2px]"></div><span className="text-[7px] font-bold text-gray-600">Metais</span></div>
                                            <div className="flex items-center gap-1"><div className="w-2 h-2 bg-gray-400 rounded-[2px]"></div><span className="text-[7px] font-bold text-gray-600">Acordeon</span></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Pessoal Adicional Cards */}
                                <div className="bg-white rounded-xl p-2 shadow-sm border border-gray-100 flex flex-col flex-1 w-[55%]">
                                    <p className="text-[9px] font-black text-gray-600 mb-1 text-center uppercase">Pessoal Adicional</p>

                                    <div className="flex flex-col gap-1.5 flex-1 justify-center min-h-0">
                                        <div className="flex gap-1.5">
                                            <div className="flex-1 bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg p-1 text-center border border-gray-200">
                                                <p className="text-[8px] font-bold text-gray-700 uppercase">Músicos</p>
                                                <p className="text-lg font-black text-gray-900 leading-none mt-0.5">{stat.musicos || 0}</p>
                                            </div>
                                            <div className="flex-1 bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg p-1 text-center border border-gray-200">
                                                <p className="text-[8px] font-bold text-gray-700 uppercase">Organistas</p>
                                                <p className="text-lg font-black text-gray-900 leading-none mt-0.5">{stat.organistas || 0}</p>
                                            </div>
                                        </div>

                                        <div className="bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg p-1.5 text-center border border-gray-200 flex items-center justify-center gap-2">
                                            <Users className="w-4 h-4 text-gray-500" />
                                            <div>
                                                <p className="text-[9px] font-bold text-gray-700 uppercase">Músicos + Organistas</p>
                                                <p className="text-xl font-black text-gray-900 leading-none mt-0.5">{mt.musicosOrganistas}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-1.5 mt-0.5">
                                            {ministryItems.map((item, idx) => (
                                                <div key={idx} className="bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg p-1 text-center border border-gray-200 flex flex-col justify-center">
                                                    <p className="text-[6.5px] font-bold text-gray-700 leading-tight h-5 flex items-center justify-center">{item.name}</p>
                                                    <p className="text-base font-black text-gray-900 leading-none">{item.value}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Totals Row */}
                            <div className="flex gap-3 h-20 mb-2">
                                <div className="bg-ccb-blue-dark rounded-xl p-3 flex items-center justify-between text-white shadow-md flex-1">
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

                                <div className="flex flex-col gap-1.5 w-[45%] h-full justify-between">
                                    <div className="h-full bg-white rounded-full px-4 py-1.5 shadow-sm border border-gray-100 flex items-center justify-between border-l-4 border-l-ccb-blue-light">
                                        <span className="text-[9.5px] font-black text-gray-700 uppercase">Músicos + Org.:</span>
                                        <span className="bg-ccb-blue-dark text-white px-3 py-0.5 rounded-full text-base font-black">{mt.musicosOrganistas}</span>
                                    </div>
                                    <div className="h-full bg-white rounded-full px-4 py-1.5 shadow-sm border border-gray-100 flex items-center justify-between border-l-4 border-l-ccb-blue-light">
                                        <span className="text-[9.5px] font-black text-gray-700 uppercase">Instrumentos:</span>
                                        <span className="bg-ccb-blue-dark text-white px-3 py-0.5 rounded-full text-base font-black">{ft.total}</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </main>
                </div>

                {/* Export Footer Info */}
                <footer className="flex justify-between items-center text-[10px] font-bold text-gray-400 pt-2 border-t border-gray-200 mt-auto">
                    <p>TEMPLATE DE EXPORTAÇÃO REACT v2.0</p>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                        <span>Gestão de Ensaios</span>
                    </div>
                </footer>

            </div>
        </div>
    );
});

export default PdfExportTemplate;
