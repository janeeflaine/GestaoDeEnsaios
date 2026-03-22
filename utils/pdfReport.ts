import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { EventStatistic, Congregation, Anciao, STAT_INSTRUMENTS, MINISTRY_FIELDS } from '../types';
import { calcFamilyTotals, calcFamilyPercentages, calcMinistryTotals } from './orchestraCalculations';

// @ts-ignore - pdfmake font loading
pdfMake.vfs = pdfFonts?.pdfMake?.vfs || pdfFonts?.vfs || pdfFonts;

// ─── Color Palette ─────────────────────────────────────────────────────
const C = {
    // Category backgrounds
    cordasBg: '#F9F1D8', cordasAccent: '#D4AF37',
    madeirasBg: '#E6F0FA', madeirasAccent: '#4A90E2',
    metaisBg: '#E8F4E9', metaisAccent: '#50C878',
    acordeonBg: '#F0F0F0', acordeonAccent: '#9E9E9E',
    // UI
    pageBg: '#F4F6F9',
    cardBg: '#FFFFFF',
    cardBorder: '#E0E0E0',
    headerBg: '#E0E0E0',
    darkFooter: '#1E293B',
    titleColor: '#1B2A4A',
    subtitleColor: '#555555',
    labelColor: '#666666',
    textDark: '#333333',
    textLight: '#FFFFFF',
    greenTag: '#50C878',
    blueTag: '#4A90E2',
};

// ─── Helper: draw a mini progress bar using pdfmake canvas ────────────
function progressBar(pct: number, color: string, width = 100, height = 10): any {
    const fillWidth = Math.max(0, Math.min(pct, 100)) * (width / 100);
    return {
        canvas: [
            { type: 'rect', x: 0, y: 0, w: width, h: height, r: 3, color: '#EEEEEE' },
            { type: 'rect', x: 0, y: 0, w: fillWidth, h: height, r: 3, color },
        ],
        margin: [0, 2, 0, 0],
    };
}

// ─── Helper: render a category analysis card ──────────────────────────
function categoryCard(label: string, total: number, realPct: number, idealPct: number | null, bgColor: string, accentColor: string): any {
    const idealStr = idealPct !== null ? `${idealPct}%` : '-';
    return {
        table: {
            widths: ['*'],
            body: [[{
                fillColor: bgColor,
                border: [true, true, true, true],
                margin: [6, 6, 6, 6],
                stack: [
                    { text: label, bold: true, fontSize: 9, color: C.titleColor, alignment: 'center', margin: [0, 0, 0, 4] },
                    {
                        columns: [
                            { text: [{ text: 'Total\n', fontSize: 7, color: C.labelColor }, { text: String(total), fontSize: 16, bold: true, color: C.textDark }], alignment: 'center', width: '*' },
                            { text: [{ text: 'Total\n', fontSize: 7, color: C.labelColor }, { text: idealStr, fontSize: 16, bold: true, color: C.textDark }], alignment: 'center', width: '*' },
                        ],
                        margin: [0, 0, 0, 6],
                    },
                    progressBar(realPct, accentColor, 90),
                    { text: `Real: ${realPct}%    Ideal: ${idealStr}`, fontSize: 6, color: C.labelColor, alignment: 'center', margin: [0, 3, 0, 0] },
                ],
            }]],
        },
        layout: {
            hLineWidth: () => 0.5, vLineWidth: () => 0.5,
            hLineColor: () => C.cardBorder, vLineColor: () => C.cardBorder,
        },
    };
}

// ─── Helper: mini ministry bar chart item ─────────────────────────────
function miniBarItem(label: string, value: number, maxVal: number): any {
    const barWidth = maxVal > 0 ? Math.round((value / maxVal) * 55) : 0;
    return {
        columns: [
            {
                canvas: [
                    { type: 'rect', x: 0, y: 0, w: 55, h: 8, r: 2, color: '#EEEEEE' },
                    { type: 'rect', x: 0, y: 0, w: barWidth, h: 8, r: 2, color: C.blueTag },
                ],
                width: 60,
                margin: [0, 2, 0, 0],
            },
            { text: String(value), fontSize: 7, bold: true, color: C.textDark, alignment: 'right', width: 20, margin: [2, 1, 0, 0] },
        ],
        margin: [0, 0, 0, 1],
    };
}

// ─── MAIN PDF GENERATION ──────────────────────────────────────────────
export function generateStatisticsPDF(
    stat: EventStatistic,
    congregation?: Congregation | null,
    anciao?: Anciao | null,
) {
    const ft = calcFamilyTotals(stat);
    const pct = calcFamilyPercentages(ft);
    const mt = calcMinistryTotals(stat);

    const eventDateFormatted = new Date(stat.event_date + 'T00:00:00').toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'long', year: 'numeric'
    }).toUpperCase();

    // ═══════════════════════════════════════════════════════════════════
    // SECTION: Instrument Detail Table Rows
    // ═══════════════════════════════════════════════════════════════════
    const instrumentRows: any[][] = [];

    const addFamilyHeader = (label: string, total: number, bgColor: string) => {
        instrumentRows.push([
            { text: label, bold: true, fontSize: 8, fillColor: bgColor, color: C.titleColor, margin: [4, 2] },
            { text: String(total), bold: true, fontSize: 8, fillColor: bgColor, alignment: 'center', margin: [4, 2] },
        ]);
    };

    const addInstrument = (label: string, value: number, bgColor: string) => {
        instrumentRows.push([
            { text: `    ${label}`, fontSize: 7.5, fillColor: value ? bgColor : undefined, color: C.textDark, margin: [8, 1.5] },
            { text: value ? String(value) : '', fontSize: 7.5, fillColor: value ? bgColor : undefined, alignment: 'center', margin: [4, 1.5] },
        ]);
    };

    // Cordas
    addFamilyHeader('CORDAS', ft.cordas, C.cordasBg);
    STAT_INSTRUMENTS.cordas.forEach(inst => addInstrument(inst.label, (stat as any)[inst.key] || 0, '#FFFEF5'));

    // Madeiras
    addFamilyHeader('MADEIRAS', ft.madeiras, C.madeirasBg);
    STAT_INSTRUMENTS.madeiras.forEach(inst => addInstrument(inst.label, (stat as any)[inst.key] || 0, '#F5F9FF'));

    // Metais
    addFamilyHeader('METAIS', ft.metais, C.metaisBg);
    STAT_INSTRUMENTS.metais.forEach(inst => addInstrument(inst.label, (stat as any)[inst.key] || 0, '#F5FFF5'));

    // Acordeon
    addFamilyHeader('ACORDEON', ft.acordeon, C.acordeonBg);
    STAT_INSTRUMENTS.acordeon.forEach(inst => addInstrument(inst.label, (stat as any)[inst.key] || 0, '#FAFAFA'));

    // ═══════════════════════════════════════════════════════════════════
    // SECTION: Ministry "Pessoal Adicional" data
    // ═══════════════════════════════════════════════════════════════════
    const ministryItems = MINISTRY_FIELDS.map(f => ({
        label: f.label,
        value: (stat as any)[f.key] || 0,
    }));
    const maxMinistry = Math.max(...ministryItems.map(i => i.value), 1);

    // ═══════════════════════════════════════════════════════════════════
    // SECTION: Donut chart using SVG-like canvas arcs
    // ═══════════════════════════════════════════════════════════════════
    const donutSize = 90;
    const donutCenter = donutSize / 2;
    const donutRadius = 35;
    const donutInner = 20;

    function makeDonutArcs(): any[] {
        const total = ft.total || 1;
        const segments = [
            { value: ft.cordas, color: C.cordasAccent },
            { value: ft.madeiras, color: C.madeirasAccent },
            { value: ft.metais, color: C.metaisAccent },
            { value: ft.acordeon, color: C.acordeonAccent },
        ];

        const arcs: any[] = [];
        let startAngle = -Math.PI / 2;

        segments.forEach(seg => {
            if (seg.value <= 0) return;
            const sweepAngle = (seg.value / total) * 2 * Math.PI;
            const endAngle = startAngle + sweepAngle;
            const midAngle = startAngle + sweepAngle / 2;

            // Draw thick arc segment as a filled polygon approximation
            const points: { x: number; y: number }[] = [];
            const steps = Math.max(8, Math.round(sweepAngle * 12));
            for (let i = 0; i <= steps; i++) {
                const a = startAngle + (sweepAngle * i) / steps;
                points.push({
                    x: donutCenter + donutRadius * Math.cos(a),
                    y: donutCenter + donutRadius * Math.sin(a),
                });
            }
            for (let i = steps; i >= 0; i--) {
                const a = startAngle + (sweepAngle * i) / steps;
                points.push({
                    x: donutCenter + donutInner * Math.cos(a),
                    y: donutCenter + donutInner * Math.sin(a),
                });
            }

            arcs.push({
                type: 'polyline',
                points,
                closePath: true,
                color: seg.color,
            });

            // Label on arcs
            const labelR = donutRadius + 10;
            arcs.push({
                type: 'text' as any,
            });

            startAngle = endAngle;
        });

        // Center white circle
        arcs.push({
            type: 'ellipse',
            x: donutCenter,
            y: donutCenter,
            r1: donutInner - 1,
            r2: donutInner - 1,
            color: '#FFFFFF',
        });

        return arcs;
    }

    // ═══════════════════════════════════════════════════════════════════
    // DOCUMENT DEFINITION
    // ═══════════════════════════════════════════════════════════════════
    const docDefinition: any = {
        pageSize: 'A4',
        pageMargins: [15, 15, 15, 30],
        background: () => ({
            canvas: [{ type: 'rect', x: 0, y: 0, w: 595.28, h: 841.89, color: C.pageBg }],
        }),

        content: [
            // ───── HEADER ─────────────────────────────────────────────
            {
                table: {
                    widths: ['*'],
                    body: [[{
                        stack: [
                            { text: 'CONGREGAÇÃO CRISTÃ NO BRASIL', fontSize: 14, bold: true, color: C.titleColor, alignment: 'center', margin: [0, 8, 0, 2] },
                            { text: (congregation?.name || '').toUpperCase(), fontSize: 10, bold: true, color: C.subtitleColor, alignment: 'center' },
                            { text: `ESTATÍSTICA - ENSAIO REGIONAL`, fontSize: 8, bold: true, color: C.subtitleColor, alignment: 'center', margin: [0, 2] },
                            { text: eventDateFormatted, fontSize: 8, color: C.labelColor, alignment: 'center', margin: [0, 0, 0, 8] },
                        ],
                        fillColor: C.cardBg,
                    }]],
                },
                layout: {
                    hLineWidth: () => 0.5, vLineWidth: () => 0,
                    hLineColor: () => C.cardBorder,
                },
                margin: [0, 0, 0, 6],
            },

            // ───── PRESIDÊNCIA ────────────────────────────────────────
            {
                table: {
                    widths: ['*'],
                    body: [[{ text: 'PRESIDÊNCIA', bold: true, fontSize: 9, alignment: 'center', fillColor: C.headerBg, color: C.titleColor, margin: [0, 3] }]],
                },
                layout: { hLineWidth: () => 0.5, vLineWidth: () => 0.5, hLineColor: () => C.cardBorder, vLineColor: () => C.cardBorder },
                margin: [0, 0, 0, 4],
            },
            {
                columns: [
                    // Ancião card
                    {
                        width: '33%',
                        table: {
                            widths: ['*'],
                            body: [[{
                                stack: [
                                    { text: 'ANCIÃO:', fontSize: 7, bold: true, color: C.labelColor },
                                    { text: (anciao?.name || '').toUpperCase(), fontSize: 8, bold: true, color: C.textDark, margin: [0, 1] },
                                ],
                                fillColor: C.cardBg, margin: [6, 5],
                            }]],
                        },
                        layout: { hLineWidth: () => 0.5, vLineWidth: () => 0.5, hLineColor: () => C.cardBorder, vLineColor: () => C.cardBorder },
                    },
                    // Palavra card
                    {
                        width: '33%',
                        table: {
                            widths: ['*'],
                            body: [[{
                                stack: [
                                    { text: 'PALAVRA:', fontSize: 7, bold: true, color: C.labelColor },
                                    { text: (stat.palavra || '').toUpperCase(), fontSize: 8, bold: true, color: C.textDark, margin: [0, 1] },
                                ],
                                fillColor: C.cardBg, margin: [6, 5],
                            }]],
                        },
                        layout: { hLineWidth: () => 0.5, vLineWidth: () => 0.5, hLineColor: () => C.cardBorder, vLineColor: () => C.cardBorder },
                        margin: [4, 0, 4, 0],
                    },
                    // Hinos card
                    {
                        width: '34%',
                        table: {
                            widths: ['*'],
                            body: [[{
                                stack: [
                                    { text: 'HINOS', fontSize: 7, bold: true, color: C.labelColor },
                                    {
                                        columns: [
                                            { text: [{ text: 'Abertura: ', fontSize: 7, color: C.labelColor }, { text: String(stat.hino_abertura || '-'), fontSize: 9, bold: true, color: C.textDark }], width: '*' },
                                            { text: [{ text: 'Ensaiados: ', fontSize: 7, color: C.labelColor }, { text: String(stat.hinos_ensaiados || '-'), fontSize: 9, bold: true, color: C.textDark }], width: '*' },
                                        ],
                                        margin: [0, 2, 0, 0],
                                    },
                                ],
                                fillColor: C.cardBg, margin: [6, 5],
                            }]],
                        },
                        layout: { hLineWidth: () => 0.5, vLineWidth: () => 0.5, hLineColor: () => C.cardBorder, vLineColor: () => C.cardBorder },
                    },
                ],
                margin: [0, 0, 0, 8],
            },

            // ───── TWO-COLUMN MAIN BODY ───────────────────────────────
            {
                columns: [
                    // *** LEFT COLUMN: Instrument Table ***
                    {
                        width: '38%',
                        stack: [
                            { text: 'FORMAÇÃO ORQUESTRAL - DETALHAMENTO', fontSize: 8, bold: true, color: C.titleColor, alignment: 'center', margin: [0, 0, 0, 4] },
                            {
                                table: {
                                    headerRows: 1,
                                    widths: ['*', 50],
                                    body: [
                                        [
                                            { text: 'INSTRUMENTOS', bold: true, fontSize: 7, fillColor: C.headerBg, alignment: 'center', margin: [4, 2] },
                                            { text: 'QUANTIDADE', bold: true, fontSize: 7, fillColor: C.headerBg, alignment: 'center', margin: [2, 2] },
                                        ],
                                        ...instrumentRows,
                                    ],
                                },
                                layout: {
                                    hLineWidth: (i: number) => i === 0 || i === 1 ? 0.5 : 0.3,
                                    vLineWidth: () => 0.3,
                                    hLineColor: () => '#DDD',
                                    vLineColor: () => '#DDD',
                                    paddingLeft: () => 2,
                                    paddingRight: () => 2,
                                    paddingTop: () => 1,
                                    paddingBottom: () => 1,
                                },
                            },
                        ],
                    },

                    // *** RIGHT COLUMN: Dashboard ***
                    {
                        width: '62%',
                        stack: [
                            { text: 'DASHBOARD DE ANÁLISE', fontSize: 8, bold: true, color: C.titleColor, alignment: 'center', margin: [0, 0, 0, 4] },

                            // Category analysis cards (2×2 grid)
                            {
                                columns: [
                                    { width: '50%', ...categoryCard('CORDAS', ft.cordas, pct.cordas, 50, C.cordasBg, C.cordasAccent) },
                                    { width: '50%', ...categoryCard('MADEIRAS', ft.madeiras, pct.madeiras, 25, C.madeirasBg, C.madeirasAccent), margin: [4, 0, 0, 0] },
                                ],
                                margin: [8, 0, 0, 4],
                            },
                            {
                                columns: [
                                    { width: '50%', ...categoryCard('METAIS', ft.metais, pct.metais, 25, C.metaisBg, C.metaisAccent) },
                                    { width: '50%', ...categoryCard('ACORDEON', ft.acordeon, pct.acordeon, null, C.acordeonBg, C.acordeonAccent), margin: [4, 0, 0, 0] },
                                ],
                                margin: [8, 0, 0, 6],
                            },

                            // Donut + Ministry bars row
                            {
                                columns: [
                                    // Donut chart area
                                    {
                                        width: '50%',
                                        table: {
                                            widths: ['*'],
                                            body: [[{
                                                stack: [
                                                    { text: 'TOTAL DE MÚSICOS\nPOR CATEGORIA', fontSize: 7, bold: true, color: C.titleColor, alignment: 'center', margin: [0, 4, 0, 4] },
                                                    {
                                                        canvas: makeDonutArcs(),
                                                        width: donutSize,
                                                        height: donutSize,
                                                        alignment: 'center',
                                                        margin: [20, 0, 0, 2],
                                                    },
                                                    { text: String(ft.total), fontSize: 14, bold: true, color: C.textDark, alignment: 'center' },
                                                    { text: 'TOTAL', fontSize: 6, color: C.labelColor, alignment: 'center', margin: [0, 0, 0, 2] },
                                                    // Legend
                                                    {
                                                        columns: [
                                                            { canvas: [{ type: 'rect', x: 0, y: 0, w: 6, h: 6, color: C.cordasAccent }], width: 8, margin: [0, 1, 0, 0] },
                                                            { text: 'Cordas', fontSize: 5.5, width: 30 },
                                                            { canvas: [{ type: 'rect', x: 0, y: 0, w: 6, h: 6, color: C.madeirasBg }], width: 8, margin: [0, 1, 0, 0] },
                                                            { text: 'Madeiras', fontSize: 5.5, width: 30 },
                                                        ],
                                                        margin: [8, 2, 0, 1],
                                                    },
                                                    {
                                                        columns: [
                                                            { canvas: [{ type: 'rect', x: 0, y: 0, w: 6, h: 6, color: C.metaisAccent }], width: 8, margin: [0, 1, 0, 0] },
                                                            { text: 'Metais', fontSize: 5.5, width: 30 },
                                                            { canvas: [{ type: 'rect', x: 0, y: 0, w: 6, h: 6, color: C.acordeonAccent }], width: 8, margin: [0, 1, 0, 0] },
                                                            { text: 'Acordeon', fontSize: 5.5, width: 30 },
                                                        ],
                                                        margin: [8, 0, 0, 4],
                                                    },
                                                ],
                                                fillColor: C.cardBg,
                                            }]],
                                        },
                                        layout: { hLineWidth: () => 0.5, vLineWidth: () => 0.5, hLineColor: () => C.cardBorder, vLineColor: () => C.cardBorder },
                                        margin: [8, 0, 0, 0],
                                    },

                                    // Ministry bars
                                    {
                                        width: '50%',
                                        table: {
                                            widths: ['*'],
                                            body: [[{
                                                stack: [
                                                    { text: 'PESSOAL ADICIONAL', fontSize: 7, bold: true, color: C.titleColor, alignment: 'center', margin: [0, 4, 0, 4] },
                                                    ...ministryItems.map(item => ({
                                                        columns: [
                                                            { text: item.label, fontSize: 6, color: C.labelColor, width: 55, margin: [0, 1, 0, 0] },
                                                            miniBarItem('', item.value, maxMinistry),
                                                        ],
                                                        margin: [4, 0, 4, 2],
                                                    })),
                                                ],
                                                fillColor: C.cardBg,
                                                margin: [0, 0, 0, 4],
                                            }]],
                                        },
                                        layout: { hLineWidth: () => 0.5, vLineWidth: () => 0.5, hLineColor: () => C.cardBorder, vLineColor: () => C.cardBorder },
                                        margin: [4, 0, 0, 0],
                                    },
                                ],
                                margin: [0, 0, 0, 6],
                            },

                            // ───── DARK TOTALS FOOTER ─────────────────
                            {
                                columns: [
                                    // Total Geral - big
                                    {
                                        width: '50%',
                                        table: {
                                            widths: ['*'],
                                            body: [[{
                                                stack: [
                                                    { text: 'TOTAL GERAL:', fontSize: 7, bold: true, color: '#94A3B8', alignment: 'center', margin: [0, 6, 0, 0] },
                                                    { text: String(mt.totalGeral), fontSize: 28, bold: true, color: C.textLight, alignment: 'center', margin: [0, 0, 0, 6] },
                                                ],
                                                fillColor: C.darkFooter,
                                            }]],
                                        },
                                        layout: { hLineWidth: () => 0, vLineWidth: () => 0 },
                                        margin: [8, 0, 0, 0],
                                    },
                                    // Músicos + Organistas
                                    {
                                        width: '50%',
                                        stack: [
                                            {
                                                table: {
                                                    widths: ['*'],
                                                    body: [[{
                                                        stack: [
                                                            { text: 'MÚSICOS + ORGANISTAS:', fontSize: 6, bold: true, color: '#94A3B8', alignment: 'center', margin: [0, 4, 0, 0] },
                                                            { text: String(mt.musicosOrganistas), fontSize: 18, bold: true, color: C.textLight, alignment: 'center', margin: [0, 0, 0, 4] },
                                                        ],
                                                        fillColor: C.darkFooter,
                                                    }]],
                                                },
                                                layout: { hLineWidth: () => 0, vLineWidth: () => 0 },
                                                margin: [4, 0, 0, 0],
                                            },
                                            {
                                                table: {
                                                    widths: ['*'],
                                                    body: [[{
                                                        stack: [
                                                            { text: 'TOTAL GERAL:', fontSize: 6, bold: true, color: '#94A3B8', alignment: 'center', margin: [0, 3, 0, 0] },
                                                            { text: String(ft.total), fontSize: 16, bold: true, color: C.textLight, alignment: 'center', margin: [0, 0, 0, 3] },
                                                        ],
                                                        fillColor: '#334155',
                                                    }]],
                                                },
                                                layout: { hLineWidth: () => 0, vLineWidth: () => 0 },
                                                margin: [4, 3, 0, 0],
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
                columnGap: 6,
            },
        ],

        // ───── FOOTER ─────────────────────────────────────────────────
        footer: (currentPage: number, pageCount: number) => ({
            columns: [
                { text: 'TEMPLATE DE EXPORTAÇÃO v1.2', fontSize: 6, color: C.labelColor, margin: [15, 0, 0, 0] },
                { text: `Página ${currentPage} de ${pageCount}`, fontSize: 6, color: C.labelColor, alignment: 'right', margin: [0, 0, 15, 0] },
            ],
            margin: [0, 10, 0, 0],
        }),

        styles: {
            title: { fontSize: 14, bold: true, margin: [0, 0, 0, 4] },
        },
        defaultStyle: {
            font: 'Roboto',
        },
    };

    const fileName = `Estatistica_${congregation?.name || 'Evento'}_${stat.event_date}.pdf`;
    pdfMake.createPdf(docDefinition).download(fileName);
}
