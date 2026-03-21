import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { EventStatistic, Congregation, Anciao, STAT_INSTRUMENTS, MINISTRY_FIELDS } from '../types';
import { calcFamilyTotals, calcFamilyPercentages, calcMinistryTotals } from './orchestraCalculations';

// @ts-ignore - pdfmake font loading
pdfMake.vfs = pdfFonts?.pdfMake?.vfs || pdfFonts?.vfs || pdfFonts;

const YELLOW = '#FFF9C4';
const BLUE = '#BBDEFB';
const GREEN = '#C8E6C9';
const GRAY = '#EEEEEE';
const HEADER_BG = '#E0E0E0';

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

    // Build instrument rows
    const instrumentRows: any[][] = [];
    const addGroup = (family: keyof typeof STAT_INSTRUMENTS, color: string) => {
        STAT_INSTRUMENTS[family].forEach(inst => {
            const val = (stat as any)[inst.key] || 0;
            instrumentRows.push([
                { text: inst.label.toUpperCase(), fillColor: color, fontSize: 8, bold: true, margin: [2, 1] },
                { text: val || '', fillColor: color, fontSize: 8, alignment: 'center', margin: [2, 1] },
            ]);
        });
    };
    addGroup('cordas', YELLOW);
    addGroup('madeiras', BLUE);
    addGroup('metais', GREEN);
    addGroup('acordeon', GRAY);

    // Category summary table
    const categoryRows = [
        [
            { text: 'CATEGORIA', bold: true, alignment: 'center', fillColor: HEADER_BG, fontSize: 8 },
            { text: 'TOTAL', bold: true, alignment: 'center', fillColor: HEADER_BG, fontSize: 8 },
            { text: '% REAL', bold: true, alignment: 'center', fillColor: HEADER_BG, fontSize: 8 },
            { text: '% IDEAL', bold: true, alignment: 'center', fillColor: HEADER_BG, fontSize: 8 },
        ],
        [
            { text: 'CORDAS', bold: true, fillColor: YELLOW, fontSize: 8, alignment: 'center' },
            { text: String(ft.cordas), alignment: 'center', fontSize: 8 },
            { text: `${pct.cordas}%`, alignment: 'center', fontSize: 8, color: '#B71C1C' },
            { text: '50%', alignment: 'center', fontSize: 8 },
        ],
        [
            { text: 'MADEIRAS', bold: true, fillColor: BLUE, fontSize: 8, alignment: 'center' },
            { text: String(ft.madeiras), alignment: 'center', fontSize: 8 },
            { text: `${pct.madeiras}%`, alignment: 'center', fontSize: 8, color: '#B71C1C' },
            { text: '25%', alignment: 'center', fontSize: 8 },
        ],
        [
            { text: 'METAIS', bold: true, fillColor: GREEN, fontSize: 8, alignment: 'center' },
            { text: String(ft.metais), alignment: 'center', fontSize: 8 },
            { text: `${pct.metais}%`, alignment: 'center', fontSize: 8, color: '#B71C1C' },
            { text: '25%', alignment: 'center', fontSize: 8 },
        ],
        [
            { text: 'ACORDEON', bold: true, fontSize: 8, alignment: 'center' },
            { text: String(ft.acordeon), alignment: 'center', fontSize: 8 },
            { text: `${pct.acordeon}%`, alignment: 'center', fontSize: 8 },
            { text: '-', alignment: 'center', fontSize: 8 },
        ],
    ];

    // Ministry rows
    const ministryRows = MINISTRY_FIELDS.map(f => [
        { text: f.label.toUpperCase(), bold: true, fontSize: 8, margin: [2, 1] },
        { text: String((stat as any)[f.key] || 0), alignment: 'center', fontSize: 8, margin: [2, 1] },
    ]);
    // Add "Músicos + Organistas" row after Organistas (index 1)
    ministryRows.splice(2, 0, [
        { text: 'MÚSICOS + ORGANISTAS', bold: true, fontSize: 8, margin: [2, 1] },
        { text: String(mt.musicosOrganistas), alignment: 'center', fontSize: 8, bold: true, margin: [2, 1] },
    ]);

    const docDefinition: any = {
        pageSize: 'A4',
        pageMargins: [30, 30, 30, 30],
        content: [
            // Title
            { text: 'CONGREGAÇÃO CRISTÃ NO BRASIL', style: 'title', alignment: 'center' },
            { text: congregation?.name?.toUpperCase() || '', alignment: 'center', fontSize: 10, bold: true, margin: [0, 2] },
            { text: `${congregation?.city || ''} / ${congregation?.state || ''}`, alignment: 'center', fontSize: 9, italics: true },
            { text: 'ESTATÍSTICA - ENSAIO', alignment: 'center', fontSize: 9, bold: true, margin: [0, 4] },
            { text: eventDateFormatted, alignment: 'center', fontSize: 9, margin: [0, 0, 0, 10] },

            // Presidency
            {
                table: {
                    widths: ['*'],
                    body: [[{ text: 'PRESIDÊNCIA', bold: true, alignment: 'center', fillColor: HEADER_BG, fontSize: 9 }]],
                },
                margin: [0, 0, 0, 4],
            },
            {
                table: {
                    widths: ['30%', '70%'],
                    body: [
                        [{ text: 'ANCIÃO:', bold: true, fontSize: 8 }, { text: anciao?.name?.toUpperCase() || '', fontSize: 8 }],
                        [{ text: 'PALAVRA:', bold: true, fontSize: 8 }, { text: (stat.palavra || '').toUpperCase(), fontSize: 8 }],
                        [{ text: 'HINO ABERTURA:', bold: true, fontSize: 8 }, { text: String(stat.hino_abertura || ''), fontSize: 8 }],
                        [{ text: 'HINOS ENSAIADOS:', bold: true, fontSize: 8 }, { text: String(stat.hinos_ensaiados || ''), fontSize: 8 }],
                    ],
                },
                margin: [0, 0, 0, 10],
            },

            // Orchestral Formation Header
            {
                table: {
                    widths: ['*'],
                    body: [[{ text: 'FORMAÇÃO ORQUESTRAL', bold: true, alignment: 'center', fillColor: HEADER_BG, fontSize: 9 }]],
                },
                margin: [0, 0, 0, 4],
            },

            // Two-column layout: instruments + category summary
            {
                columns: [
                    {
                        width: '45%',
                        table: {
                            widths: ['*', 60],
                            headerRows: 1,
                            body: [
                                [
                                    { text: 'INSTRUMENTOS', bold: true, fillColor: HEADER_BG, fontSize: 8, alignment: 'center' },
                                    { text: 'QUANTIDADE', bold: true, fillColor: HEADER_BG, fontSize: 8, alignment: 'center' },
                                ],
                                ...instrumentRows,
                            ],
                        },
                    },
                    {
                        width: '55%',
                        stack: [
                            {
                                table: {
                                    widths: ['*', 50, 50, 50],
                                    body: categoryRows,
                                },
                                margin: [8, 0, 0, 10],
                            },
                            // Ministry table
                            {
                                table: {
                                    widths: ['*', 60],
                                    body: [
                                        [
                                            { text: 'MINISTÉRIO', bold: true, fillColor: HEADER_BG, fontSize: 8, colSpan: 2, alignment: 'center' }, {},
                                        ],
                                        ...ministryRows,
                                    ],
                                },
                                margin: [8, 0, 0, 6],
                            },
                            // Total Geral
                            {
                                table: {
                                    widths: ['*', 60],
                                    body: [
                                        [
                                            { text: 'TOTAL GERAL', bold: true, fontSize: 10, alignment: 'center', fillColor: HEADER_BG },
                                            { text: String(mt.totalGeral), bold: true, fontSize: 12, alignment: 'center' },
                                        ],
                                    ],
                                },
                                margin: [8, 0, 0, 0],
                            },
                        ],
                    },
                ],
            },
        ],
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
