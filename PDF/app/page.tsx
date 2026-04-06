'use client';

import React from 'react';
import { BookOpen, Mic, PenLine, Users } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, ResponsiveContainer, LabelList } from 'recharts';

const tableRows = [
  { name: 'CORDAS', count: null, isHeader: true, bg: 'bg-ccb-gold', text: 'text-white' },
  { name: 'Violino', count: 110, isHeader: false, bg: 'bg-white', barColor: 'bg-ccb-gold' },
  { name: 'Violino', count: 19, isHeader: false, bg: 'bg-gray-50', barColor: 'bg-ccb-gold' },
  { name: 'Violoncelo', count: 35, isHeader: false, bg: 'bg-white', barColor: 'bg-ccb-gold' },
  
  { name: 'MADEIRAS', count: null, isHeader: true, bg: 'bg-ccb-blue-light', text: 'text-white' },
  { name: 'FLAUTA', count: 26, isHeader: false, bg: 'bg-gray-50', barColor: 'bg-ccb-blue-light' },
  { name: 'OBOÉ', count: 1, isHeader: false, bg: 'bg-white', barColor: 'bg-ccb-blue-light' },
  { name: 'OBOÉ D\'AMORE', count: 1, isHeader: false, bg: 'bg-gray-50', barColor: 'bg-ccb-blue-light' },
  { name: 'CORNE INGLÊS', count: 1, isHeader: false, bg: 'bg-white', barColor: 'bg-ccb-blue-light' },
  { name: 'FAGOTE', count: 3, isHeader: false, bg: 'bg-gray-50', barColor: 'bg-ccb-blue-light' },
  { name: 'CLARINETE', count: 31, isHeader: false, bg: 'bg-white', barColor: 'bg-ccb-blue-light' },
  { name: 'Clarinete Alto', count: 1, isHeader: false, bg: 'bg-gray-50', barColor: 'bg-ccb-blue-light' },
  { name: 'Clarinete Baixo', count: 1, isHeader: false, bg: 'bg-white', barColor: 'bg-ccb-blue-light' },
  { name: 'Sax - Soprano', count: 12, isHeader: false, bg: 'bg-gray-50', barColor: 'bg-ccb-blue-light' },
  { name: 'Sax - Alto', count: 45, isHeader: false, bg: 'bg-white', barColor: 'bg-ccb-blue-light' },
  { name: 'Sax - Baritono', count: 19, isHeader: false, bg: 'bg-gray-50', barColor: 'bg-ccb-blue-light' },
  { name: 'Sax - Tenor', count: 6, isHeader: false, bg: 'bg-white', barColor: 'bg-ccb-blue-light' },
  { name: 'Sax - Baixo', count: 2, isHeader: false, bg: 'bg-gray-50', barColor: 'bg-ccb-blue-light' },
  
  { name: 'METAIS', count: null, isHeader: true, bg: 'bg-ccb-green', text: 'text-white' },
  { name: 'Trompete', count: 22, isHeader: false, bg: 'bg-white', barColor: 'bg-ccb-green' },
  { name: 'Cornet', count: 1, isHeader: false, bg: 'bg-gray-50', barColor: 'bg-ccb-green' },
  { name: 'CorNET', count: 1, isHeader: false, bg: 'bg-white', barColor: 'bg-ccb-green' },
  { name: 'Flugelhorn', count: 5, isHeader: false, bg: 'bg-gray-50', barColor: 'bg-ccb-green' },
  { name: 'Examinadoras', count: 4, isHeader: false, bg: 'bg-white', barColor: 'bg-ccb-green' },
  { name: 'Trompa', count: 5, isHeader: false, bg: 'bg-gray-50', barColor: 'bg-ccb-green' },
  { name: 'Trombone', count: 21, isHeader: false, bg: 'bg-white', barColor: 'bg-ccb-green' },
  { name: 'Baritono', count: 8, isHeader: false, bg: 'bg-gray-50', barColor: 'bg-ccb-green' },
  { name: 'Trombonito', count: 4, isHeader: false, bg: 'bg-white', barColor: 'bg-ccb-green' },
  { name: 'Trombonito', count: 3, isHeader: false, bg: 'bg-gray-50', barColor: 'bg-ccb-green' },
  { name: 'Frombonito', count: 59, isHeader: false, bg: 'bg-white', barColor: 'bg-ccb-green' },
  { name: 'Baritono', count: 2, isHeader: false, bg: 'bg-gray-50', barColor: 'bg-ccb-green' },
  { name: 'Eufônio', count: 15, isHeader: false, bg: 'bg-white', barColor: 'bg-ccb-green' },
  { name: 'Tuba', count: 24, isHeader: false, bg: 'bg-gray-50', barColor: 'bg-ccb-green' },
  
  { name: 'ACORDEON', count: null, isHeader: true, bg: 'bg-red-900', text: 'text-white' },
  { name: 'Acordeon', count: 0, isHeader: false, bg: 'bg-white', barColor: 'bg-red-900' },
];

const donutData = [
  { name: 'CORDAS', value: 164, fill: '#d4bc8d' },
  { name: 'MADEIRAS', value: 147, fill: '#1e3a8a' },
  { name: 'METAIS', value: 94, fill: '#14532d' },
  { name: 'ACORDEON', value: 0, fill: '#9ca3af' },
];

const barData = [
  { name: 'Anciães', value: 530, fill: '#d4bc8d' },
  { name: 'Diáconos', value: 2, fill: '#1e3a8a' },
  { name: 'Coop. Ofício', value: 3, fill: '#14532d' },
  { name: 'Coop. Jovens', value: 3, fill: '#166534' },
  { name: 'Enc. Regionais', value: 10, fill: '#9ca3af' },
  { name: 'Enc. Locais', value: 18, fill: '#6b7280' },
  { name: 'Examinadoras', value: 4, fill: '#d4bc8d' },
  { name: 'Sec. Música', value: 3, fill: '#1e3a8a' },
  { name: 'Instrutores', value: 59, fill: '#9ca3af' },
];

export default function Page() {
  const totalInstruments = donutData.reduce((acc, curr) => acc + curr.value, 0);
  const cordasData = donutData.find(d => d.name === 'CORDAS')?.value || 0;
  const madeirasData = donutData.find(d => d.name === 'MADEIRAS')?.value || 0;
  const metaisData = donutData.find(d => d.name === 'METAIS')?.value || 0;
  const acordeonData = donutData.find(d => d.name === 'ACORDEON')?.value || 0;

  const cordasPct = totalInstruments > 0 ? Math.round((cordasData / totalInstruments) * 100) : 0;
  const madeirasPct = totalInstruments > 0 ? Math.round((madeirasData / totalInstruments) * 100) : 0;
  const metaisPct = totalInstruments > 0 ? Math.round((metaisData / totalInstruments) * 100) : 0;
  const acordeonPct = totalInstruments > 0 ? Math.round((acordeonData / totalInstruments) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-200 py-8 flex justify-center items-start print:bg-white print:py-0">
      <div className="a4-page flex flex-col gap-4 shadow-2xl print:shadow-none bg-white">
        
        {/* Header */}
        <header className="text-center py-3 bg-white/80 rounded-xl shadow-sm border border-gray-100">
          <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">CONGREGAÇÃO CRISTÃ NO BRASIL</h1>
          <p className="text-xs font-semibold text-gray-600 mt-1">JARDIM LUIZ CIA - SUMARÉ / SP</p>
          <p className="text-xs font-bold text-gray-700">ESTATÍSTICA - ENSAIO REGIONAL</p>
          <p className="text-[10px] text-gray-500 mt-0.5">08 DE FEVEREIRO DE 2026 - (2º DOMINGO - 09:00h.)</p>
        </header>

        {/* Presidency Section */}
        <section className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center gap-3 border-l-4 border-l-gray-400">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Mic className="w-5 h-5 text-gray-700" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Ancião: Ir. Felipe Rivelli</p>
              <p className="text-[8px] text-gray-400">LOCALIDADE: LAMBARI - MG</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center gap-3 border-l-4 border-l-gray-400">
            <div className="p-2 bg-gray-100 rounded-lg">
              <BookOpen className="w-5 h-5 text-gray-700" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Palavra:</p>
              <p className="text-[10px] font-extrabold text-gray-800">SALMOS 32</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center gap-3 border-l-4 border-l-gray-400">
            <div className="p-2 bg-gray-100 rounded-lg">
              <PenLine className="w-5 h-5 text-gray-700" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Enc. Reg.: Ir. Clecius Lima</p>
              <p className="text-[8px] text-gray-400">LOCALIDADE: MOGI-GUAÇU - SP</p>
            </div>
          </div>
        </section>

        {/* Hinos Section */}
        <section className="flex gap-4">
          <div className="flex items-center bg-gray-200 rounded-lg overflow-hidden w-64 shadow-sm">
            <span className="bg-gray-300 text-[9px] font-bold px-3 py-2 text-gray-700 uppercase">Hino Abertura</span>
            <span className="flex-1 bg-white text-lg font-bold text-center py-1">134</span>
          </div>
          <div className="flex items-center bg-gray-200 rounded-lg overflow-hidden flex-1 shadow-sm">
            <span className="bg-gray-300 text-[9px] font-bold px-3 py-2 text-gray-700 uppercase">Hinos Ensaiados</span>
            <span className="flex-1 bg-white h-full"></span>
          </div>
        </section>

        {/* Two Column Content */}
        <div className="flex gap-4 flex-1 overflow-hidden">
          
          {/* Left Column (Instrument List) */}
          <aside className="w-2/5 flex flex-col gap-3">
            <div className="flex flex-col flex-1 min-h-0">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-1 flex flex-col">
                {/* Table Header exactly like image */}
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
                        <div className="w-[15%] text-right font-medium text-gray-800">{row.count}</div>
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
                    <p className="text-2xl font-black text-gray-800 leading-none">{cordasData}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-gray-800">{cordasPct}%</p>
                    <p className="text-[7px] font-bold text-gray-400">Ideal: 50%</p>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                  <div className="bg-ccb-gold h-1.5 rounded-full" style={{ width: `${cordasPct}%` }}></div>
                </div>
              </div>

              {/* Card: Madeiras */}
              <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 border-t-4 border-t-ccb-blue-light relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[9px] font-black text-ccb-blue-light">MADEIRAS</p>
                    <p className="text-[7px] text-gray-400 mt-1">Total</p>
                    <p className="text-2xl font-black text-gray-800 leading-none">{madeirasData}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-gray-800">{madeirasPct}%</p>
                    <p className="text-[7px] font-bold text-gray-400">Ideal: 25%</p>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                  <div className="bg-ccb-blue-light h-1.5 rounded-full" style={{ width: `${madeirasPct}%` }}></div>
                </div>
              </div>

              {/* Card: Metais */}
              <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 border-t-4 border-t-ccb-green relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[9px] font-black text-ccb-green">METAIS</p>
                    <p className="text-[7px] text-gray-400 mt-1">Total</p>
                    <p className="text-2xl font-black text-gray-800 leading-none">{metaisData}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-gray-800">{metaisPct}%</p>
                    <p className="text-[7px] font-bold text-gray-400">Ideal: 25%</p>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                  <div className="bg-ccb-green h-1.5 rounded-full" style={{ width: `${metaisPct}%` }}></div>
                </div>
              </div>

              {/* Card: Acordeon */}
              <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 border-t-4 border-t-gray-400 relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[9px] font-black text-gray-400">ACORDEON</p>
                    <p className="text-[7px] text-gray-400 mt-1">Total</p>
                    <p className="text-2xl font-black text-gray-800 leading-none">{acordeonData}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-gray-400">{acordeonPct > 0 ? `${acordeonPct}%` : '-'}</p>
                    <p className="text-[7px] font-bold text-gray-400">Ideal: -</p>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                  <div className="bg-gray-400 h-1.5 rounded-full" style={{ width: `${acordeonPct}%` }}></div>
                </div>
              </div>
            </div>

            {/* Charts Container */}
            <div className="flex-1 min-h-0 flex flex-col">
              {/* Pessoal Adicional Cards */}
              <div className="bg-white rounded-xl p-2 shadow-sm border border-gray-100 flex flex-col flex-1 min-h-0">
                <p className="text-[9px] font-black text-gray-600 mb-1 text-center uppercase">Pessoal Adicional</p>
                
                <div className="flex flex-col gap-1.5 flex-1 justify-center min-h-0">
                  {/* Top Row: Músicos & Organistas */}
                  <div className="flex gap-1.5">
                    <div className="flex-1 bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg p-1 text-center border border-gray-200 shadow-sm">
                      <p className="text-[8px] font-bold text-gray-700 uppercase">Músicos</p>
                      <p className="text-lg font-black text-gray-900 leading-none mt-0.5">405</p>
                    </div>
                    <div className="flex-1 bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg p-1 text-center border border-gray-200 shadow-sm">
                      <p className="text-[8px] font-bold text-gray-700 uppercase">Organistas</p>
                      <p className="text-lg font-black text-gray-900 leading-none mt-0.5">125</p>
                    </div>
                  </div>
                  
                  {/* Middle Row: Total */}
                  <div className="bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg p-1.5 text-center border border-gray-200 shadow-sm flex items-center justify-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-[9px] font-bold text-gray-700 uppercase">Músicos + Organistas</p>
                      <p className="text-xl font-black text-gray-900 leading-none mt-0.5">530</p>
                    </div>
                  </div>

                  {/* Grid of 9 */}
                  <div className="grid grid-cols-3 gap-1.5 mt-0.5">
                    {[
                      { name: 'Anciães', value: 3 },
                      { name: 'Diáconos', value: 2 },
                      { name: 'Coop. do Ofício', value: 3 },
                      { name: 'Coop. de Jovens', value: 3 },
                      { name: 'Enc. Regionais', value: 10 },
                      { name: 'Enc. Locais', value: 18 },
                      { name: 'Examinadoras', value: 4 },
                      { name: 'Secretários da Música', value: 3 },
                      { name: 'Instrutores', value: 59 },
                    ].map((item, idx) => (
                      <div key={idx} className="bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg p-1 text-center border border-gray-200 shadow-sm flex flex-col justify-center">
                        <p className="text-[7px] font-bold text-gray-700 leading-tight h-5 flex items-center justify-center">{item.name}</p>
                        <p className="text-base font-black text-gray-900 leading-none">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section: Donut Chart + Totals */}
            <div className="flex gap-3 mt-auto">
              {/* Category Donut */}
              <div className="bg-white rounded-xl p-2 shadow-sm border border-gray-100 flex flex-col items-center relative w-[45%]">
                <p className="text-[8px] font-black text-gray-600 mb-0.5 text-center leading-tight">TOTAL DE MÚSICOS<br/>POR CATEGORIA</p>
                <div className="flex-1 w-full relative min-h-[90px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={90} minWidth={0}>
                    <PieChart>
                      <Pie
                        data={donutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={25}
                        outerRadius={40}
                        stroke="none"
                        dataKey="value"
                      >
                        {donutData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-sm font-black text-gray-800 leading-none">405</span>
                    <span className="text-[6px] font-bold text-gray-400 uppercase">Total</span>
                  </div>
                  {/* Labels */}
                  <div className="absolute top-1 right-3 text-[8px] font-bold text-gray-800">164</div>
                  <div className="absolute bottom-1 left-6 text-[8px] font-bold text-white">147</div>
                  <div className="absolute top-2 left-4 text-[8px] font-bold text-white">94</div>
                </div>
                
                <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 w-full px-2 mt-1">
                  <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-ccb-gold"></div><span className="text-[6px] font-bold text-gray-600">CORDAS</span></div>
                  <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-ccb-blue-light"></div><span className="text-[6px] font-bold text-gray-600">MADEIRAS</span></div>
                  <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-ccb-green"></div><span className="text-[6px] font-bold text-gray-600">METAIS</span></div>
                  <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-gray-400"></div><span className="text-[6px] font-bold text-gray-600">ACORDEON</span></div>
                </div>
              </div>

              {/* Totals Column */}
              <div className="flex flex-col gap-2 flex-1">
                {/* Footer Total Large */}
                <div className="bg-ccb-blue-dark rounded-xl p-3 flex items-center justify-between text-white shadow-md flex-1">
                  <div className="flex items-center gap-3">
                    <div className="opacity-50">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path></svg>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold tracking-widest uppercase text-gray-300">Total Geral:</p>
                      <h3 className="text-4xl font-black leading-none mt-0.5">558</h3>
                    </div>
                  </div>
                </div>

                {/* Bottom Totals */}
                <div className="grid grid-cols-1 gap-1.5">
                  <div className="bg-white rounded-full px-4 py-1.5 shadow-sm border border-gray-100 flex items-center justify-between border-l-4 border-l-ccb-blue-light">
                    <span className="text-[9px] font-black text-gray-700 uppercase">Músicos + Organistas:</span>
                    <span className="bg-ccb-blue-dark text-white px-3 py-0.5 rounded-full text-sm font-black">530</span>
                  </div>
                  <div className="bg-white rounded-full px-4 py-1.5 shadow-sm border border-gray-100 flex items-center justify-between border-l-4 border-l-ccb-blue-light">
                    <span className="text-[9px] font-black text-gray-700 uppercase">Total Geral:</span>
                    <span className="bg-ccb-blue-dark text-white px-3 py-0.5 rounded-full text-sm font-black">526</span>
                  </div>
                </div>
              </div>
            </div>

          </main>
        </div>

        {/* Export Footer Info */}
        <footer className="flex justify-between items-center text-[9px] font-bold text-gray-400 pt-2 border-t border-gray-200 mt-auto">
          <p>TEMPLATE DE EXPORTAÇÃO v1.2</p>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
            <span>sistem</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
