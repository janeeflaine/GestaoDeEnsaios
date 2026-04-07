import pdfMake from 'pdfmake/build/pdfmake';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { EventStatistic, Congregation, Anciao, STAT_INSTRUMENTS, MINISTRY_FIELDS, RehearsalEvent, MONTHS_PT } from '../types';

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

// ─── Progress bar (slim, modern) ──────────────────────────────────────
function progressBar(pct: number, color: string, width = 105, height = 6): PdfContent {
    const fillW = Math.max(0, Math.min(pct, 100)) * (width / 100);
    return {
        canvas: [
            { type: 'rect', x: 0, y: 0, w: width, h: height, r: 3, color: '#E0E0E0' },
            ...(fillW > 0 ? [{ type: 'rect', x: 0, y: 0, w: fillW, h: height, r: 3, color }] : []),
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
                                    { text: `${realPct}%`, fontSize: 26, bold: true, color: accentColor, alignment: 'center' },
                                    { text: 'participação', fontSize: 5.5, color: C.labelColor, alignment: 'center', margin: [0, -2, 0, 0] },
                                ],
                                width: '*',
                            },
                        ],
                        margin: [0, 2, 0, 6],
                    },
                    // Progress bar
                    progressBar(realPct, accentColor),
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

// ─── Donut chart via canvas polyline arcs (returns canvas only) ───────
// Segments have a small angular gap between them; center is a dark navy circle.
function buildDonut(ft: { cordas: number; madeiras: number; metais: number; acordeon: number; total: number }, size = 100): PdfContent {
    const cx = size / 2, cy = size / 2;
    const outerR = size / 2 - 2, innerR = outerR * 0.44;
    const total = ft.total || 1;
    const gapAngle = 0.07; // radians gap between each segment

    const segments = [
        { value: ft.cordas, color: C.cordasAccent },
        { value: ft.madeiras, color: C.madeirasAccent },
        { value: ft.metais, color: C.metaisAccent },
        { value: ft.acordeon, color: C.acordeonAccent },
    ];

    const activeCount = segments.filter(s => s.value > 0).length;
    const shapes: PdfContent[] = [];
    let startAngle = -Math.PI / 2;

    segments.forEach(seg => {
        if (seg.value <= 0) { startAngle += (seg.value / total) * 2 * Math.PI; return; }
        const fullSweep = (seg.value / total) * 2 * Math.PI;
        const gap = activeCount > 1 ? gapAngle : 0;
        const sweep = fullSweep - gap;
        const actualStart = startAngle + gap / 2;
        if (sweep <= 0) { startAngle += fullSweep; return; }
        const steps = Math.max(16, Math.round(sweep * 20));
        const points: { x: number; y: number }[] = [];
        for (let i = 0; i <= steps; i++) {
            const a = actualStart + (sweep * i) / steps;
            points.push({ x: cx + outerR * Math.cos(a), y: cy + outerR * Math.sin(a) });
        }
        for (let i = steps; i >= 0; i--) {
            const a = actualStart + (sweep * i) / steps;
            points.push({ x: cx + innerR * Math.cos(a), y: cy + innerR * Math.sin(a) });
        }
        shapes.push({ type: 'polyline', points, closePath: true, color: seg.color });
        startAngle += fullSweep;
    });

    // Dark navy center circle
    shapes.push({ type: 'ellipse', x: cx, y: cy, r1: innerR - 2, r2: innerR - 2, color: C.darkCard });

    return { canvas: shapes, width: size, height: size, alignment: 'center' };
}

// ─── Donut card — reference-style with side category labels ────────────
// Layout: [left labels] | [donut + center overlay] | [right labels]
// Left:  Cordas (top) + Metais (bottom)
// Right: Madeiras (top) + Acordeon (bottom)
function buildDonutCard(ft: { cordas: number; madeiras: number; metais: number; acordeon: number; total: number }): PdfContent {
    const size = 100;
    // Math: canvas=100, dark circle center=50, innerR≈42*0.44-2≈16.5
    // Text block: 16pt num≈20px + 5pt label≈7px + gap1 = 28px → starts at 50-14=36
    // pullUp = -(100-36) = -64, compensate = 100-36-28 = 36
    const pullUp = -64;
    const compensate = 36;

    // Side label: colored indicator + category name + large colored number
    const sideLabel = (color: string, name: string, val: number, align: 'left' | 'right'): PdfContent => ({
        stack: [
            {
                columns: align === 'left' ? [
                    { canvas: [{ type: 'rect', x: 0, y: 1.5, w: 7, h: 7, r: 1, color }], width: 9 },
                    { text: name, fontSize: 5.5, color: C.labelColor, bold: true, margin: [1, 0, 0, 0] },
                ] : [
                    { text: name, fontSize: 5.5, color: C.labelColor, bold: true, alignment: 'right', width: '*', margin: [0, 0, 2, 0] },
                    { canvas: [{ type: 'rect', x: 0, y: 1.5, w: 7, h: 7, r: 1, color }], width: 9 },
                ],
            },
            { text: String(val), fontSize: 18, bold: true, color, alignment: align, margin: [0, 1, 0, 0] },
        ],
    });

    return {
        stack: [
            { text: 'TOTAL DE MÚSICOS POR CATEGORIA', fontSize: 7, bold: true, color: C.sectionHeader, alignment: 'center', margin: [0, 6, 0, 4] },
            {
                columns: [
                    // Left column: Cordas (top-ish) + spacer + Metais (bottom-ish)
                    {
                        width: '*',
                        stack: [
                            sideLabel(C.cordasAccent, 'Cordas', ft.cordas, 'left'),
                            { text: '', margin: [0, 18, 0, 0] },
                            sideLabel(C.metaisAccent, 'Metais', ft.metais, 'left'),
                        ],
                        margin: [4, 8, 0, 0],
                    },
                    // Center: canvas + white text overlaid on dark center
                    {
                        width: size,
                        stack: [
                            buildDonut(ft, size),
                            {
                                stack: [
                                    { text: String(ft.total), fontSize: 16, bold: true, color: '#FFFFFF', alignment: 'center' },
                                    { text: 'TOTAL', fontSize: 5, bold: true, color: '#94A3B8', alignment: 'center', margin: [0, 0, 0, 0] },
                                ],
                                margin: [0, pullUp, 0, compensate],
                            },
                        ],
                    },
                    // Right column: Madeiras (top-ish) + spacer + Acordeon (bottom-ish)
                    {
                        width: '*',
                        stack: [
                            sideLabel(C.madeirasAccent, 'Madeiras', ft.madeiras, 'right'),
                            { text: '', margin: [0, 18, 0, 0] },
                            sideLabel(C.acordeonAccent, 'Acordeon', ft.acordeon, 'right'),
                        ],
                        margin: [0, 8, 4, 0],
                    },
                ],
            },
        ],
    };
}

// ─── Ministry list (2-column grid, no bars) ───────────────────────────
function ministryList(items: { label: string; value: number }[]): PdfContent {
    const rows: PdfContent[] = [];
    for (let i = 0; i < items.length; i += 2) {
        const left = items[i];
        const right = items[i + 1];
        rows.push({
            columns: [
                {
                    width: '50%',
                    columns: [
                        { text: String(left.value), bold: true, fontSize: 11, color: C.textDark, width: 22, alignment: 'right' },
                        { text: left.label, fontSize: 7, color: C.labelColor, margin: [5, 2, 0, 0] },
                    ],
                    margin: [0, 0, 6, 0],
                },
                right ? {
                    width: '50%',
                    columns: [
                        { text: String(right.value), bold: true, fontSize: 11, color: C.textDark, width: 22, alignment: 'right' },
                        { text: right.label, fontSize: 7, color: C.labelColor, margin: [5, 2, 0, 0] },
                    ],
                } : { width: '50%', text: '' },
            ],
            margin: [0, 3, 0, 3],
        });
    }
    return { stack: rows };
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

    // ─── Ministry items for list ──────────────────────────────────────
    // "Músicos" uses ft.total (sum of all instrument seats) — not the manual stat.musicos field
    const ministryItems = MINISTRY_FIELDS.map(f => ({
        label: f.label.replace('Presentes', '').replace('Música', 'Música').trim(),
        value: f.key === 'musicos'
            ? ft.total
            : ((stat[f.key as keyof EventStatistic] as number) || 0),
    }));

    // ─── Donut content ────────────────────────────────────────────────
    const donutContent = buildDonutCard(ft);

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
                                        columns: [
                                            {
                                                stack: [
                                                    { text: 'HINOS', fontSize: 6, bold: true, color: C.labelColor },
                                                    { text: `Abertura: ${stat.hino_abertura || '-'}`, fontSize: 7, color: C.textDark, margin: [0, 2, 0, 0] },
                                                ],
                                                width: '*',
                                            },
                                            {
                                                stack: [
                                                    { text: '', fontSize: 6 },
                                                    { text: `Ensaiados: ${stat.hinos_ensaiados || '-'}`, fontSize: 7, color: C.textDark, margin: [0, 2, 0, 0] },
                                                ],
                                                width: '*',
                                            },
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

                            // === Row 2: Donut + Ministry Bars ===
                            {
                                columns: [
                                    // Donut Chart Card
                                    {
                                        width: '50%',
                                        table: {
                                            widths: ['*'], body: [[{
                                                ...donutContent,
                                                fillColor: C.cardBg,
                                            }]]
                                        },
                                        layout: { hLineWidth: () => 0.6, vLineWidth: () => 0.6, hLineColor: () => C.tableBorder, vLineColor: () => C.tableBorder },
                                    },

                                    // Ministry List Card
                                    {
                                        width: '50%',
                                        table: {
                                            widths: ['*'], body: [[{
                                                stack: [
                                                    { text: 'PESSOAL ADICIONAL', fontSize: 7, bold: true, color: C.sectionHeader, alignment: 'center', margin: [0, 8, 0, 8] },
                                                    {
                                                        ...ministryList(ministryItems),
                                                        margin: [8, 0, 8, 6],
                                                    },
                                                ],
                                                fillColor: C.cardBg,
                                            }]]
                                        },
                                        layout: { hLineWidth: () => 0.6, vLineWidth: () => 0.6, hLineColor: () => C.tableBorder, vLineColor: () => C.tableBorder },
                                        margin: [4, 0, 0, 0],
                                    },
                                ],
                                margin: [0, 0, 0, 5],
                            },

                            // === Row 3: Dark Totals Footer ===
                            {
                                columns: [
                                    // TOTAL GERAL (big)
                                    {
                                        width: '50%',
                                        table: {
                                            widths: ['*'], body: [[{
                                                stack: [
                                                    { text: 'TOTAL GERAL:', fontSize: 8, bold: true, color: '#94A3B8', alignment: 'center', margin: [0, 10, 0, 2] },
                                                    { text: String(mt.totalGeral), fontSize: 36, bold: true, color: C.textLight, alignment: 'center', margin: [0, 0, 0, 10] },
                                                ],
                                                fillColor: C.darkCard,
                                            }]]
                                        },
                                        layout: { hLineWidth: () => 0, vLineWidth: () => 0 },
                                    },
                                    // MÚSICOS + ORGANISTAS and TOTAL GERAL (smaller)
                                    {
                                        width: '50%',
                                        stack: [
                                            {
                                                table: {
                                                    widths: ['*'], body: [[{
                                                        stack: [
                                                            { text: 'MÚSICOS + ORGANISTAS:', fontSize: 7, bold: true, color: '#94A3B8', alignment: 'right', margin: [0, 6, 8, 0] },
                                                            { text: String(mt.musicosOrganistas), fontSize: 26, bold: true, color: C.textLight, alignment: 'right', margin: [0, 0, 8, 6] },
                                                        ],
                                                        fillColor: C.darkCard,
                                                    }]]
                                                },
                                                layout: { hLineWidth: () => 0, vLineWidth: () => 0 },
                                                margin: [4, 0, 0, 0],
                                            },
                                            {
                                                table: {
                                                    widths: ['*'], body: [[{
                                                        stack: [
                                                            { text: 'TOTAL GERAL:', fontSize: 6, bold: true, color: '#94A3B8', alignment: 'right', margin: [0, 4, 8, 0] },
                                                            { text: String(ft.total), fontSize: 20, bold: true, color: C.textLight, alignment: 'right', margin: [0, 0, 8, 4] },
                                                        ],
                                                        fillColor: C.darkCardAlt,
                                                    }]]
                                                },
                                                layout: { hLineWidth: () => 0, vLineWidth: () => 0 },
                                                margin: [4, 3, 0, 0],
                                            },
                                        ],
                                    },
                                ],
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
                table: { widths: ['*'], body: [[{
                    stack: [
                        { text: 'CONGREGAÇÃO CRISTÃ NO BRASIL', fontSize: 14, bold: true, color: C.titleColor, alignment: 'center', margin: [0, 10, 0, 3] },
                        { text: 'LISTA DE PRESENÇA', fontSize: 11, bold: true, color: C.subtitleColor, alignment: 'center', margin: [0, 0, 0, 2] },
                        { text: event.location, fontSize: 9, color: C.labelColor, alignment: 'center', margin: [0, 0, 0, 2] },
                        { text: `${event.day}${event.month ? ' de ' + event.month : ''}${event.time ? ' — ' + event.time : ''}`, fontSize: 8, color: C.labelColor, alignment: 'center', margin: [0, 0, 0, event.conductor ? 2 : 8] },
                        ...(event.conductor ? [{ text: `Maestro: ${event.conductor}`, fontSize: 8, color: C.labelColor, alignment: 'center' as const, margin: [0, 0, 0, 8] }] : []),
                    ],
                    fillColor: C.cardBg,
                }]] },
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
            table: { widths: ['*'], body: [[{
                stack: [
                    { text: 'CONGREGAÇÃO CRISTÃ NO BRASIL', fontSize: 14, bold: true, color: C.titleColor, alignment: 'center', margin: [0, 10, 0, 3] },
                    ...(congregationName ? [{ text: congregationName.toUpperCase(), fontSize: 9, bold: true, color: C.subtitleColor, alignment: 'center' as const, margin: [0, 0, 0, 2] }] : []),
                    { text: 'CRONOGRAMA DE ENSAIOS', fontSize: 11, bold: true, color: C.subtitleColor, alignment: 'center' as const, margin: [0, 0, 0, 2] },
                    { text: String(year), fontSize: 9, color: C.labelColor, alignment: 'center' as const, margin: [0, 0, 0, 8] },
                ],
                fillColor: C.cardBg,
            }]] },
            layout: { hLineWidth: () => 0, vLineWidth: () => 0 },
            margin: [0, 0, 0, 12],
        } as PdfContent,
    ];

    MONTHS_PT.forEach(month => {
        const monthEvents = byMonth[month];
        if (monthEvents.length === 0) return;

        // Month section header
        content.push({
            table: { widths: ['*'], body: [[{
                text: month.toUpperCase(),
                bold: true, fontSize: 9, alignment: 'center',
                fillColor: C.headerBar, color: C.sectionHeader,
                margin: [0, 4, 0, 4],
            }]] },
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
