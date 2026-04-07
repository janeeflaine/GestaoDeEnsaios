import pdfMake from 'pdfmake/build/pdfmake';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { EventStatistic, Congregation, Anciao, STAT_INSTRUMENTS, MINISTRY_GROUPS, RehearsalEvent, MONTHS_PT } from '../types';

type PdfContent = Record<string, unknown>;
import { calcFamilyTotals, calcFamilyPercentages, calcMinistryTotals } from './orchestraCalculations';

// @ts-ignore - pdfmake font loading
pdfMake.vfs = pdfFonts?.pdfMake?.vfs || pdfFonts?.vfs || pdfFonts;

// ─── Color Palette (matching reference image exactly) ──────────────────
const C = {
    cordasBg: '#F9F1D8', cordasAccent: '#D4AF37', cordasDot: '#C9A832',
    madeirasBg: '#E0ECF8', madeirasAccent: '#4A90E2', madeirasDot: '#3A7BC8',
    metaisBg: '#E2F0E5', metaisAccent: '#50C878', metaisDot: '#3DAF60',
    acordeonBg: '#ECECEC', acordeonAccent: '#9E9E9E', acordeonDot: '#888888',
    pageBg: '#E8ECF0',
    cardBg: '#FFFFFF',
    headerBar: '#C8CDD4',
    sectionHeader: '#3B3B3B',
    titleColor: '#1B2A4A',
    subtitleColor: '#4A4A4A',
    labelColor: '#777777',
    textDark: '#222222',
    textMuted: '#999999',
    textLight: '#FFFFFF',
    darkCard: '#1E293B',
    darkCardAlt: '#334155',
    tableBorder: '#D0D0D0',
    tableZebra: '#F8F8F8',
    hinoBarBg: '#D6DAE0',
};

// ─── Colored dot for instrument families ──────────────────────────────
function colorDot(color: string, size = 5): PdfContent {
    return {
        canvas: [{ type: 'ellipse', x: size / 2, y: size / 2 + 1, r1: size / 2, r2: size / 2, color }],
        width: size + 3,
        margin: [0, 2, 0, 0],
    };
}

// ─── Progress bar with optional ideal-marker tick and over-limit red ──
// idealPct: if provided, draws a vertical tick at that position.
// Bar fill turns red when realPct > idealPct (only when idealPct is not null).
function progressBar(pct: number, color: string, idealPct: number | null = null, width = 105, height = 6): PdfContent {
    const fillW = Math.max(0, Math.min(pct, 100)) * (width / 100);
    const overLimit = idealPct !== null && pct > idealPct;
    const fillColor = overLimit ? '#E53E3E' : color;
    const tickX = idealPct !== null ? Math.round(idealPct * (width / 100)) : null;

    return {
        canvas: [
            // Background track
            { type: 'rect', x: 0, y: 0, w: width, h: height, r: 3, color: '#E0E0E0' },
            // Fill
            ...(fillW > 0 ? [{ type: 'rect', x: 0, y: 0, w: fillW, h: height, r: 3, color: fillColor }] : []),
            // Ideal marker tick (thin vertical line)
            ...(tickX !== null ? [{
                type: 'rect', x: tickX - 1, y: 0, w: 2, h: height, color: '#555555',
            }] : []),
        ],
        margin: [0, 3, 0, 0],
    };
}

// ─── Category analysis card (Cordas, Madeiras, etc.) ──────────────────
function categoryCard(
    label: string, total: number, realPct: number,
    idealPct: number | null, bgColor: string, accentColor: string
): PdfContent {
    const idealStr = idealPct !== null ? `${idealPct}%` : '-';
    const overLimit = idealPct !== null && realPct > idealPct;
    const pctColor = overLimit ? '#E53E3E' : accentColor;
    return {
        table: {
            widths: ['*'],
            body: [[{
                fillColor: bgColor,
                margin: [10, 10, 10, 10],
                stack: [
                    // Title
                    { text: label, bold: true, fontSize: 9, color: C.sectionHeader, alignment: 'center', margin: [0, 0, 0, 4] },
                    // Number + Percentage on same row, clean hierarchy
                    {
                        columns: [
                            {
                                stack: [
                                    { text: String(total), fontSize: 26, bold: true, color: C.textDark, alignment: 'center' },
                                    { text: 'músicos', fontSize: 5.5, color: C.labelColor, alignment: 'center', margin: [0, -2, 0, 0] },
                                ],
                                width: '*',
                            },
                            {
                                stack: [
                                    { text: `${realPct}%`, fontSize: 26, bold: true, color: pctColor, alignment: 'center' },
                                    { text: 'participação', fontSize: 5.5, color: C.labelColor, alignment: 'center', margin: [0, -2, 0, 0] },
                                ],
                                width: '*',
                            },
                        ],
                        margin: [0, 2, 0, 6],
                    },
                    // Progress bar with ideal marker
                    progressBar(realPct, accentColor, idealPct),
                    // Ideal label
                    { text: `Real: ${realPct}%   ·   Ideal: ${idealStr}`, fontSize: 6.5, color: C.labelColor, alignment: 'center', margin: [0, 5, 0, 0] },
                ],
            }]],
        },
        layout: {
            hLineWidth: () => 0, vLineWidth: () => 0,
        },
    };
}

// ─── Bar Chart Card (Compares Real vs Ideal) ─────────────────────────
function buildBarChartCard(pct: { cordas: number; madeiras: number; metais: number; acordeon: number }): PdfContent {
    const height = 90;
    const width = 160;

    // Four categories
    const categories = [
        { label: 'Cordas', real: pct.cordas, ideal: 50, color: C.cordasAccent },
        { label: 'Madeiras', real: pct.madeiras, ideal: 25, color: C.madeirasAccent },
        { label: 'Metais', real: pct.metais, ideal: 25, color: C.metaisAccent },
        { label: 'Acordeon', real: pct.acordeon, ideal: 0, color: C.acordeonAccent },
    ];

    const barWidth = 20;
    const spacing = (width - (4 * barWidth)) / 5;

    const shapes: PdfContent[] = [];

    // Background lines (25%, 50%, 75%, 100%)
    for (let i = 0; i <= 4; i++) {
        const y = height - (i * 22.5);
        shapes.push({ type: 'line', x1: 0, y1: y, x2: width, y2: y, lineWidth: 0.5, lineColor: '#E0E0E0' });
    }

    // Bars and Ideal markers
    categories.forEach((cat, idx) => {
        const x = spacing + (idx * (barWidth + spacing));
        const barHeight = Math.max((cat.real / 100) * height, 0);
        // Ensure bar height doesn't exceed container
        const finalBarHeight = Math.min(barHeight, height);
        const y = height - finalBarHeight;

        if (finalBarHeight > 0) {
            shapes.push({ type: 'rect', x, y, w: barWidth, h: finalBarHeight, color: cat.color });
        }

        if (cat.ideal > 0) {
            const idealY = height - ((cat.ideal / 100) * height);
            shapes.push({ type: 'line', x1: x - 4, y1: idealY, x2: x + barWidth + 4, y2: idealY, lineWidth: 2, lineColor: '#1E293B', lineCap: 'round' });
        }
    });

    return {
        stack: [
            { text: 'COMPARAÇÃO % REAL VS IDEAL', fontSize: 7, bold: true, color: C.sectionHeader, alignment: 'center', margin: [0, 6, 0, 6] },
            {
                canvas: shapes,
                width: width,
                height: height,
                alignment: 'center',
                margin: [0, 5, 0, 4]
            },
            {
                columns: categories.map(c => ({
                    stack: [
                        { text: `${c.real}%`, fontSize: 7, bold: true, color: c.color, alignment: 'center' },
                        { text: c.label, fontSize: 6, bold: true, color: C.labelColor, alignment: 'center' }
                    ],
                    width: '*'
                })),
                margin: [4, 0, 4, 8]
            }
        ],
    };
}

// ─── Single ministry group block (standardized header + left-aligned qty) ──
function buildMinistryGroupBlock(
    group: { label: string; items: { label: string; value: number; tocaram: number }[] },
): PdfContent | null {
    const activeItems = group.items.filter(i => i.value > 0);
    if (activeItems.length === 0) return null;

    const bodyRows: PdfContent[][] = [
        [{ text: group.label.toUpperCase(), bold: true, fontSize: 6, color: C.textLight, fillColor: C.headerBar, alignment: 'center', margin: [0, 2, 0, 2] }],
    ];
    for (const item of activeItems) {
        const naoTocaram = Math.max(0, item.value - item.tocaram);
        const subLabel = item.tocaram > 0
            ? `${item.label} (${item.tocaram} toc. · ${naoTocaram} tot.)`
            : item.label;
        bodyRows.push([{
            columns: [
                { text: String(item.value), bold: true, fontSize: 7, color: C.textDark, width: 14, alignment: 'left' },
                { text: subLabel, fontSize: 5.5, color: C.labelColor, margin: [2, 0.5, 0, 0] },
            ],
            margin: [3, 1.5, 3, 1.5],
        }]);
    }

    return {
        table: { widths: ['*'], body: bodyRows },
        layout: {
            hLineWidth: (i: number) => (i === 0 || i === 1) ? 0.5 : 0.3,
            vLineWidth: () => 0.5,
            hLineColor: () => C.tableBorder,
            vLineColor: () => C.tableBorder,
        },
        margin: [0, 0, 0, 2],
    };
}

// ─── Ministry two-column layout (saves vertical space) ────────────────
function ministryTwoColumnLayout(
    groups: { label: string; items: { label: string; value: number; tocaram: number }[] }[],
    organistasMusicos: number,
): PdfContent {
    const blocks: PdfContent[] = [];
    const groupTotals: { label: string; total: number }[] = [];

    for (const group of groups) {
        const groupTotal = group.items.reduce((s, i) => s + Math.max(0, i.value - i.tocaram), 0);
        groupTotals.push({ label: group.label, total: groupTotal });
        const block = buildMinistryGroupBlock(group);
        if (block) blocks.push(block);
    }

    // Split blocks into two columns (left gets first half, right gets second)
    const mid = Math.ceil(blocks.length / 2);
    const leftBlocks = blocks.slice(0, mid);
    const rightBlocks = blocks.slice(mid);

    const columnsContent: PdfContent = {
        columns: [
            { width: '50%', stack: leftBlocks },
            { width: '50%', stack: rightBlocks, margin: [3, 0, 0, 0] },
        ],
    };

    // TOTAL row (compact)
    const totalRows: PdfContent[][] = [[
        { text: 'TOTAL', bold: true, fontSize: 6, color: C.textLight, fillColor: C.sectionHeader, alignment: 'center', margin: [0, 2, 0, 2], colSpan: 2 },
        {},
    ]];
    totalRows.push([
        { text: String(organistasMusicos), bold: true, fontSize: 6, color: C.textDark, alignment: 'left', width: 14, margin: [3, 1.5, 0, 1.5] },
        { text: 'Org. + Músicos', fontSize: 5.5, color: C.labelColor, margin: [2, 1.5, 0, 1.5] },
    ]);
    for (const gt of groupTotals) {
        if (gt.total === 0) continue;
        totalRows.push([
            { text: String(gt.total), bold: true, fontSize: 6, color: C.textDark, alignment: 'left', width: 14, margin: [3, 1.5, 0, 1.5] },
            { text: gt.label, fontSize: 5.5, color: C.labelColor, margin: [2, 1.5, 0, 1.5] },
        ]);
    }

    const totalTable: PdfContent = {
        table: { widths: [14, '*'], body: totalRows },
        layout: {
            hLineWidth: (i: number) => (i === 0 || i === 1) ? 0.5 : 0.3,
            vLineWidth: () => 0.5,
            hLineColor: () => C.tableBorder,
            vLineColor: () => C.tableBorder,
        },
        margin: [0, 2, 0, 0],
    };

    return { stack: [columnsContent, totalTable] };
}

// ═══════════════════════════════════════════════════════════════════════
// STATISTICS DOC DEFINITION BUILDER
// ═══════════════════════════════════════════════════════════════════════
function buildStatisticsDocDef(
    stat: EventStatistic,
    congregation?: Congregation | null,
    anciao?: Anciao | null,
): TDocumentDefinitions {
    const ft = calcFamilyTotals(stat);
    const pct = calcFamilyPercentages(ft);
    const mt = calcMinistryTotals(stat);

    const eventDateFormatted = new Date(stat.event_date + 'T00:00:00').toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'long', year: 'numeric'
    }).toUpperCase();

    // ─── Instrument detail rows ───────────────────────────────────────
    const instrumentRows: PdfContent[][] = [];

    const addFamily = (label: string, total: number, dotColor: string, bgColor: string, instruments: readonly { key: string; label: string }[]) => {
        // Only include instruments with value > 0
        const active = instruments.filter(inst => ((stat[inst.key as keyof EventStatistic] as number) || 0) > 0);
        if (active.length === 0) return; // skip family entirely if no instruments present

        // Family header row
        instrumentRows.push([
            {
                columns: [
                    colorDot(dotColor, 6),
                    { text: label, bold: true, fontSize: 7.5, color: C.sectionHeader, margin: [2, 0, 0, 0] },
                ],
                fillColor: bgColor,
                margin: [3, 2, 0, 2],
            },
            { text: String(total), bold: true, fontSize: 7.5, alignment: 'center', fillColor: bgColor, margin: [0, 2] },
        ]);
        // Individual instruments (only those with value > 0)
        active.forEach((inst, idx) => {
            const val = (stat[inst.key as keyof EventStatistic] as number) || 0;
            const zebra = idx % 2 === 0 ? C.tableZebra : C.cardBg;
            instrumentRows.push([
                {
                    columns: [
                        colorDot(dotColor, 4),
                        { text: inst.label, fontSize: 7, color: C.textDark, margin: [2, 0, 0, 0] },
                    ],
                    fillColor: zebra,
                    margin: [10, 1.5, 0, 1.5],
                },
                { text: String(val), fontSize: 7, alignment: 'center', fillColor: zebra, color: C.textDark, margin: [0, 1.5] },
            ]);
        });
    };

    addFamily('CORDAS', ft.cordas, C.cordasDot, C.cordasBg, STAT_INSTRUMENTS.cordas);
    addFamily('MADEIRAS', ft.madeiras, C.madeirasDot, C.madeirasBg, STAT_INSTRUMENTS.madeiras);
    addFamily('METAIS', ft.metais, C.metaisDot, C.metaisBg, STAT_INSTRUMENTS.metais);
    addFamily('ACORDEON', ft.acordeon, C.acordeonDot, C.acordeonBg, STAT_INSTRUMENTS.acordeon);

    // ─── Ministry items grouped ───────────────────────────────────────
    const ministryGroups = MINISTRY_GROUPS.map(g => ({
        label: g.label,
        items: g.fields.map(f => ({
            label: f.label,
            value: (stat[f.key as keyof EventStatistic] as number) || 0,
            tocaram: (stat[f.tocKey as keyof EventStatistic] as number) || 0,
        })),
    }));

    // ─── Bar Chart content ────────────────────────────────────────────
    const barChartContent = buildBarChartCard(pct);

    // ═══════════════════════════════════════════════════════════════════
    // DOCUMENT
    // ═══════════════════════════════════════════════════════════════════
    const docDefinition: TDocumentDefinitions = ({
        pageSize: 'A4',
        pageMargins: [14, 14, 14, 28],
        background: () => ({
            canvas: [{ type: 'rect', x: 0, y: 0, w: 595.28, h: 841.89, color: C.pageBg }],
        }),

        content: [
            // ═══════════════════════════════════════════════════════════
            // HEADER
            // ═══════════════════════════════════════════════════════════
            {
                table: {
                    widths: ['*'],
                    body: [[{
                        stack: [
                            { text: 'CONGREGAÇÃO CRISTÃ NO BRASIL', fontSize: 16, bold: true, color: C.titleColor, alignment: 'center', margin: [0, 12, 0, 3] },
                            { text: `${(congregation?.name || '').toUpperCase()} - ${congregation?.city || ''} / ${congregation?.state || ''}`, fontSize: 9, bold: true, color: C.subtitleColor, alignment: 'center', margin: [0, 0, 0, 2] },
                            { text: 'ESTATÍSTICA - ENSAIO REGIONAL', fontSize: 8, bold: true, color: C.subtitleColor, alignment: 'center', margin: [0, 2, 0, 1] },
                            { text: eventDateFormatted, fontSize: 8, color: C.labelColor, alignment: 'center', margin: [0, 0, 0, 10] },
                        ],
                        fillColor: C.cardBg,
                        margin: [0, 0, 0, 0],
                    }]],
                },
                layout: { hLineWidth: () => 0, vLineWidth: () => 0 },
                margin: [0, 0, 0, 4],
            },

            // ═══════════════════════════════════════════════════════════
            // PRESIDÊNCIA BAR
            // ═══════════════════════════════════════════════════════════
            {
                table: {
                    widths: ['*'],
                    body: [[{
                        text: 'PRESIDÊNCIA',
                        bold: true, fontSize: 9, alignment: 'center',
                        fillColor: C.headerBar, color: C.sectionHeader,
                        margin: [0, 4, 0, 4],
                    }]],
                },
                layout: { hLineWidth: () => 0, vLineWidth: () => 0 },
                margin: [0, 0, 0, 4],
            },

            // Presidency cards (3 columns)
            {
                columns: [
                    {
                        width: '33%',
                        table: {
                            widths: ['*'], body: [[{
                                stack: [
                                    { text: 'ANCIÃO:', fontSize: 6, bold: true, color: C.labelColor, margin: [0, 0, 0, 1] },
                                    { text: `IR. ${(anciao?.name || stat.anciao_nome_custom || '').toUpperCase()}`, fontSize: 8, bold: true, color: C.textDark },
                                ],
                                fillColor: C.cardBg, margin: [8, 8, 8, 8],
                            }]]
                        },
                        layout: { hLineWidth: () => 0.6, vLineWidth: () => 0.6, hLineColor: () => C.tableBorder, vLineColor: () => C.tableBorder },
                    },
                    {
                        width: '34%',
                        table: {
                            widths: ['*'], body: [[{
                                stack: [
                                    { text: 'PALAVRA:', fontSize: 6, bold: true, color: C.labelColor, margin: [0, 0, 0, 1] },
                                    { text: (stat.palavra || '').toUpperCase(), fontSize: 8, bold: true, color: C.textDark },
                                ],
                                fillColor: C.cardBg, margin: [8, 8, 8, 8],
                            }]]
                        },
                        layout: { hLineWidth: () => 0.6, vLineWidth: () => 0.6, hLineColor: () => C.tableBorder, vLineColor: () => C.tableBorder },
                        margin: [4, 0, 4, 0],
                    },
                    {
                        width: '33%',
                        table: {
                            widths: ['*'], body: [[{
                                stack: [
                                    {
                                        stack: [
                                            { text: 'ENC. REG./LOCAL:', fontSize: 6, bold: true, color: C.labelColor, margin: [0, 0, 0, 1] },
                                            { text: `IR. ${(stat.enc_regionais_nomes_custom?.join(', ') || '-').toUpperCase()}`, fontSize: 8, bold: true, color: C.textDark },
                                        ],
                                    },
                                ],
                                fillColor: C.cardBg, margin: [8, 8, 8, 8],
                            }]]
                        },
                        layout: { hLineWidth: () => 0.6, vLineWidth: () => 0.6, hLineColor: () => C.tableBorder, vLineColor: () => C.tableBorder },
                    },
                ],
                margin: [0, 0, 0, 6],
            },

            // ═══════════════════════════════════════════════════════════
            // SECTION HEADERS (two-column)
            // ═══════════════════════════════════════════════════════════
            {
                columns: [
                    {
                        width: '40%',
                        table: {
                            widths: ['*'], body: [[{
                                text: 'FORMAÇÃO ORQUESTRAL - DETALHAMENTO',
                                bold: true, fontSize: 7.5, alignment: 'center',
                                fillColor: C.headerBar, color: C.sectionHeader,
                                margin: [0, 3, 0, 3],
                            }]]
                        },
                        layout: { hLineWidth: () => 0, vLineWidth: () => 0 },
                    },
                    {
                        width: '60%',
                        table: {
                            widths: ['*'], body: [[{
                                text: 'DASHBOARD DE ANÁLISE',
                                bold: true, fontSize: 7.5, alignment: 'center',
                                fillColor: C.headerBar, color: C.sectionHeader,
                                margin: [0, 3, 0, 3],
                            }]]
                        },
                        layout: { hLineWidth: () => 0, vLineWidth: () => 0 },
                        margin: [6, 0, 0, 0],
                    },
                ],
                margin: [0, 0, 0, 4],
            },

            // ═══════════════════════════════════════════════════════════
            // TWO-COLUMN MAIN BODY
            // ═══════════════════════════════════════════════════════════
            {
                columns: [
                    // ──────────────────────────────────────────────────
                    // LEFT COLUMN: Instrument Table
                    // ──────────────────────────────────────────────────
                    {
                        width: '40%',
                        stack: [
                            {
                                table: {
                                    headerRows: 1,
                                    widths: ['*', 55],
                                    body: [
                                        [
                                            { text: 'INSTRUMENTOS', bold: true, fontSize: 7, fillColor: C.headerBar, color: C.sectionHeader, alignment: 'center', margin: [4, 3] },
                                            { text: 'QUANTIDADE', bold: true, fontSize: 7, fillColor: C.headerBar, color: C.sectionHeader, alignment: 'center', margin: [2, 3] },
                                        ],
                                        ...instrumentRows,
                                    ],
                                },
                                layout: {
                                    hLineWidth: (i: number, node: { table: { body: unknown[]; widths: unknown[] } }) => (i === 0 || i === 1 || i === node.table.body.length) ? 0.7 : 0.3,
                                    vLineWidth: (i: number, node: { table: { body: unknown[]; widths: unknown[] } }) => (i === 0 || i === node.table.widths.length) ? 0.7 : 0.3,
                                    hLineColor: () => C.tableBorder,
                                    vLineColor: () => C.tableBorder,
                                    paddingLeft: () => 1,
                                    paddingRight: () => 1,
                                    paddingTop: () => 0,
                                    paddingBottom: () => 0,
                                },
                            },
                            // Total instruments footer
                            {
                                table: {
                                    widths: ['*', 55],
                                    body: [[
                                        { text: 'TOTAL', bold: true, fontSize: 7, color: C.textLight, fillColor: C.sectionHeader, alignment: 'center', margin: [4, 4] },
                                        { text: String(ft.total), bold: true, fontSize: 7, color: C.textLight, fillColor: C.sectionHeader, alignment: 'center', margin: [2, 4] },
                                    ]],
                                },
                                layout: { hLineWidth: () => 0, vLineWidth: () => 0 },
                                margin: [0, 1, 0, 0],
                            },

                            // ── ORGANISTAS E MÚSICOS ──────────────────
                            {
                                table: {
                                    widths: ['*'],
                                    body: [[{
                                        text: 'ORGANISTAS E MÚSICOS',
                                        bold: true, fontSize: 7, alignment: 'center',
                                        fillColor: C.headerBar, color: C.sectionHeader,
                                        margin: [0, 3, 0, 3],
                                    }]],
                                },
                                layout: { hLineWidth: () => 0, vLineWidth: () => 0 },
                                margin: [0, 4, 0, 0],
                            },
                            {
                                table: {
                                    widths: [20, '*'],
                                    body: [
                                        [
                                            { text: String(stat.organistas || 0), bold: true, fontSize: 7, color: C.textDark, alignment: 'left', margin: [4, 2, 4, 2], fillColor: C.cardBg },
                                            { text: `Organista${(stat.organistas || 0) !== 1 ? 's' : ''}`, fontSize: 7, color: C.textDark, margin: [2, 2, 0, 2], fillColor: C.cardBg },
                                        ],
                                        [
                                            { text: String(ft.total), bold: true, fontSize: 7, color: C.textDark, alignment: 'left', margin: [4, 2, 4, 2], fillColor: C.tableZebra },
                                            { text: 'Músicos', fontSize: 7, color: C.textDark, margin: [2, 2, 0, 2], fillColor: C.tableZebra },
                                        ],
                                    ],
                                },
                                layout: {
                                    hLineWidth: () => 0.3, vLineWidth: () => 0,
                                    hLineColor: () => C.tableBorder,
                                },
                            },
                            // Total Organistas + Músicos
                            {
                                table: {
                                    widths: ['*', 20],
                                    body: [[
                                        { text: 'TOTAL', bold: true, fontSize: 7, color: C.textLight, fillColor: C.sectionHeader, alignment: 'center', margin: [4, 4] },
                                        { text: String((stat.organistas || 0) + ft.total), bold: true, fontSize: 7, color: C.textLight, fillColor: C.sectionHeader, alignment: 'center', margin: [2, 4] },
                                    ]],
                                },
                                layout: { hLineWidth: () => 0, vLineWidth: () => 0 },
                                margin: [0, 1, 0, 0],
                            },

                            // ── HINOS ─────────────────────────────────
                            {
                                table: {
                                    widths: ['*'],
                                    body: [[{
                                        text: 'HINOS',
                                        bold: true, fontSize: 7, alignment: 'center',
                                        fillColor: C.headerBar, color: C.sectionHeader,
                                        margin: [0, 3, 0, 3],
                                    }]],
                                },
                                layout: { hLineWidth: () => 0, vLineWidth: () => 0 },
                                margin: [0, 4, 0, 0],
                            },
                            {
                                table: {
                                    widths: [20, '*'],
                                    body: [
                                        [
                                            { text: stat.hino_abertura ? '1' : '0', bold: true, fontSize: 7, color: C.textDark, alignment: 'left', margin: [4, 2, 4, 2], fillColor: C.cardBg },
                                            { text: `Abertura${stat.hino_abertura ? `: ${stat.hino_abertura}` : ''}`, fontSize: 7, color: C.textDark, margin: [2, 2, 0, 2], fillColor: C.cardBg },
                                        ],
                                        [
                                            { text: String(stat.hinos_ensaiados || 0), bold: true, fontSize: 7, color: C.textDark, alignment: 'left', margin: [4, 2, 4, 2], fillColor: C.tableZebra },
                                            {
                                                stack: [
                                                    { text: `Hino${(stat.hinos_ensaiados || 0) !== 1 ? 's' : ''} Ensaiados`, fontSize: 7, color: C.textDark },
                                                    ...(stat.hinos_ensaiados_lista && stat.hinos_ensaiados_lista.length > 0
                                                        ? [{ text: stat.hinos_ensaiados_lista.join(', ') + '.', fontSize: 6, color: C.labelColor, margin: [0, 1, 0, 0] }]
                                                        : []),
                                                ],
                                                margin: [2, 2, 0, 2],
                                                fillColor: C.tableZebra,
                                            },
                                        ],
                                    ],
                                },
                                layout: {
                                    hLineWidth: () => 0.3, vLineWidth: () => 0,
                                    hLineColor: () => C.tableBorder,
                                },
                            },
                            // ──────────────────────────────────────────────────
                            // NEW GRAPHIC: Bar Chart (now placed below Hinos)
                            // ──────────────────────────────────────────────────
                            {
                                table: {
                                    widths: ['*'],
                                    body: [[{
                                        ...barChartContent,
                                        fillColor: C.cardBg,
                                    }]]
                                },
                                layout: { hLineWidth: () => 0.6, vLineWidth: () => 0.6, hLineColor: () => C.tableBorder, vLineColor: () => C.tableBorder },
                                margin: [0, 4, 0, 0],
                            },
                        ],
                    },

                    // ──────────────────────────────────────────────────
                    // RIGHT COLUMN: Dashboard
                    // ──────────────────────────────────────────────────
                    {
                        width: '60%',
                        stack: [
                            // === Row 1: Category Cards (2×2) ===
                            {
                                columns: [
                                    { width: '50%', ...categoryCard('CORDAS', ft.cordas, pct.cordas, 50, C.cordasBg, C.cordasAccent) },
                                    { width: '50%', ...categoryCard('MADEIRAS', ft.madeiras, pct.madeiras, 25, C.madeirasBg, C.madeirasAccent), margin: [4, 0, 0, 0] },
                                ],
                                margin: [0, 0, 0, 4],
                            },
                            {
                                columns: [
                                    { width: '50%', ...categoryCard('METAIS', ft.metais, pct.metais, 25, C.metaisBg, C.metaisAccent) },
                                    { width: '50%', ...categoryCard('ACORDEON', ft.acordeon, pct.acordeon, null, C.acordeonBg, C.acordeonAccent), margin: [4, 0, 0, 0] },
                                ],
                                margin: [0, 0, 0, 5],
                            },

                            // === Row 2: Ministry (Two-Column Layout) ===
                            {
                                table: {
                                    widths: ['*'], body: [[{
                                        stack: [
                                            { text: 'PESSOAL ADICIONAL', fontSize: 7, bold: true, color: C.sectionHeader, fillColor: C.headerBar, alignment: 'center', margin: [0, 3, 0, 3] },
                                            {
                                                ...ministryTwoColumnLayout(ministryGroups, mt.musicosOrganistas),
                                                margin: [4, 3, 4, 4],
                                            },
                                        ],
                                        fillColor: C.cardBg,
                                    }]]
                                },
                                layout: { hLineWidth: () => 0.6, vLineWidth: () => 0.6, hLineColor: () => C.tableBorder, vLineColor: () => C.tableBorder },
                                margin: [0, 0, 0, 3],
                            },
                        ],
                        margin: [6, 0, 0, 0],
                    },
                ],
                columnGap: 0,
            },
        ],

        // ═══════════════════════════════════════════════════════════════
        // FOOTER
        // ═══════════════════════════════════════════════════════════════
        footer: (currentPage: number, pageCount: number) => ({
            columns: [
                { text: 'TEMPLATE DE EXPORTAÇÃO v1.2', fontSize: 6, color: C.labelColor, margin: [15, 0, 0, 0] },
                { text: `Página ${currentPage} de ${pageCount}`, fontSize: 6, color: C.labelColor, alignment: 'right', margin: [0, 0, 15, 0] },
            ],
            margin: [0, 8, 0, 0],
        }),

        styles: {
            title: { fontSize: 16, bold: true, margin: [0, 0, 0, 4] },
        },
        defaultStyle: {
            font: 'Roboto',
        },
    }) as unknown as TDocumentDefinitions;

    return docDefinition as unknown as TDocumentDefinitions;
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN PDF GENERATION
// ═══════════════════════════════════════════════════════════════════════
export function generateStatisticsPDF(
    stat: EventStatistic,
    congregation?: Congregation | null,
    anciao?: Anciao | null,
) {
    const fileName = `Estatistica_${congregation?.name || 'Evento'}_${stat.event_date}.pdf`;
    pdfMake.createPdf(buildStatisticsDocDef(stat, congregation, anciao)).download(fileName);
}

/** Returns a promise resolving to the PDF data URL (for preview) */
export function getStatisticsPdfDataUrl(
    stat: EventStatistic,
    congregation?: Congregation | null,
    anciao?: Anciao | null,
): Promise<string> {
    return new Promise((resolve) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (pdfMake.createPdf(buildStatisticsDocDef(stat, congregation, anciao)) as any).getDataUrl(resolve);
    });
}

// ═══════════════════════════════════════════════════════════════════════
// PRESENCE LIST PDF
// ═══════════════════════════════════════════════════════════════════════
export function generatePresencePDF(
    event: { day: string; month: string; location: string; time: string; conductor: string; type: string },
    presences: { name: string; instrument: string; phone: string; email: string }[],
): void {
    const headerRows: PdfContent[][] = [
        [
            { text: '#', bold: true, fontSize: 8, fillColor: C.headerBar, color: C.sectionHeader, alignment: 'center', margin: [4, 4] },
            { text: 'NOME', bold: true, fontSize: 8, fillColor: C.headerBar, color: C.sectionHeader, margin: [4, 4] },
            { text: 'INSTRUMENTO', bold: true, fontSize: 8, fillColor: C.headerBar, color: C.sectionHeader, margin: [4, 4] },
            { text: 'TELEFONE', bold: true, fontSize: 8, fillColor: C.headerBar, color: C.sectionHeader, margin: [4, 4] },
        ],
    ];

    const dataRows: PdfContent[][] = presences.map((p, i) => {
        const zebra = i % 2 === 0 ? C.tableZebra : C.cardBg;
        return [
            { text: String(i + 1), fontSize: 7.5, fillColor: zebra, alignment: 'center', margin: [2, 3] },
            { text: p.name, fontSize: 7.5, fillColor: zebra, margin: [4, 3] },
            { text: p.instrument, fontSize: 7.5, fillColor: zebra, margin: [4, 3] },
            { text: p.phone || '-', fontSize: 7.5, fillColor: zebra, margin: [4, 3] },
        ];
    });

    const docDefinition: TDocumentDefinitions = {
        pageSize: 'A4',
        pageMargins: [30, 30, 30, 40],
        background: () => ({
            canvas: [{ type: 'rect', x: 0, y: 0, w: 595.28, h: 841.89, color: C.pageBg }],
        }),
        content: [
            // Header
            {
                table: {
                    widths: ['*'], body: [[{
                        stack: [
                            { text: 'CONGREGAÇÃO CRISTÃ NO BRASIL', fontSize: 14, bold: true, color: C.titleColor, alignment: 'center', margin: [0, 10, 0, 3] },
                            { text: 'LISTA DE PRESENÇA', fontSize: 11, bold: true, color: C.subtitleColor, alignment: 'center', margin: [0, 0, 0, 2] },
                            { text: event.location, fontSize: 9, color: C.labelColor, alignment: 'center', margin: [0, 0, 0, 2] },
                            { text: `${event.day}${event.month ? ' de ' + event.month : ''}${event.time ? ' — ' + event.time : ''}`, fontSize: 8, color: C.labelColor, alignment: 'center', margin: [0, 0, 0, event.conductor ? 2 : 8] },
                            ...(event.conductor ? [{ text: `Maestro: ${event.conductor}`, fontSize: 8, color: C.labelColor, alignment: 'center' as const, margin: [0, 0, 0, 8] }] : []),
                        ],
                        fillColor: C.cardBg,
                    }]]
                },
                layout: { hLineWidth: () => 0, vLineWidth: () => 0 },
                margin: [0, 0, 0, 10],
            },
            // Table
            {
                table: {
                    headerRows: 1,
                    widths: [25, '*', 100, 90],
                    body: [...headerRows, ...dataRows],
                },
                layout: {
                    hLineWidth: (i: number, node: { table: { body: unknown[] } }) => (i === 0 || i === 1 || i === node.table.body.length) ? 0.7 : 0.3,
                    vLineWidth: () => 0.5,
                    hLineColor: () => C.tableBorder,
                    vLineColor: () => C.tableBorder,
                },
            },
            // Footer total
            {
                text: `Total de confirmados: ${presences.length}`,
                fontSize: 9,
                bold: true,
                color: C.sectionHeader,
                alignment: 'right',
                margin: [0, 8, 0, 0],
            },
        ],
        footer: (currentPage: number, pageCount: number) => ({
            columns: [
                { text: 'Lista de Presença', fontSize: 6, color: C.labelColor, margin: [30, 0, 0, 0] },
                { text: `Página ${currentPage} de ${pageCount}`, fontSize: 6, color: C.labelColor, alignment: 'right', margin: [0, 0, 30, 0] },
            ],
            margin: [0, 8, 0, 0],
        }),
        defaultStyle: { font: 'Roboto' },
    } as unknown as TDocumentDefinitions;

    const safeDay = event.day.replace(/\//g, '-');
    pdfMake.createPdf(docDefinition).download(`Lista_Presenca_${safeDay}.pdf`);
}

// ═══════════════════════════════════════════════════════════════════════
// ANNUAL SCHEDULE PDF
// ═══════════════════════════════════════════════════════════════════════
export function generateSchedulePDF(
    events: RehearsalEvent[],
    year: number,
    congregationName?: string,
): void {
    // Group events by month name
    const byMonth: Record<string, RehearsalEvent[]> = {};
    MONTHS_PT.forEach(m => { byMonth[m] = []; });
    events.forEach(ev => {
        if (byMonth[ev.month] !== undefined) {
            byMonth[ev.month].push(ev);
        }
    });

    const content: PdfContent[] = [
        // Title header
        {
            table: {
                widths: ['*'], body: [[{
                    stack: [
                        { text: 'CONGREGAÇÃO CRISTÃ NO BRASIL', fontSize: 14, bold: true, color: C.titleColor, alignment: 'center', margin: [0, 10, 0, 3] },
                        ...(congregationName ? [{ text: congregationName.toUpperCase(), fontSize: 9, bold: true, color: C.subtitleColor, alignment: 'center' as const, margin: [0, 0, 0, 2] }] : []),
                        { text: 'CRONOGRAMA DE ENSAIOS', fontSize: 11, bold: true, color: C.subtitleColor, alignment: 'center' as const, margin: [0, 0, 0, 2] },
                        { text: String(year), fontSize: 9, color: C.labelColor, alignment: 'center' as const, margin: [0, 0, 0, 8] },
                    ],
                    fillColor: C.cardBg,
                }]]
            },
            layout: { hLineWidth: () => 0, vLineWidth: () => 0 },
            margin: [0, 0, 0, 12],
        } as PdfContent,
    ];

    MONTHS_PT.forEach(month => {
        const monthEvents = byMonth[month];
        if (monthEvents.length === 0) return;

        // Month section header
        content.push({
            table: {
                widths: ['*'], body: [[{
                    text: month.toUpperCase(),
                    bold: true, fontSize: 9, alignment: 'center',
                    fillColor: C.headerBar, color: C.sectionHeader,
                    margin: [0, 4, 0, 4],
                }]]
            },
            layout: { hLineWidth: () => 0, vLineWidth: () => 0 },
            margin: [0, 6, 0, 2],
        } as PdfContent);

        const tableRows: PdfContent[][] = [
            [
                { text: 'DIA', bold: true, fontSize: 7.5, fillColor: C.headerBar, color: C.sectionHeader, alignment: 'center', margin: [2, 3] },
                { text: 'LOCAL', bold: true, fontSize: 7.5, fillColor: C.headerBar, color: C.sectionHeader, margin: [4, 3] },
                { text: 'MAESTRO', bold: true, fontSize: 7.5, fillColor: C.headerBar, color: C.sectionHeader, margin: [4, 3] },
                { text: 'TIPO', bold: true, fontSize: 7.5, fillColor: C.headerBar, color: C.sectionHeader, margin: [4, 3] },
                { text: 'STATUS', bold: true, fontSize: 7.5, fillColor: C.headerBar, color: C.sectionHeader, alignment: 'center', margin: [4, 3] },
            ],
        ];

        monthEvents.forEach((ev, i) => {
            const isCanceled = !!ev.canceled;
            const statusBg = isCanceled ? '#FDECEA' : (i % 2 === 0 ? C.tableZebra : C.cardBg);
            const rowBg = isCanceled ? '#FDECEA' : (i % 2 === 0 ? C.tableZebra : C.cardBg);
            const statusColor = isCanceled ? '#C0392B' : '#27AE60';
            tableRows.push([
                { text: ev.day, fontSize: 7.5, fillColor: rowBg, alignment: 'center', margin: [2, 3] },
                { text: ev.location, fontSize: 7.5, fillColor: rowBg, margin: [4, 3] },
                { text: ev.conductor, fontSize: 7.5, fillColor: rowBg, margin: [4, 3] },
                { text: ev.type, fontSize: 7.5, fillColor: rowBg, margin: [4, 3] },
                { text: isCanceled ? 'Cancelado' : 'Confirmado', fontSize: 7.5, fillColor: statusBg, color: statusColor, bold: true, alignment: 'center', margin: [4, 3] },
            ]);
        });

        content.push({
            table: {
                headerRows: 1,
                widths: [30, '*', 100, 80, 65],
                body: tableRows,
            },
            layout: {
                hLineWidth: (i: number, node: { table: { body: unknown[] } }) => (i === 0 || i === 1 || i === node.table.body.length) ? 0.7 : 0.3,
                vLineWidth: () => 0.5,
                hLineColor: () => C.tableBorder,
                vLineColor: () => C.tableBorder,
            },
            margin: [0, 0, 0, 4],
        } as PdfContent);
    });

    const docDefinition: TDocumentDefinitions = {
        pageSize: 'A4',
        pageMargins: [30, 30, 30, 40],
        background: () => ({
            canvas: [{ type: 'rect', x: 0, y: 0, w: 595.28, h: 841.89, color: C.pageBg }],
        }),
        content,
        footer: (currentPage: number, pageCount: number) => ({
            columns: [
                { text: `Cronograma ${year}`, fontSize: 6, color: C.labelColor, margin: [30, 0, 0, 0] },
                { text: `Página ${currentPage} de ${pageCount}`, fontSize: 6, color: C.labelColor, alignment: 'right', margin: [0, 0, 30, 0] },
            ],
            margin: [0, 8, 0, 0],
        }),
        defaultStyle: { font: 'Roboto' },
    } as unknown as TDocumentDefinitions;

    pdfMake.createPdf(docDefinition).download(`Cronograma_${year}.pdf`);
}
